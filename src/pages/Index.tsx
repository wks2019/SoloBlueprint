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

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [report, setReport] = useState<Report | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/auth");
      else setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;

  const ideaName = answers.selectedIdea ?? answers.customIdea.trim();

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
      setView("results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      console.error("generate-blueprint failed:", e);
      toast({
        title: "Could not generate your blueprint",
        description: `${msg}. Showing a sample plan instead.`,
        variant: "destructive",
      });
      setReport(getMockReport(answers.selectedIdea ?? ""));
      setView("results");
    }
  };

  const handleStartOver = () => {
    setAnswers(initialAnswers);
    setReport(null);
    setView("home");
  };

  if (view === "home") return <HomeView onStart={() => setView("form")} />;

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
      />
    );
  }

  return <HomeView onStart={() => setView("form")} />;
};

export default Index;
