import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { COLLEGES, TOPICS } from "@/lib/constants";
import {
  searchProfessors,
  saveProfessorEmail,
  type ProfessorResult,
} from "@/lib/openalex.functions";
import { generateEmailDraft, addSentEmail } from "@/lib/email.functions";
import { getProfile, type ProfileData } from "@/lib/profile.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acharyudu — Find Professors, Copy a Personalized Draft" },
      {
        name: "description",
        content:
          "Search machine learning professors by school, generate a personalized outreach draft, and copy it into your own email.",
      },
      { property: "og:title", content: "Acharyudu — Find Professors, Copy a Personalized Draft" },
      {
        property: "og:description",
        content:
          "Search machine learning professors by school, generate a personalized outreach draft, and copy it into your own email.",
      },
    ],
  }),
  component: SearchAndSend,
});

function SearchAndSend() {
  const search = useServerFn(searchProfessors);
  const saveEmail = useServerFn(saveProfessorEmail);
  const draft = useServerFn(generateEmailDraft);

  const [college, setCollege] = useState<string>(COLLEGES[0].name);
  const [topic, setTopic] = useState<string>(TOPICS[0].name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profs, setProfs] = useState<ProfessorResult[]>([]);
  const [sentNames, setSentNames] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | {
    prof: ProfessorResult;
    subject: string;
    body: string;
    to: string;
    generating: boolean;
    copying: boolean;
  }>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("acharyudu_sent_emails");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{ professor_name: string; recipient_email: string }>;
      const s = new Set<string>();
      for (const r of parsed) {
        if (r.professor_name) s.add(r.professor_name.toLowerCase());
        if (r.recipient_email) s.add(r.recipient_email.toLowerCase());
      }
      setSentNames(s);
    } catch {
      // ignore
    }
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setProfs([]);
    try {
      const results = await search({ data: { collegeName: college, topicName: topic } });
      setProfs(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function openDraft(p: ProfessorResult) {
    const profile: ProfileData = getProfile();
    setModal({ prof: p, subject: "", body: "", to: p.email, generating: true, copying: false });
    try {
      const d = await draft({
        data: {
          data: {
            professor_name: p.name,
            paper_title: p.latest_paper_title,
            paper_abstract: p.latest_paper_abstract,
            topic: p.topic,
          },
          profile,
        },
      });
      setModal((m) => (m ? { ...m, subject: d.subject, body: d.body, generating: false } : m));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setModal(null);
    }
  }

  async function handleCopy() {
    if (!modal) return;
    if (!modal.to) {
      setError("Enter a recipient email.");
      return;
    }

    const profile = getProfile();
    if (!profile.first_name) {
      setError("Please fill out your info on the My Info tab first.");
      return;
    }

    setModal({ ...modal, copying: true });
    try {
      if (modal.to !== modal.prof.email) {
        await saveEmail({ data: { openalex_id: modal.prof.openalex_id, email: modal.to } });
        setProfs((ps) =>
          ps.map((x) => (x.openalex_id === modal.prof.openalex_id ? { ...x, email: modal.to } : x)),
        );
      }

      const full = `To: ${modal.to}\nSubject: ${modal.subject}\n\n${modal.body}`;
      await navigator.clipboard.writeText(full);

      addSentEmail({
        professor_name: modal.prof.name,
        institution: modal.prof.institution,
        recipient_email: modal.to,
        subject: modal.subject,
        body: modal.body,
        paper_cited: modal.prof.latest_paper_title,
      });

      setSentNames((s) => new Set(s).add(modal.prof.name.toLowerCase()));
      toast.success("Email copied to clipboard!");
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setModal((m) => (m ? { ...m, copying: false } : m));
    }
  }

  return (
    <div className="bg-paper min-h-screen">
      {/* ── Page Header ── */}
      <section className="section-wash px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <h1
            className="text-[60px] leading-[1] tracking-[-0.03em] font-medium text-graphite animate-in-up"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            Search &amp; Send
          </h1>
          <p
            className="mt-3 text-[17px] leading-[1.3] tracking-[-0.01em] text-stone animate-in-up-delay"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            Pick a topic and school, generate a personalized draft, then copy it to your own email.
          </p>

          {/* Filter row */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-end gap-[6px] animate-in-up-delay-2">
            <label className="flex flex-col gap-[6px]">
              <span
                className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                Topic
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="sharp-select min-w-[200px]"
              >
                {TOPICS.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-[6px]">
              <span
                className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                College
              </span>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="sharp-select min-w-[200px]"
              >
                {COLLEGES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="pill-btn"
            >
              {loading ? "Searching…" : "Find Professors"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Results Section ── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          {error && (
            <div className="mb-8 sharp-card" style={{ borderColor: "rgba(220,38,38,0.3)", background: "rgba(220,38,38,0.03)" }}>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-[6px]">
            {profs.map((p, i) => {
              const isSent =
                sentNames.has(p.name.toLowerCase()) ||
                (p.email && sentNames.has(p.email.toLowerCase()));
              return (
                <div
                  key={p.openalex_id}
                  className="sharp-card flex items-start justify-between gap-4"
                  style={{ animationDelay: `${i * 60}ms`, animation: "card-enter 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards", opacity: 0 }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[18px] font-medium text-graphite tracking-[-0.03em]"
                        style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                      >
                        {p.name}
                      </span>
                      {isSent && (
                        <span className="inline-flex items-center gap-[4px]" style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", color: "var(--color-ember-orange)" }}>
                          <span className="ember-dot" />
                          Copied
                        </span>
                      )}
                    </div>
                    <div
                      className="mt-[6px] text-[14px] uppercase tracking-[-0.01em] text-ash"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 500 }}
                    >
                      {p.institution} · {p.topic}
                    </div>
                    {p.latest_paper_title && (
                      <div className="mt-3 text-[17px] leading-[1.3] tracking-[-0.01em]" style={{ fontFamily: "var(--font-die-grotesk-b)" }}>
                        <span className="text-stone">
                          Top paper{p.latest_paper_year ? ` (${p.latest_paper_year})` : ""}:
                        </span>{" "}
                        <span className="italic text-graphite">{p.latest_paper_title}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openDraft(p)}
                    className={isSent ? "pill-btn-outline shrink-0" : "pill-btn shrink-0"}
                    style={isSent ? {} : { background: "var(--color-graphite)" }}
                  >
                    {isSent ? "Draft again" : "Generate draft"}
                  </button>
                </div>
              );
            })}
            {!loading && profs.length === 0 && (
              <div className="py-16 text-center">
                <p
                  className="text-[17px] text-stone tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                >
                  No results yet. Pick filters and click Find Professors.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="text-[18px] font-medium text-graphite tracking-[-0.03em]"
                    style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                  >
                    Review email to {modal.prof.name}
                  </h2>
                  <p
                    className="mt-[4px] text-[12px] uppercase tracking-[-0.01em] text-ash"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 500 }}
                  >
                    {modal.prof.institution}
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="text-stone hover:text-graphite text-xl leading-none transition-colors"
                  style={{ transition: "color 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
                >
                  ×
                </button>
              </div>

              {modal.generating ? (
                <div className="py-12 text-center">
                  <p
                    className="text-[17px] text-stone tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-die-grotesk-b)" }}
                  >
                    Generating personalized draft…
                  </p>
                </div>
              ) : (
                <>
                  <label className="flex flex-col gap-[6px]">
                    <span
                      className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      To
                    </span>
                    <div className="flex gap-[6px]">
                      <input
                        type="email"
                        value={modal.to}
                        onChange={(e) => setModal({ ...modal, to: e.target.value })}
                        placeholder="professor@university.edu"
                        className="sharp-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!modal.to) return;
                          try {
                            await saveEmail({
                              data: { openalex_id: modal.prof.openalex_id, email: modal.to },
                            });
                            setProfs((ps) =>
                              ps.map((x) =>
                                x.openalex_id === modal.prof.openalex_id
                                  ? { ...x, email: modal.to }
                                  : x,
                              ),
                            );
                            setModal((m) =>
                              m ? { ...m, prof: { ...m.prof, email: modal.to } } : m,
                            );
                          } catch (e) {
                            setError(e instanceof Error ? e.message : String(e));
                          }
                        }}
                        className="pill-btn-outline shrink-0 text-xs"
                        style={{ padding: "10px 16px" }}
                      >
                        Save email
                      </button>
                    </div>
                  </label>

                  <label className="flex flex-col gap-[6px]">
                    <span
                      className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      Subject
                    </span>
                    <input
                      value={modal.subject}
                      onChange={(e) => setModal({ ...modal, subject: e.target.value })}
                      className="sharp-input"
                    />
                  </label>

                  <label className="flex flex-col gap-[6px]">
                    <span
                      className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      Body
                    </span>
                    <textarea
                      value={modal.body}
                      onChange={(e) => setModal({ ...modal, body: e.target.value })}
                      rows={16}
                      className="sharp-input text-[17px] leading-[1.3]"
                      style={{ resize: "vertical" }}
                    />
                  </label>

                  <div className="flex justify-end gap-[6px] pt-2">
                    <button onClick={() => setModal(null)} className="pill-btn-outline">
                      Cancel
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={modal.copying}
                      className="pill-btn"
                    >
                      {modal.copying ? "Copying…" : "Copy to clipboard"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
