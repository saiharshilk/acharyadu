import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSentEmails, type SentEmail } from "@/lib/email.functions";

export const Route = createFileRoute("/sent")({
  component: SentLog,
});

function SentLog() {
  const [rows, setRows] = useState<SentEmail[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setRows(getSentEmails());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sent Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Emails you copied from here. Saved locally in this browser.
        </p>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="text-sm text-muted-foreground">Nothing copied yet.</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {r.professor_name}{" "}
                  <span className="text-muted-foreground font-normal">· {r.institution}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.recipient_email} · {new Date(r.sent_at).toLocaleString()}
                </div>
                <div className="text-sm mt-1 truncate">{r.subject}</div>
              </div>
              <button
                onClick={() => setOpenId(openId === r.id ? null : r.id)}
                className="shrink-0 text-xs rounded-md border px-2 py-1 hover:bg-accent"
              >
                {openId === r.id ? "Hide" : "View"}
              </button>
            </div>
            {openId === r.id && (
              <pre className="mt-3 whitespace-pre-wrap text-xs bg-muted/40 p-3 rounded-md">
                {r.body}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
