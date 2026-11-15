param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
)

$ErrorActionPreference = 'Stop'

$backupFile = Get-Item -LiteralPath $BackupPath -ErrorAction Stop
if ($backupFile.PSIsContainer) {
  throw 'BackupPath must refer to a file.'
}

$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
if (-not $pgRestore) {
  throw 'The PostgreSQL command-line tool pg_restore is required and must be on PATH.'
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  throw 'The PostgreSQL command-line tool psql is required and must be on PATH.'
}

& $pgRestore.Source --list $backupFile.FullName *> $null
if ($LASTEXITCODE -ne 0) {
  throw "pg_restore could not validate the backup archive (exit code $LASTEXITCODE)."
}

$secureConnectionString = Read-Host 'Paste the PostgreSQL connection URL (input is hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnectionString)
$savedEnvironment = @{}
$environmentNames = @('PGHOST', 'PGPORT', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGSSLMODE')
foreach ($name in $environmentNames) {
  $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

try {
  $connectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  $databaseUri = $null
  if (-not [Uri]::TryCreate($connectionString, [UriKind]::Absolute, [ref]$databaseUri) -or
      $databaseUri.Scheme -notin @('postgres', 'postgresql')) {
    throw 'Enter a valid postgres:// or postgresql:// connection URL.'
  }

  $userInfoSeparator = $databaseUri.UserInfo.IndexOf(':')
  if ($userInfoSeparator -lt 1) {
    throw 'The connection URL must include a database username and password.'
  }

  $databaseName = [Uri]::UnescapeDataString($databaseUri.AbsolutePath.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($databaseName)) {
    throw 'The connection URL is missing its database name.'
  }

  $username = [Uri]::UnescapeDataString($databaseUri.UserInfo.Substring(0, $userInfoSeparator))
  $password = [Uri]::UnescapeDataString($databaseUri.UserInfo.Substring($userInfoSeparator + 1))
  if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrEmpty($password)) {
    throw 'The connection URL must include a non-empty username and password.'
  }

  [Environment]::SetEnvironmentVariable('PGHOST', $databaseUri.Host, 'Process')
  [Environment]::SetEnvironmentVariable('PGPORT', $(if ($databaseUri.IsDefaultPort) { '5432' } else { [string]$databaseUri.Port }), 'Process')
  [Environment]::SetEnvironmentVariable('PGUSER', $username, 'Process')
  [Environment]::SetEnvironmentVariable('PGDATABASE', $databaseName, 'Process')
  [Environment]::SetEnvironmentVariable('PGPASSWORD', $password, 'Process')

  $sslMode = $null
  foreach ($queryItem in $databaseUri.Query.TrimStart('?').Split([char[]]'&', [StringSplitOptions]::RemoveEmptyEntries)) {
    $parts = $queryItem.Split([char[]]'=', 2)
    if ([Uri]::UnescapeDataString($parts[0]) -eq 'sslmode' -and $parts.Count -eq 2) {
      $sslMode = [Uri]::UnescapeDataString($parts[1])
    }
  }
  [Environment]::SetEnvironmentVariable('PGSSLMODE', $null, 'Process')
  if ($sslMode) {
    if ($sslMode -notin @('disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full')) {
      throw "Unsupported sslmode in connection URL: $sslMode"
    }
    [Environment]::SetEnvironmentVariable('PGSSLMODE', $sslMode, 'Process')
  }

  Write-Host "Backup archive: $($backupFile.FullName)"
  Write-Host "Restore target: $($databaseUri.Host):$([Environment]::GetEnvironmentVariable('PGPORT', 'Process'))/$databaseName"
  $hasPublicObjects = & $psql.Source --no-password --tuples-only --no-align --dbname $databaseName --command "SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f'));"
  if ($LASTEXITCODE -ne 0) {
    throw "Could not verify that the target database is empty (psql exit code $LASTEXITCODE)."
  }
  $publicObjectsResult = ($hasPublicObjects | Out-String).Trim()
  if ($publicObjectsResult -notin @('t', 'f')) {
    throw 'Could not determine whether the target database has public tables, views, or sequences.'
  }
  if ($publicObjectsResult -eq 't') {
    throw "The target database '$databaseName' already has public tables, views, or sequences. Restore only to a new, empty database."
  }

  Write-Warning 'Restore only into a new or empty database. Existing objects are not dropped; conflicts abort the restore.'
  $confirmation = Read-Host "Type the database name '$databaseName' to confirm"
  if ($confirmation -cne $databaseName) {
    throw 'Restore cancelled because the database name did not match.'
  }

  & $pgRestore.Source --no-password --single-transaction --exit-on-error --no-owner --no-acl --dbname $databaseName $backupFile.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore failed with exit code $LASTEXITCODE. The single transaction was rolled back."
  }

  Write-Host "Restore completed successfully to database '$databaseName'."
} finally {
  if ($bstr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
  $connectionString = $null
  $password = $null
  foreach ($name in $environmentNames) {
    [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process')
  }
}
