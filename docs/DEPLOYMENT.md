# Deployment and Google Drive authorization

1. Create a Google Cloud project. Enable the Google Drive API.
2. Configure the OAuth consent screen and create a Web OAuth client. Use a controlled administrator OAuth flow with `https://www.googleapis.com/auth/drive`, offline access and consent to obtain a refresh token for the account owning the storage folder. Use Google's OAuth Playground with **your own OAuth client credentials**, or your organization's approved OAuth setup. Set its authorized redirect URI to `https://developers.google.com/oauthplayground` if using Playground. Never share the refresh token or put it in this repository.
3. Store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` in the host's secret environment. OAuth testing-mode tokens can expire; complete your Google consent configuration for ongoing operation. A normal personal Drive requires user OAuth; a service account alone is not a substitute for a user's storage quota.
4. Configure `ADMIN_NAME`, a unique `ADMIN_PASSWORD` (8–72 UTF-8 bytes), and `APP_URL` as the real HTTPS root URL. Set `OWNER_EMAIL` to your owner identity. Bootstrap credentials are used only for an empty database. Existing Drive accounts are retained.
5. Build/run Docker with a persistent `/data` volume, secrets and one instance. Example:

```sh
docker build -t clinicavisamedical .
docker run --env-file .env -p 3000:3000 -v clinica-config:/data clinicavisamedical
```

6. In the app, Super Admin → Drive Storage → enter an empty private folder link. Alternatively set `DRIVE_FOLDER_ID` before first startup. Keep `/data/storage.json` across restarts so folder changes are restored. The startup bootstrap folder and the selected destination must remain accessible to the authorized account.
7. Create staff accounts and tablet/room links. Test a synthetic patient, signature, sample ticks, passport upload, PDF download, Admin sharing and restart before using real records.

The Drive API receives private state JSON and blob files, all stored inside the selected folder. No public sharing permissions are created. Choose a folder whose existing permissions match the hospital's access requirements. Retain independent backups of the Drive state file before migration or major upgrades. A single-instance container avoids multiple servers overwriting the same Drive state file. Horizontal scaling and cross-instance locking require a separate persistence design.

GitHub Actions runs tests on pushes. Hosting deployment is separate; this repository does not contain Google credentials or create a cloud host automatically.
