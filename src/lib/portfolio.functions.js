import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
    const supabasePublic = createClient(process.env.SUPABASE_URL ?? "", key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: portfolio } = await supabasePublic
      .from("portfolios")
      .select("user_id, slug, headline, bio, location, accent, website, github, published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (!portfolio) return { portfolio: null, items: [], name: "" };

    const [{ data: items }, { data: profile }] = await Promise.all([
      supabasePublic
        .from("portfolio_items")
        .select("id, title, summary, role, stack, link, status, progress")
        .eq("user_id", portfolio.user_id)
        .eq("published", true)
        .order("position", { ascending: true }),
      supabasePublic
        .from("profiles")
        .select("display_name")
        .eq("id", portfolio.user_id)
        .maybeSingle(),
    ]);

    return { portfolio, items: items ?? [], name: profile?.display_name ?? "Nexus member" };
  });
