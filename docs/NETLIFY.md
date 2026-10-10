# Netlify deployment

Import this GitHub repository into Netlify. Keep `netlify.toml` settings: publish `public`, build `npm test`, Node 22. Enable Netlify Database in Data & Storage if automatic provisioning has not created it. The migration creates one coordination row; it stores only the Drive folder ID, current snapshot file ID, and revision. Patient records, staff password hashes, documents and signatures stay in private Google Drive snapshots.

Set these as private Netlify environment variables marked **Contains secret values**, with values only for the **Production** deploy context. Select Functions-only scope if the plan supports it; the free plan uses its available secret scopes:

* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`: authorized Google account with write access to the dedicated folder. Do not commit these to GitHub or paste them in chat.
* `DRIVE_FOLDER_ID`: dedicated empty folder ID for the first startup.
* `ADMIN_NAME`, `ADMIN_PASSWORD`: initial Super Admin username/password, entered privately by the owner. They apply only when no snapshot exists.
* `APP_URL`: final production site URL, including https.

Redeploy after setting environment variables. `/healthz` reports whether the required Drive variables exist; it does not prove OAuth validity. Verify login, create a test patient, save, check today's Sample/X-Ray queues, sign using the paired tablet, download PDF, then verify after a fresh function instance. No patient migration has occurred merely by deploying the repository.

## Storage and concurrent updates

Each successful mutation creates a new immutable Drive snapshot. An atomic PostgreSQL revision update selects the winning snapshot. A concurrent writer gets HTTP 409 instead of replacing another user's update. A failed Drive upload leaves the selected snapshot unchanged. A failed response after committing may require checking the latest record before retrying. Warm instances reuse loaded data when the pointer revision is unchanged; another instance's successful save invalidates that cache on the next request. Calls within one instance are serialized.

Super Admin can change the storage folder through Drive Storage. The target must be empty; all existing runtime records are copied into a new snapshot and the pointer is updated atomically. The selection survives instance restarts without local disk. Back up the pointer row along with Drive snapshots. Do not create a new empty pointer against an occupied folder: the app intentionally refuses startup rather than hiding or overwriting existing hospital records.

Deploy previews and branch deployments cannot use hospital storage. They must use an isolated test project/folder for functional testing. Keep production secrets limited to production. No folders are made public by this app.

## Free plan limits

Netlify's free plan has monthly usage limits; it is not unlimited. Frequent polling, functions, database compute, bandwidth, builds, and immutable snapshot retention consume resources. Cold starts and Drive writes have network latency. Files must be smaller than 2.8 MB through this serverless adapter. Retained snapshots consume Google Drive quota; review retention and backups before sustained clinic operation. Do not upgrade to a paid plan without the owner's approval.

This is an alternative adapter; the single-instance Node/Docker deployment still works with its original canonical snapshot format. Do not run those adapters simultaneously against the same folder.
