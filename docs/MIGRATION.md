# Move the existing Apps Script data

1. Back up the old private Drive database. Keep the old system available until migration is verified.
2. Ensure the old Super Admin has a working username/password.
3. Add `docs/ExportMigration.gs` temporarily to the **existing** Apps Script project. Run `exportForGitHubMigration` as the owner. It logs a private Drive link to `clinicavisamedical-migration.json`. Download that JSON. Dates are normalized; existing case, register, signature, passport and account IDs are retained.
4. Deploy the new server and connect an empty private Drive folder using Super Admin → Drive Storage.
5. Before creating any patients, choose the migration JSON in Drive Storage → **Import records**. Import is blocked if the new patient database is not empty. It imports old staff credentials, so sign in afterwards with the **old** Super Admin username/password.
6. Verify patient counts, historical dates, companies, room ticks, PDFs and attached signatures/passports. New tablet and room links use the configured `APP_URL`; replace bookmarked old Apps Script URLs.
7. Pause entry in the old system during final migration to avoid two systems diverging. Remove the private migration JSON from downloads when your verification is finished; never commit it to GitHub.

The importer is Super Admin only. It validates the state format, rolls back failed imports, and writes to Drive before reporting success. Old exports remain in the old Drive as well as in the imported state; no source files are deleted.
