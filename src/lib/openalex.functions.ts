import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ProfessorResult = {
  openalex_id: string;
  name: string;
  institution: string;
  topic: string;
  latest_paper_title: string;
  latest_paper_abstract: string;
  latest_paper_year: number | null;
  email: string;
};

export const searchProfessors = createServerFn({ method: "POST" })
  .inputValidator((d: { collegeName: string; topicName: string }) => d)
  .handler(async ({ data }): Promise<ProfessorResult[]> => {
    const { data: rows, error } = await supabaseAdmin
      .from("professors_cache")
      .select("*")
      .eq("institution", data.collegeName)
      .eq("topic", data.topicName)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      openalex_id: r.openalex_id ?? r.id,
      name: r.name,
      institution: r.institution ?? data.collegeName,
      topic: r.topic ?? data.topicName,
      latest_paper_title: r.latest_paper_title ?? "",
      latest_paper_abstract: r.latest_paper_abstract ?? "",
      latest_paper_year: r.latest_paper_year,
      email: r.email ?? "",
    }));
  });

export const saveProfessorEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { openalex_id: string; email: string }) => d)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("professors_cache")
      .update({ email: data.email })
      .eq("openalex_id", data.openalex_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
