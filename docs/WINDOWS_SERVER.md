# Windows server: hospital Wi-Fi and remote access

Prepared configuration, not an already installed/live Windows server. This environment cannot operate the hospital PC directly.

## Prepare the PC

Use a dedicated always-on Windows PC with stable internet and disable sleep while plugged in. Install Node.js 22+ for all users from https://nodejs.org/ . Download/clone this repository to an administrator-controlled directory, e.g. C:\Clinica\clinicavisamedical. Do not put it inside OneDrive or a public network share. Restrict directory access to Administrators and SYSTEM, since the startup task executes its scripts as SYSTEM. Configure the private .env and .data permissions for those identities only.

Copy deploy/windows/windows.env.example to .env in the repository root and edit it privately. Set a unique administrator password and Google OAuth credentials per docs/DEPLOYMENT.md. Set APP_URL to the final public HTTPS address, not a GitHub repository URL. Patient data remains in the selected private Google Drive folder; .data retains folder selection. Preserve .env and .data during updates. Drive storage and API usage retain their own limits.

For an initial local check, run the following from the repository root (PowerShell):

```powershell
node --env-file=.env server/app.cjs
```

Open http://localhost:3000/healthz and http://localhost:3000/ on the server PC. Stop the foreground server before installing startup. In Administrator PowerShell, run:

```powershell
.\deploy\windows\Install-Startup.ps1
```

The scheduled task starts at boot and restarts the server after a crash. Scripts do not change Windows execution policy; if company policy blocks them, have IT approve/run the scripts. Do not disable security policies. Check the task in Task Scheduler and verify health after a reboot. Keep the PC on; internet/power outages interrupt remote access and Drive saves.

## One HTTPS address for every device

Use a named Cloudflare Tunnel, mapped to a hostname on a domain you control. An existing clinic domain/subdomain can be used if its administrator authorizes the DNS setup. Tunnel software is available on Windows; install it from Cloudflare's official source. In Cloudflare's dashboard create a tunnel, choose Windows, and install the connector as a Windows service using the dashboard's private instruction. The connector token must never be pasted into chat, committed or added to screenshots.

Route the public HTTPS hostname to HTTP service http://localhost:3000. Localhost traffic stays on the server PC; clients use HTTPS. Keep HOST=127.0.0.1; do not open port 3000 or add router port forwarding. Use the same HTTPS address on hospital Wi-Fi, mobile data and outside networks. This design uses internet even inside the hospital; it does not promise operation through an internet outage. A permanent named public hostname requires a domain configured with Cloudflare; Quick Tunnel random URLs are for testing only and are not the permanent deployment.

Set APP_URL to that hostname and restart the app task. If the GitHub Pages link must continue to be the entry, configure public/config.js to the HTTPS backend origin and publish only that nonsecret URL. Using the backend HTTPS root directly needs no frontend API change. App roles, staff passwords, tablet tokens and scoped room links still control access.

## Verify and maintain

Sign in as Super Admin; connect the private Drive folder. Test a synthetic patient from two receptionist sessions, today's Sample/Xray queues, room links, tablet applicant signature, passport page 2, PDF download and Admin sharing. Check both Wi-Fi and mobile data. Reboot the PC and verify the stored record and folder selection survive. Migrate real historical records only after those checks pass, using docs/MIGRATION.md.

Stop/start:

```powershell
Stop-ScheduledTask -TaskName ClinicaVisaMedical
Start-ScheduledTask -TaskName ClinicaVisaMedical
```

To update: stop the task, pull/extract the new code without overwriting .env or .data, run npm test, then start the task and verify health. Do not start a second app process pointing at the same Drive folder.

Cloudflare guide: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/get-started/create-remote-tunnel/
