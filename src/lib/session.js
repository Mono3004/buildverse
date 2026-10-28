import { useEffect, useState } from "react";

export const CURSOR_COLORS = [
  "#C9F227",
  "#4FD1C5",
  "#F97C7C",
  "#8B8CF7",
  "#F7C948",
  "#5AC8FA",
  "#FF9F6E",
  "#B4F461",
];

export function colorForId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

const DEFAULT_PROFILE = {
  id: "u_demo",
  display_name: "Nexus Engineer",
  color: "#C9F227",
};

export function useSessionUser() {
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nexus_auth_token") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("nexus_user") : null;

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setProfile({
          id: u.id || "u_demo",
          display_name: u.name || "Nexus Engineer",
          color: colorForId(u.id || "u_demo"),
        });
      } catch (e) {
        setProfile(DEFAULT_PROFILE);
      }
    } else if (token) {
      setProfile(DEFAULT_PROFILE);
    } else {
      setProfile(DEFAULT_PROFILE);
    }
    setReady(true);
  }, []);

  return { session: { user: profile }, user: profile, profile, ready };
}
