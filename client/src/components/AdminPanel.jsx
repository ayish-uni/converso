import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function AdminPanel({ token }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api
      .get("/chat/admin/reports", token)
      .then((data) => setReports(data.reports))
      .catch(() => setReports([]));
  }, [token]);

  async function updateStatus(reportId, status) {
    const data = await api.patch(`/chat/admin/reports/${reportId}`, { status }, token);
    setReports((current) => current.map((report) => (report._id === reportId ? data.report : report)));
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-converso-subtext">Moderation deck</p>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-converso-subtext">
          {reports.length}
        </span>
      </div>
      <div className="space-y-2">
        {reports.map((report) => (
          <div key={report._id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-white">{report.reportedUserId?.publicId}</strong>
              <span className="rounded-full border border-converso-gold/20 bg-converso-gold/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-converso-gold">
                {report.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-converso-subtext">{report.reason}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:border-converso-cyan/50"
                onClick={() => updateStatus(report._id, "reviewed")}
              >
                Mark reviewed
              </button>
              <button
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:border-converso-purple/50"
                onClick={() => updateStatus(report._id, "dismissed")}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
