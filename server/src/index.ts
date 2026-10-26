
import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 4000);

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    process.env.CLIENT_ORIGIN,
  ].filter((origin): origin is string => Boolean(origin))
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked this origin: ${origin}`));
      }
    },
  })
);

app.use(express.json({ limit: "20mb" }));

// Initialize SQLite.
const db = new Database("rescuecare.db");
db.pragma("journal_mode = WAL");

// Create the reports table if it does not exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    latitude REAL,
    longitude REAL,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  )
`);

// Add missing columns to an existing database.
const getReportColumns = () =>
  (db.prepare("PRAGMA table_info(reports)").all() as { name: string }[]);

let reportColumns = getReportColumns();

if (!reportColumns.some((column) => column.name === "latitude")) {
  db.exec("ALTER TABLE reports ADD COLUMN latitude REAL");
}

reportColumns = getReportColumns();

if (!reportColumns.some((column) => column.name === "longitude")) {
  db.exec("ALTER TABLE reports ADD COLUMN longitude REAL");
}

// Validation schemas.
const optionalCoordinate = z.number().finite().optional().nullable();

const reportSchema = z.object({
  incidentType: z.enum([
    "Road accident",
    "Fire outbreak",
    "Medical emergency",
    "Other",
  ]),
  description: z.string().max(2000).optional().default(""),
  latitude: optionalCoordinate,
  longitude: optionalCoordinate,
});

const statusSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"]),
});

// Root route.
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RescueCare API</title>
      </head>
      <body style="font-family:Arial,sans-serif;margin:40px;line-height:1.6">
        <h1>RescueCare API is running</h1>
        <p>Backend server is working.</p>
        <ul>
          <li><a href="/api/health">GET /api/health</a></li>
          <li><a href="/api/reports">GET /api/reports</a></li>
          <li>POST /api/reports</li>
          <li>PATCH /api/reports/:id/status</li>
        </ul>
      </body>
    </html>
  `);
});

// Health check.
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "RescueCare API",
    timestamp: new Date().toISOString(),
  });
});

// Create an incident report.
app.post("/api/reports", (req: Request, res: Response) => {
  const parsed = reportSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid report data",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { incidentType, description, latitude, longitude } = parsed.data;

  if (
    (latitude == null && longitude != null) ||
    (latitude != null && longitude == null)
  ) {
    res.status(400).json({
      error: "Latitude and longitude must both be provided, or both omitted.",
    });
    return;
  }

  try {
    const id = randomUUID();
    const submittedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO reports (
        id,
        incident_type,
        description,
        latitude,
        longitude,
        submitted_at,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      incidentType,
      description,
      latitude ?? null,
      longitude ?? null,
      submittedAt,
      "pending"
    );

    res.status(201).json({
      id,
      incidentType,
      description,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      submittedAt,
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to create report:", error);
    res.status(500).json({
      error: "Failed to save incident report",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// List incident reports.
app.get("/api/reports", (_req: Request, res: Response) => {
  try {
    const reports = db
      .prepare(`
        SELECT
          id,
          incident_type AS incidentType,
          description,
          latitude,
          longitude,
          submitted_at AS submittedAt,
          status
        FROM reports
        ORDER BY submitted_at DESC
      `)
      .all();

    res.status(200).json(reports);
  } catch (error) {
    console.error("Failed to retrieve reports:", error);
    res.status(500).json({ error: "Failed to retrieve reports" });
  }
});

// Update an incident report's status.
app.patch("/api/reports/:id/status", (req: Request, res: Response) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid status",
      allowedStatuses: ["pending", "verified", "rejected"],
    });
    return;
  }

  try {
    const result = db
      .prepare("UPDATE reports SET status = ? WHERE id = ?")
      .run(parsed.data.status, req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.status(200).json({
      id: req.params.id,
      status: parsed.data.status,
      message: "Report status updated",
    });
  } catch (error) {
    console.error("Failed to update report:", error);
    res.status(500).json({ error: "Failed to update report status" });
  }
});

// Handle unknown routes.
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    message: "Check the URL and HTTP method.",
  });
});

// Handle malformed JSON, CORS errors, and unexpected errors.
app.use(
  (
    error: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (error instanceof SyntaxError && error.status === 400) {
      res.status(400).json({ error: "Invalid JSON request body" });
      return;
    }

    if (error.message.startsWith("CORS blocked this origin:")) {
      res.status(403).json({ error: error.message });
      return;
    }

    console.error("Unexpected server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  console.log(`RescueCare API running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log("Allowed frontend origins:", [...allowedOrigins]);
});
