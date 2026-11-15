param(
  [string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $OutputDirectory = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'WatraBackups'
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
if (-not $pgDump -or -not $pgRestore) {
  throw 'PostgreSQL command-line tools pg_dump and pg_restore are required and must be on PATH.'
}

$secureConnectionString = Read-Host 'Paste the PostgreSQL connection URL (input is hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnectionString)
$backupPath = $null
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

  if (-not (Test-Path -LiteralPath $OutputDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
  }

  $safeDatabaseName = $databaseName -replace '[^A-Za-z0-9._-]', '_'
  $timestamp = (Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss')
  $backupPath = Join-Path (Resolve-Path -LiteralPath $OutputDirectory).Path "$safeDatabaseName-$timestamp.dump"

  Write-Host "Creating database backup at $backupPath"
  & $pgDump.Source --no-password --format=custom --no-owner --no-acl --file $backupPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed with exit code $LASTEXITCODE."
  }

  & $pgRestore.Source --list $backupPath *> $null
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore could not validate the backup archive (exit code $LASTEXITCODE)."
  }

  $backup = Get-Item -LiteralPath $backupPath
  Write-Host "Backup completed and validated ($([Math]::Round($backup.Length / 1MB, 2)) MB)."
} catch {
  if ($backupPath -and (Test-Path -LiteralPath $backupPath -PathType Leaf)) {
    Remove-Item -LiteralPath $backupPath -Force
  }
  throw
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
