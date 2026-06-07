import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeView } from "@/components/HomeView";
import { FormView, type FormAnswers } from "@/components/FormView";
import { LoadingView } from "@/components/LoadingView";
import { ResultsView } from "@/components/ResultsView";
import { TokenStore } from "@/components/TokenStore";
import { getMockReport } from "@/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type View = "home" | "form" | "loading" | "results" | "store";
type Report = ReturnType<typeof getMockReport>;

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

const initialAnswers: FormAnswers = {
  selectedIdea: null, customIdea: "", ideaDescription: "", country: "", businessType: null, tone: null, background: "", budget: null, hours: null, experience: null, goal: null,
};

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [report, setReport] = useState<Report | null>(null);
  const [checking, setChecking] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/app/auth"); return; }
      const admin = data.session.user.email === ADMIN_EMAIL;
      setIsAdmin(admin);
      if (!admin) await refreshTokenBalance(data.session.user.id);
      setChecking(false);

      // Handle Stripe checkout success
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "success") {
        window.history.replaceState({}, "", "/app");
        toast({ title: "Payment successful! 🎉", description: "Your tokens have been credited." });
        if (!admin) await refreshTokenBalance(data.session.user.id);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/app/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const refreshTokenBalance = async (userId: string) => {
    const { data } = await supabase.from("token_balance").select("balance").eq("user_id", userId).single();
    setTokenBalance(data?.balance ?? 0);
  };

  if (checking) return null;

  const ideaName = answers.selectedIdea ?? answers.customIdea.trim();

  const handleSubmit = async () => {
    if (!ideaName) return;

    // Admin bypasses token check entirely
    if (!isAdmin && tokenBalance !== null && tokenBalance <= 0) {
      setView("store"); return;
    }

    setView("loading");

    try {
      const { data, error } = await supabase.functions.invoke("generate-blueprint", { body: { answers } });
      if (error) throw error;
      if (data?.error === "NO_TOKENS" && !isAdmin) { setView("store"); return; }
      if (data?.error) throw new Error(data.error);
      if (!data?.report) throw new Error("No plan returned");

      setReport(data.report as Report);
      if (!isAdmin) {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) await refreshTokenBalance(session.session.user.id);
      }
      setView("results");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast({ title: "Could not generate your blueprint", description: msg, variant: "destructive" });
      setView("home");
    }
  };

  const handleStartOver = () => { setAnswers(initialAnswers); setReport(null); setView("home"); };

  if (!isAdmin && view === "store") return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm"><TokenStore onClose={() => setView("home")} /></div>
    </div>
  );

  if (view === "home") return <HomeView onStart={() => setView("form")} tokenBalance={isAdmin ? null : tokenBalance} isAdmin={isAdmin} />;
  if (view === "form") return <FormView answers={answers} setAnswers={setAnswers} onBack={() => setView("home")} onSubmit={handleSubmit} />;
  if (view === "loading") return <LoadingView />;
  if (view === "results" && report) return (
    <ResultsView ideaName={ideaName} answers={answers} report={report} onStartOver={handleStartOver} isPaid={true} />
  );

  return <HomeView onStart={() => setView("form")} tokenBalance={isAdmin ? null : tokenBalance} isAdmin={isAdmin} />;
};

export default Index;
