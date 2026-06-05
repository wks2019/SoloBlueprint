import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeView } from "@/components/HomeView";
import { FormView, type FormAnswers } from "@/components/FormView";
import { LoadingView } from "@/components/LoadingView";
import { ResultsView } from "@/components/ResultsView";
import { getMockReport } from "@/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type View = "home" | "form" | "loading" | "results";
type Report = ReturnType<typeof getMockReport>;

const initialAnswers: FormAnswers = {
  selectedIdea: null,
  customIdea: "",
  budget: null,
  hours: null,
  experience: null,
  goal: null,
};

const FREE_LIMIT = 1;

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [report, setReport] = useState<Report | null>(null);
  const [checking, setChecking] = useState(true);
  const [blueprintCount, setBlueprintCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/auth"); return; }
      // Count blueprints for this user
      const { count } = await supabase
        .from("blueprints")
        .select("id", { count: "exact", head: true })
        .eq("user_id", data.session.user.id);
      setBlueprintCount(count ?? 0);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;

  const ideaName = answers.selectedIdea ?? answers.customIdea.trim();
  const isFirstBlueprint = blueprintCount < FREE_LIMIT;

  const handleSubmit = async () => {
    if (!ideaName) return;
    setView("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-blueprint", {
        body: { answers },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.report) throw new Error("No plan returned");
      setReport(data.report as Report);
      setBlueprintCount((c) => c + 1);
      // First blueprint = full access, subsequent = locked
      setIsPaid(isFirstBlueprint);
      setView("results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast({ title: "Could not generate your blueprint", description: `${msg}. Showing a sample plan instead.`, variant: "destructive" });
      setReport(getMockReport(answers.selectedIdea ?? ""));
      setIsPaid(isFirstBlueprint);
      setView("results");
    }
  };

  const handleStartOver = () => {
    setAnswers(initialAnswers);
    setReport(null);
    setView("home");
  };

  if (view === "home") return <HomeView onStart={() => setView("form")} blueprintCount={blueprintCount} />;

  if (view === "form") {
    return (
      <FormView
        answers={answers}
        setAnswers={setAnswers}
        onBack={() => setView("home")}
        onSubmit={handleSubmit}
      />
    );
  }

  if (view === "loading") return <LoadingView />;

  if (view === "results" && report) {
    return (
      <ResultsView
        ideaName={ideaName}
        answers={answers}
        report={report}
        onStartOver={handleStartOver}
        isPaid={isPaid}
      />
    );
  }

  return <HomeView onStart={() => setView("form")} blueprintCount={blueprintCount} />;
};

export default Index;
