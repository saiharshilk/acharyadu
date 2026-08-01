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

  // Load locally-cached sent names on the client.
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search & Send</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a topic and school, generate a personalized draft, then copy it to your own email.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="glass-input rounded-xl px-3 py-2"
          >
            {TOPICS.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">College</span>
          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="glass-input rounded-xl px-3 py-2"
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
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Find Professors"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {profs.map((p) => {
          const isSent =
            sentNames.has(p.name.toLowerCase()) ||
            (p.email && sentNames.has(p.email.toLowerCase()));
          return (
            <div key={p.openalex_id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{p.name}</div>
                    {isSent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Copied
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.institution} · {p.topic}
                  </div>
                  {p.latest_paper_title && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Top paper{p.latest_paper_year ? ` (${p.latest_paper_year})` : ""}:
                      </span>{" "}
                      <span className="italic">{p.latest_paper_title}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openDraft(p)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${isSent ? "border bg-background hover:bg-accent" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {isSent ? "Draft again" : "Generate draft"}
                </button>
              </div>
            </div>
          );
        })}
        {!loading && profs.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No results yet. Pick filters and click Find Professors.
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">Review email to {modal.prof.name}</h2>
                  <p className="text-xs text-muted-foreground">{modal.prof.institution}</p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="text-muted-foreground hover:text-foreground text-xl leading-none"
                >
                  ×
                </button>
              </div>
              {modal.generating ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Generating personalized draft…
                </div>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">To</span>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={modal.to}
                        onChange={(e) => setModal({ ...modal, to: e.target.value })}
                        placeholder="professor@university.edu"
                        className="flex-1 glass-input rounded-xl px-3 py-2"
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
                        className="glass-panel rounded-xl px-3 py-2 text-xs hover:bg-white/60 dark:hover:bg-white/10"
                      >
                        Save email
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Save to cache the email without copying.
                    </span>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Subject</span>
                    <input
                      value={modal.subject}
                      onChange={(e) => setModal({ ...modal, subject: e.target.value })}
                      className="glass-input rounded-xl px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium">Body</span>
                    <textarea
                      value={modal.body}
                      onChange={(e) => setModal({ ...modal, body: e.target.value })}
                      rows={16}
                      className="glass-input rounded-xl px-3 py-2 text-sm"
                    />
                  </label>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setModal(null)}
                      className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={modal.copying}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
