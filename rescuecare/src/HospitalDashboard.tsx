
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";

type Report = {
  id: string;
  incidentType: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  submittedAt: string;
  status: string;
};

const API_URL = "http://localhost:4000/api/reports";

function normalizeReport(item: unknown): Report | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const report = item as Record<string, unknown>;

  if (
    typeof report.id !== "string" ||
    typeof report.incidentType !== "string" ||
    typeof report.description !== "string" ||
    (report.latitude !== null &&
      typeof report.latitude !== "number") ||
    (report.longitude !== null &&
      typeof report.longitude !== "number") ||
    typeof report.submittedAt !== "string" ||
    typeof report.status !== "string"
  ) {
    return null;
  }

  return {
    id: report.id,
    incidentType: report.incidentType,
    description: report.description,
    latitude: report.latitude as number | null,
    longitude: report.longitude as number | null,
    submittedAt: report.submittedAt,
    status: report.status,
  };
}

export default function HospitalDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load reports from the server.");
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      const validReports = data
        .map(normalizeReport)
        .filter((report): report is Report => report !== null);

      setReports(validReports);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  async function updateStatus(
    id: string,
    status: "verified" | "rejected"
  ) {
    setUpdatingId(id);
    setError("");

    try {
      // This URL matches the PATCH route in server/src/index.ts.
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          `Could not update report (${response.status}). ${
            message || "Please try again."
          }`
        );
      }

      // Reload reports after the server confirms the update.
      await fetchReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the report."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = reports.filter(
    (report) => report.status.toLowerCase() === "pending"
  ).length;

  const verifiedCount = reports.filter(
    (report) => report.status.toLowerCase() === "verified"
  ).length;

  const rejectedCount = reports.filter(
    (report) => report.status.toLowerCase() === "rejected"
  ).length;

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  }

  function statusClass(status: string) {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              RescueCare
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Hospital Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Review and manage submitted emergency reports.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchReports()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh reports
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-700">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Verified</p>
                <p className="text-2xl font-bold text-slate-900">
                  {verifiedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-3 text-red-700">
                <XCircle size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Rejected</p>
                <p className="text-2xl font-bold text-slate-900">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Emergency Reports
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {reports.length} report
                {reports.length === 1 ? "" : "s"} found
              </p>
            </div>
            <Activity size={22} className="text-blue-700" />
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-10 text-center">
              <Activity
                size={36}
                className="mx-auto mb-3 text-slate-300"
              />
              <h3 className="font-semibold text-slate-800">
                No reports yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Submitted emergency reports will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reports.map((report) => (
                <article key={report.id} className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {report.incidentType}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-slate-600">
                        {report.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-5">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={16} />
                      {formatDate(report.submittedAt)}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} />
                      {report.latitude !== null &&
                      report.longitude !== null
                        ? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`
                        : "Location not provided"}
                    </span>
                  </div>

                  {report.latitude !== null &&
                    report.longitude !== null && (
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
                      >
                        View incident location
                        <ExternalLink size={14} />
                      </a>
                    )}

                  {report.status.toLowerCase() === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          void updateStatus(report.id, "verified")
                        }
                        disabled={updatingId !== null}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle size={16} />
                        {updatingId === report.id
                          ? "Updating..."
                          : "Verify report"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void updateStatus(report.id, "rejected")
                        }
                        disabled={updatingId !== null}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        {updatingId === report.id
                          ? "Updating..."
                          : "Reject report"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
