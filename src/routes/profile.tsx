import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, saveProfile, type ProfileData, EMPTY_PROFILE } from "@/lib/profile.functions";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="glass-input rounded-xl px-3 py-2"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="glass-input rounded-xl px-3 py-2"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          These fields fill placeholders in every email draft. Saved locally in this browser.
        </p>
      </div>

      {!loaded && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First name"
          value={p.first_name}
          onChange={set("first_name")}
          placeholder="Jordan"
        />
        <Field
          label="Last name"
          value={p.last_name}
          onChange={set("last_name")}
          placeholder="Lee"
        />
        <Field
          label="Grade level"
          value={p.grade}
          onChange={set("grade")}
          placeholder="HS Junior"
        />
        <Field
          label="Location / school"
          value={p.location}
          onChange={set("location")}
          placeholder="Sacramento, CA"
        />
      </div>

      <Field
        label="Strongest current affiliation (one line, starts with a verb)"
        value={p.affiliation}
        onChange={set("affiliation")}
        placeholder="work with MIT CSAIL on X / am building Y"
        textarea
      />
      <Field
        label="Your current project blurb (used to relate to each professor's paper)"
        value={p.current_project}
        onChange={set("current_project")}
        placeholder="A short paragraph describing what you're actively working on and what you're curious about."
        textarea
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="LinkedIn URL"
          value={p.linkedin_url}
          onChange={set("linkedin_url")}
          placeholder="https://linkedin.com/in/..."
        />
        <Field
          label="Personal site"
          value={p.personal_site}
          onChange={set("personal_site")}
          placeholder="https://your-site.com"
        />
        <Field
          label="Your email"
          value={p.email}
          onChange={set("email")}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save
        </button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
