import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, saveProfile, type ProfileData, EMPTY_PROFILE } from "@/lib/profile.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Info — Acharyudu" },
      {
        name: "description",
        content:
          "Save your name, grade, school and current project so every professor draft is personalized.",
      },
      { property: "og:title", content: "My Info — Acharyudu" },
      {
        property: "og:description",
        content:
          "Save your name, grade, school and current project so every professor draft is personalized.",
      },
    ],
  }),
  component: ProfilePage,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  name: string;
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span
        className="text-[12px] uppercase tracking-[-0.01em] font-semibold text-graphite"
        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
      >
        {label}
      </span>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="sharp-input"
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="sharp-input"
        />
      )}
    </label>
  );
}

function ProfilePage() {
  const [p, setP] = useState<ProfileData>(EMPTY_PROFILE);
  const [status, setStatus] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setP(getProfile());
    setLoaded(true);
  }, []);

  async function handleSave() {
    setStatus(null);
    try {
      saveProfile(p);
      setStatus("Saved.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not save.");
    }
  }

  const set = (k: keyof ProfileData) => (v: string) => setP((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="bg-paper min-h-screen">
      {/* Page header */}
      <section className="section-wash px-4 py-16">
        <div className="mx-auto max-w-[1200px]">
          <h1
            className="text-[60px] leading-[1] tracking-[-0.03em] font-medium text-graphite animate-in-up"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            My Info
          </h1>
          <p
            className="mt-3 text-[17px] leading-[1.3] tracking-[-0.01em] text-stone animate-in-up-delay"
            style={{ fontFamily: "var(--font-die-grotesk-b)" }}
          >
            These fields fill placeholders in every email draft. Saved locally in this browser.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-[1200px] space-y-[18px]">
          {!loaded && (
            <p className="text-[17px] text-stone" style={{ fontFamily: "var(--font-die-grotesk-b)" }}>
              Loading…
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <Field label="First name" name="first_name" value={p.first_name} onChange={set("first_name")} placeholder="Jordan" />
            <Field label="Last name" name="last_name" value={p.last_name} onChange={set("last_name")} placeholder="Lee" />
            <Field label="Grade level" name="grade" value={p.grade} onChange={set("grade")} placeholder="HS Junior" />
            <Field label="Location / school" name="location" value={p.location} onChange={set("location")} placeholder="Sacramento, CA" />
          </div>

          <Field
            label="Strongest current affiliation (one line, starts with a verb)"
            name="affiliation"
            value={p.affiliation}
            onChange={set("affiliation")}
            placeholder="work with MIT CSAIL on X / am building Y"
            textarea
          />
          <Field
            label="Your current project blurb (used to relate to each professor's paper)"
            name="current_project"
            value={p.current_project}
            onChange={set("current_project")}
            placeholder="A short paragraph describing what you're actively working on and what you're curious about."
            textarea
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <Field label="LinkedIn URL" name="linkedin_url" value={p.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/..." />
            <Field label="Personal site" name="personal_site" value={p.personal_site} onChange={set("personal_site")} placeholder="https://your-site.com" />
            <Field label="Your email" name="email" value={p.email} onChange={set("email")} placeholder="you@example.com" />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <button onClick={handleSave} className="pill-btn">
              Save
            </button>
            {status && (
              <span
                className="text-[14px] uppercase tracking-[-0.01em] text-stone"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 500 }}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
