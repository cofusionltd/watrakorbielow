<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Watra Korbielów

Watra Production

## Run locally

Requirements: Node.js and PostgreSQL.

1. Copy `.env.example` to `.env` and configure the app and migration PostgreSQL credentials.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The server listens on `process.env.PORT`, defaulting to `8080` for Northflank and Heroku Cloud Native Buildpacks. The buildpack runs `npm run build` during build and `npm start` to launch the built server. Set `PORT=3000` locally if you prefer the previous local port.

The server applies Drizzle migrations with `SQL_ADMIN_USER` and uses `SQL_USER` for application reads and writes. It imports initial room, CMS, settings, discount, campaign, knowledge-base, and bundled-media data into PostgreSQL on startup. PostgreSQL is required; the server does not serve mutable application data from an in-memory or file-based fallback.

PostgreSQL TCP connections explicitly use IPv4. For hosted databases, `DATABASE_URL` must resolve to an IPv4 address; if a provider offers both direct and pooler endpoints, use its IPv4-compatible endpoint.

Generate a migration after changing `src/db/schema.ts` with `npm run db:generate`. New generated migrations are applied automatically at the next server startup.

## Create a manual local database backup

On Windows, install the PostgreSQL client tools and ensure they are on `PATH` (`pg_dump` and `pg_restore` for backups; `psql` is also required for restores). If the database is only reachable through Northflank, start the addon port forward first and keep its terminal open.

Run `.\scripts\backup-database.ps1` from PowerShell. Paste the PostgreSQL connection URL at the hidden prompt; it is not saved in the script or printed. The script creates and validates a custom-format dump under `Documents\WatraBackups` by default. An optional output directory can be passed as `-OutputDirectory`. Keep these backup files private and store a separate copy if you need protection from desktop failure.

To test or restore a backup, first create a new empty PostgreSQL database and make sure the destination database URL points to it. Then run `.\scripts\restore-database.ps1 -BackupPath "<path-to-backup.dump>"`. The script validates the archive, prompts for the destination URL without displaying it, checks that the target has no tables, views, or sequences in the `public` schema, and requires you to type the exact destination database name. It never drops existing objects; `pg_restore` runs in a single transaction, so conflicts or errors roll back the restore. Do not use a production database as a restore test target.

## Roll back an application deployment

Northflank deploys `main` automatically. To roll back an application change, identify the bad commit from the Northflank deployment history, then create a new revert commit and merge it through the normal pull-request checks. This keeps Git and the deployed source in sync without rewriting protected history.

For a regular commit, run these commands from a fresh clone or an up-to-date checkout in PowerShell, replacing `<bad-commit>` with the deployed commit SHA and `<rollback-branch>` with a new branch name:

```powershell
git fetch origin
git switch -c <rollback-branch> origin/main
git revert --no-edit <bad-commit>
git push -u origin <rollback-branch>
```

Open a pull request from the rollback branch to `main`. After required CI checks pass, merge it; Northflank will build and deploy the revert commit. If the bad change was introduced by a merge commit, use `git revert --no-edit -m 1 <merge-commit>` instead of `git revert --no-edit <bad-commit>` to revert that merge relative to its first parent. If Git reports conflicts, stop and resolve them carefully before pushing; never force-push or reset protected `main`.

This rolls back application code only, not PostgreSQL changes. Reverting code does not undo schema/data migrations, and an older app may not work with a newer database schema. Before a migration that removes or changes existing data/schema, take and validate a backup and plan a compatible forward migration; do not assume an application rollback also restores the database. The database restore script is intended for a new empty database, not direct production rollback.

The local configuration in `.env.example` uses database `watra` on `127.0.0.1:5432`. The current local PostgreSQL cluster stores its files in `C:/laragon/data/postgresql`; check a cluster's actual location with `SHOW data_directory;`. Application records are stored in `reservations`, `rooms`, `guest_profiles`, `guest_messages`, `promotions`, `discount_codes`, `media_assets`, `cms_content`, `site_settings`, `ai_knowledge`, `visitor_sessions`, `chat_sessions`, and `users`. Image bytes are stored in `media_assets.data`; CMS content and settings are stored in PostgreSQL JSONB columns.

## Manage website images

1. Open the admin panel and choose **Zarządzanie Treścią (CMS)**.
2. Open the **Zdjęcia** tab. The library lists the bundled and uploaded images stored in PostgreSQL.
3. Select an image, or use **Edytuj** on its tile to select it in the editor.
4. Choose a replacement from the image selector, or use **Wgraj zdjęcie** to upload an image. Uploaded image bytes are stored in the `media_assets` table.
5. Choose **Zamień zdjęcie**, then **Zapisz w CMS** to publish the change. The image mapping is stored with the CMS content in PostgreSQL.
6. Use **Usuń ze strony** to hide an image without deleting it, and **Przywróć** to undo that. Uploaded files can be deleted from the library when no page, room, or campaign uses them.

Changes to room photos can also be made in the admin **Pokoje** manager. Uploaded files and replacement mappings are served from PostgreSQL, not from local image-file writes.
