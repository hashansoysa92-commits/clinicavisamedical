# Clinica Visa Medical — HTML + Node + Google Drive

The existing Visa Medical workflows now run as an HTML/JavaScript frontend with a Node.js API. Google Apps Script is not needed for normal operation. The existing forms, page order, permissions, staff accounts, tablet applicant signatures, daily patient and room queues, autosave, PDF download and Admin WhatsApp sharing are preserved.

## Run

Use Node 22 or newer. No npm runtime dependencies are needed.

```sh
npm test
node --env-file=.env server/app.cjs
```

Copy `.env.example` to `.env` and set a unique initial `ADMIN_NAME` / `ADMIN_PASSWORD`, your actual HTTPS `APP_URL`, and the Google credentials described in [deployment](docs/DEPLOYMENT.md). First startup creates the Super Admin; subsequent startup loads the stored accounts from Drive. Keep the same dedicated Drive folder across deployments.

Sign in as Super Admin → **Drive Storage** → paste a writable Google Drive folder link → **Connect folder**. Patient creation remains blocked until Drive is connected. Admin and Front Office cannot change storage settings. Switching to a new empty folder copies the current state; existing destination data is never overwritten.

## Hosting

Deploy the Dockerfile on a Node/container host with HTTPS and a persistent `/data` volume. Set the environment variables as hosting secrets. Run **one server instance**: it serializes mutations, retains hot records in RAM, and acknowledges saves only after Drive commits them. Files over 100 KB are uploaded once by content hash and reused; only state metadata is rewritten for subsequent saves. RAM is a cache; Drive is the durable store. The frontend and API are served together.

GitHub is the source repository, not the medical database. **GitHub Pages alone cannot run the private Node API.** Do not upload `.env`, credentials, patient data, exports or migration files to this repository. Historical filled registers and source spreadsheets are not included; the bundled PDFs and page images are blank form templates.

## Existing records

Follow [migration](docs/MIGRATION.md) before entering patients in the new system. This is a new runtime and will not automatically read the old Apps Script spreadsheet database.

## Validation and limits

`npm test` covers accounts, role access, patient saves, room queues, ticks, deletion, restart restore, failed persistence rollback, Excel output, private API routing and Drive folder validation. External Drive operations and live tablet/browser behavior still require verification with the deployed credentials. Saves depend on Drive connectivity and network latency; this does not promise instantaneous remote persistence. OAuth email-code recovery from Apps Script is replaced by username/password access. Runtime business rules retain a compatibility layer for the prior data model, so existing fields stay aligned.
