import { supabase } from "@/integrations/supabase/client";

export const track = (event: string, meta: Record<string, unknown> = {}) => {
  try {
    supabase.from("page_events").insert({
      event,
      path: window.location.pathname,
      meta,
    }).then(() => {});
  } catch (_) {
    // Tracking must never break the app
  }
};
