<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Watra Korbielów

## Run locally

Requirements: Node.js and PostgreSQL.

1. Copy `.env.example` to `.env` and configure the app and migration PostgreSQL credentials.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The server applies Drizzle migrations with `SQL_ADMIN_USER` and uses `SQL_USER` for application reads and writes. It imports initial room, CMS, settings, discount, campaign, knowledge-base, and bundled-media data into PostgreSQL on startup. PostgreSQL is required; the server does not serve mutable application data from an in-memory or file-based fallback.

PostgreSQL TCP connections explicitly use IPv4. For hosted databases, `DATABASE_URL` must resolve to an IPv4 address; if a provider offers both direct and pooler endpoints, use its IPv4-compatible endpoint.

Generate a migration after changing `src/db/schema.ts` with `npm run db:generate`. New generated migrations are applied automatically at the next server startup.

The local configuration in `.env.example` uses database `watra` on `127.0.0.1:5432`. The current local PostgreSQL cluster stores its files in `C:/laragon/data/postgresql`; check a cluster's actual location with `SHOW data_directory;`. Application records are stored in `reservations`, `rooms`, `guest_profiles`, `guest_messages`, `promotions`, `discount_codes`, `media_assets`, `cms_content`, `site_settings`, `ai_knowledge`, `visitor_sessions`, `chat_sessions`, and `users`. Image bytes are stored in `media_assets.data`; CMS content and settings are stored in PostgreSQL JSONB columns.

## Manage website images

1. Open the admin panel and choose **Zarządzanie Treścią (CMS)**.
2. Open the **Zdjęcia** tab. The library lists the bundled and uploaded images stored in PostgreSQL.
3. Select an image, or use **Edytuj** on its tile to select it in the editor.
4. Choose a replacement from the image selector, or use **Wgraj zdjęcie** to upload an image. Uploaded image bytes are stored in the `media_assets` table.
5. Choose **Zamień zdjęcie**, then **Zapisz w CMS** to publish the change. The image mapping is stored with the CMS content in PostgreSQL.
6. Use **Usuń ze strony** to hide an image without deleting it, and **Przywróć** to undo that. Uploaded files can be deleted from the library when no page, room, or campaign uses them.

Changes to room photos can also be made in the admin **Pokoje** manager. Uploaded files and replacement mappings are served from PostgreSQL, not from local image-file writes.
