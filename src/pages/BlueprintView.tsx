import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ResultsView } from "@/components/ResultsView";

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

const BlueprintView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<{ idea_name: string; report: Record<string, unknown>; answers: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });

    if (!id) { setError(true); setLoading(false); return; }
    supabase
      .from("blueprints")
      .select("idea_name, report, answers")
      .eq("id", id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError(true);
        else setBlueprint(data as typeof blueprint);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading blueprint…</p>
    </div>
  );

  if (error || !blueprint) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-xl text-foreground">Blueprint not found</p>
      <button onClick={() => navigate("/")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Build your own →
      </button>
    </div>
  );

  return (
    <ResultsView
      ideaName={blueprint.idea_name}
      answers={blueprint.answers as never}
      report={blueprint.report as never}
      onStartOver={() => isAdmin ? navigate("/app/admin") : navigate("/")}
      isPaid={true}
      isShared={!isAdmin}
    />
  );
};

export default BlueprintView;
