# Oracle Always Free deployment

Status: deployment files are prepared; no Oracle server or Google OAuth connection has been provisioned yet.

## Account and server

Create your own Oracle Cloud Free Tier account. Identity/card verification and acceptance of Oracle's agreement must be completed by the account owner. Choose only resources explicitly marked Always Free eligible in your home region; keep total compute/storage within the current console limits. Do not upgrade to paid or use trial-only resources for this deployment.

Create one Ubuntu VM (prefer Ampere A1 when available). Keep the SSH private key private. Permit HTTPS/HTTP on TCP 443/80; restrict SSH TCP 22 to your administrator IP. Do not expose port 3000. Always Free capacity is not guaranteed and idle servers can be reclaimed; Google Drive remains the durable patient store.

Install Docker Engine and its Compose plugin from Docker's official Ubuntu instructions: https://docs.docker.com/engine/install/ubuntu/ . The supplied image supports ARM64 and AMD64. Point a DNS hostname you control to the server IP; an existing/free DNS hostname is sufficient for Caddy's HTTPS. No paid domain is required by this configuration.

## Private configuration

On the server:

```sh
git clone https://github.com/hashansoysa92-commits/clinicavisamedical.git
cd clinicavisamedical
cp .env.example .env
chmod 600 .env
```

Edit `.env` privately. Set `PUBLIC_HOST` to the DNS hostname (no scheme or path), `APP_URL` to its full HTTPS URL, a unique `ADMIN_PASSWORD`, and the three Google OAuth credentials from docs/DEPLOYMENT.md. Never paste credentials into chat, source files, screenshots or GitHub. Optional `DRIVE_FOLDER_ID` selects the initial private folder. Otherwise Super Admin can select the folder after signing in. Keep the authorized Drive folder and OAuth identity consistent across restarts.

## Start and update

From the repository root:

```sh
docker compose --env-file .env -f deploy/oracle/compose.yaml config --quiet
docker compose --env-file .env -f deploy/oracle/compose.yaml up -d --build
```

Run exactly one app container. Named volumes retain selected folder configuration and HTTPS certificates. Do not use `down -v`, which removes them. To update, `git pull --ff-only`, then run the same compose up command; keep `.env` and volumes. No scheduled keep-alive traffic is included.

Open APP_URL for the full application; frontend/API share one HTTPS origin. For the existing GitHub Pages interface set `window.CLINICA_API_BASE` in public/config.js to APP_URL's origin, then commit only that nonsecret change. Backend FRONTEND_ORIGINS already allows the Pages origin.

## Verify before real use

Check `/healthz`, sign in, connect Drive, and create a synthetic patient. Check today's patient/sample/Xray queues, a second named receptionist session, a tablet signature, passport page 2, PDF download and Admin sharing. Restart the app container and verify the synthetic record survives. Import old records only using docs/MIGRATION.md. These are required live checks, not claims that deployment is already complete.

Oracle reference: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
