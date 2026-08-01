CREATE TABLE public.professors_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openalex_id TEXT UNIQUE,
  name TEXT NOT NULL,
  institution TEXT,
  topic TEXT,
  email TEXT,
  latest_paper_title TEXT,
  latest_paper_abstract TEXT,
  latest_paper_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professors_cache TO anon, authenticated;
GRANT ALL ON public.professors_cache TO service_role;
ALTER TABLE public.professors_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professors are publicly readable" ON public.professors_cache FOR SELECT USING (true);
CREATE INDEX professors_cache_inst_topic_idx ON public.professors_cache (institution, topic);