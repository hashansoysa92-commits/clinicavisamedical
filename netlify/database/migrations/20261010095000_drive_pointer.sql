-- Coordination metadata only. Hospital records and login hashes stay in Drive.
CREATE TABLE IF NOT EXISTS clinica_drive_pointer (
 id integer PRIMARY KEY CHECK (id = 1),
 revision bigint NOT NULL DEFAULT 0,
 folder text,
 file_id text
);
