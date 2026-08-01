import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSentEmails, type SentEmail } from "@/lib/email.functions";

export const Route = createFileRoute("/sent")({
  head: () => ({
    meta: [
      { title: "Sent Log — Acharyudu" },
      {
        name: "description",
        content: "Every professor outreach draft you have copied, kept locally on this device.",
      },
      { property: "og:title", content: "Sent Log — Acharyudu" },
      {
        property: "og:description",
        content: "Every professor outreach draft you have copied, kept locally on this device.",
      },
    ],
  }),
  component: SentLog,
});

function SentLog() {
  const [rows, setRows] = useState<SentEmail[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setRows(getSentEmails());
  }, []);

  return (
    <div className="bg-paper min-h-screen">
      {/* Page header */}
      <section className="section-wash px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <h1
            className="text-[60px] leading-[1] tracking-[-0.03em] font-medium text-graphite animate-in-up"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            Sent Log
          </h1>
          <p
            className="mt-3 text-[17px] leading-[1.3] tracking-[-0.01em] text-stone animate-in-up-delay"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            Emails you copied from here. Saved locally in this browser.
          </p>
        </div>
      </section>

      {/* Entries */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-[1200px] space-y-[6px]">
          {rows.length === 0 && (
            <div className="py-16 text-center">
              <p
                className="text-[17px] text-stone tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-die-grotesk-b)" }}
              >
                Nothing copied yet.
              </p>
            </div>
          )}
          {rows.map((r, i) => (
            <div
              key={r.id}
              className="sharp-card"
              style={{ animationDelay: `${i * 60}ms`, animation: "card-enter 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards", opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div
                    className="text-[18px] font-medium text-graphite tracking-[-0.03em]"
                    style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                  >
                    {r.professor_name}{" "}
                    <span className="text-stone font-normal">
                      · {r.institution}
                    </span>
                  </div>
                  <div
                    className="mt-[6px] text-[12px] uppercase tracking-[-0.01em] text-ash"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 500 }}
                  >
                    {r.recipient_email} · {new Date(r.sent_at).toLocaleString()}
                  </div>
                  <div
                    className="mt-2 text-[17px] leading-[1.3] tracking-[-0.01em] text-stone truncate"
                    style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                  >
                    {r.subject}
                  </div>
                </div>
                <button
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  className="pill-btn-outline shrink-0 text-xs"
                  style={{ padding: "7px 16px", fontSize: "12px" }}
                >
                  {openId === r.id ? "Hide" : "View"}
                </button>
              </div>
              {openId === r.id && (
                <pre
                  className="mt-4 whitespace-pre-wrap text-[14px] leading-[1.3] text-graphite bg-fog p-4"
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    borderRadius: "0px",
                  }}
                >
                  {r.body}
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
