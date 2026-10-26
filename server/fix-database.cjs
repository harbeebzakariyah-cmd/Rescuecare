
const Database = require("better-sqlite3");

const db = new Database("rescuecare.db");

try {
  db.pragma("foreign_keys = OFF");
  db.pragma("wal_checkpoint(TRUNCATE)");

  db.transaction(() => {
    db.exec(`
      CREATE TABLE reports_new (
        id TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        latitude REAL,
        longitude REAL,
        submitted_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      );

      INSERT INTO reports_new (
        id, incident_type, description, latitude,
        longitude, submitted_at, status
      )
      SELECT
        id, incident_type, description, latitude,
        longitude, submitted_at, status
      FROM reports;

      DROP TABLE reports;

      ALTER TABLE reports_new RENAME TO reports;
    `);
  })();

  console.log("Database fixed successfully!");
  console.log(
    db.pragma("table_info(reports)")
      .filter(c => c.name === "latitude" || c.name === "longitude")
  );
} catch (error) {
  console.error("Database fix failed:", error);
} finally {
  db.close();
}
