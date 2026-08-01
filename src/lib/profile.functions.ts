export type ProfileData = {
  first_name: string;
  last_name: string;
  grade: string;
  location: string;
  affiliation: string;
  current_project: string;
  linkedin_url: string;
  personal_site: string;
  email: string;
};

export const EMPTY_PROFILE: ProfileData = {
  first_name: "",
  last_name: "",
  grade: "",
  location: "",
  affiliation: "",
  current_project: "",
  linkedin_url: "",
  personal_site: "",
  email: "",
};

const STORAGE_KEY = "acharyudu_profile";

export function getProfile(): ProfileData {
  if (typeof window === "undefined") return { ...EMPTY_PROFILE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export function saveProfile(data: ProfileData): { ok: true } {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return { ok: true };
}
