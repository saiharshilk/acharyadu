import { createServerFn } from "@tanstack/react-start";
import type { ProfileData } from "@/lib/profile.functions";

export type DraftInput = {
  professor_name: string;
  paper_title: string;
  paper_abstract: string;
  topic: string;
};

export type Draft = { subject: string; body: string };

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export type DraftRequest = {
  data: DraftInput;
  profile: ProfileData;
};

export const generateEmailDraft = createServerFn({ method: "POST" })
  .inputValidator((d: DraftRequest) => d)
  .handler(async ({ data }): Promise<Draft> => {
    const { data: draftInput, profile } = data;

    if (!profile || !profile.first_name) {
      throw new Error("Please fill out your info on the My Info tab first.");
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const profFirst = firstName(draftInput.professor_name);
    const profLast = lastName(draftInput.professor_name);

    const systemPrompt = `You are drafting a cold research inquiry email from a student to a professor. Use ONLY the template structure the user provides. Fill in placeholders. Keep tone respectful and concise. Do not invent facts about the student or the professor. Base "one specific thing" strictly on the provided paper abstract. Base "one sentence on what you are doing that relates" on the student's current project blurb combined with the paper. Return valid JSON only.`;

    const userPrompt = `STUDENT INFO:
Name: ${profile.first_name} ${profile.last_name}
Grade: ${profile.grade}
Location/School: ${profile.location}
Strongest current affiliation/project (one line): ${profile.affiliation}
Their broader current project/work: ${profile.current_project}
LinkedIn: ${profile.linkedin_url}
Personal site/email: ${profile.personal_site || profile.email}
Interested-in keyword: ${draftInput.topic}

PROFESSOR:
Name: Prof. ${profLast} (first name: ${profFirst})

PAPER:
Title: ${draftInput.paper_title}
Abstract: ${draftInput.paper_abstract || "(no abstract available — reference only by title in a general way)"}

TEMPLATE (subject then body — fill placeholders, keep formatting including blank lines):

SUBJECT: Research Inquiry: ${profile.first_name} ${profile.last_name} | ${profile.grade} interested in ${draftInput.topic}

BODY:
Dear Prof. ${profLast},

I am ${profile.first_name}, a ${profile.grade} from ${profile.location}. I currently ${profile.affiliation}.

I recently read your "${draftInput.paper_title}" — specifically, [ONE SPECIFIC METHOD, FINDING, OR QUESTION FROM THE ABSTRACT]. This connects to something I have been working on: [ONE SENTENCE RELATING THE STUDENT'S PROJECT TO THIS PAPER].

Would you be open to a brief 10-minute Zoom call to explore whether there might be a fit, or to share advice on where a student like me could contribute? I have attached my resume at your convenience.

Thank you for your time.

Respectfully,

${profile.first_name}
${profile.linkedin_url}
${profile.personal_site || profile.email}

Return JSON: {"subject": "...", "body": "..."}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`AI error ${resp.status}: ${t}`);
    }
    const j = await resp.json();
    const content = j.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    return { subject: parsed.subject || "", body: parsed.body || "" };
  });

export type SentEmail = {
  id: string;
  professor_name: string;
  institution: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  paper_cited: string | null;
  sent_at: string;
};

const SENT_KEY = "acharyudu_sent_emails";

export function getSentEmails(): SentEmail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SentEmail[];
  } catch {
    return [];
  }
}

export function addSentEmail(email: Omit<SentEmail, "id" | "sent_at">): SentEmail {
  const entry: SentEmail = {
    ...email,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    sent_at: new Date().toISOString(),
  };
  const updated = [entry, ...getSentEmails()];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SENT_KEY, JSON.stringify(updated));
  }
  return entry;
}
