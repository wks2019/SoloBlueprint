import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HomeView } from "@/components/HomeView";
import { FormView, type FormAnswers } from "@/components/FormView";
import { ResultsView } from "@/components/ResultsView";
import { TokenStore } from "@/components/TokenStore";
import { getMockReport } from "@/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type View = "home" | "form" | "results" | "store";
type Report = ReturnType<typeof getMockReport>;

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

const initialAnswers: FormAnswers = {
  selectedIdea: null, customIdea: "", ideaDescription: "", country: "", businessType: null, tone: null, background: "", budget: null, hours: null, experience: null, goal: null,
};

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [report, setReport] = useState<Partial<Report>>({});
  const [generating, setGenerating] = useState(false);
  const [chunksComplete, setChunksComplete] = useState(0);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const blueprintIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/app/auth"); return; }
      const admin = data.session.user.email === ADMIN_EMAIL;
      setIsAdmin(admin);
      if (!admin) await refreshTokenBalance(data.session.user.id);
      setChecking(false);

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

  const saveBlueprint = async (fullReport: Record<string, unknown>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) { console.warn("No userId for save"); return null; }
      const idea = answers.selectedIdea ?? answers.customIdea.trim();
      const { data: saved, error: saveErr } = await supabase.from("blueprints").insert({
        user_id: userId,
        idea_name: idea,
        answers,
        report: fullReport,
      }).select("id").single();
      if (saveErr) console.error("Blueprint save error:", saveErr);
      return saved?.id ?? null;
    } catch (e) { console.error("Blueprint save exception:", e); return null; }
  };

  const fetchRoadmap = async (bpId?: string | null) => {
    if (roadmapLoading) return;
    setRoadmapLoading(true);
    try {
      const country = answers.country?.trim() || "United Kingdom";
      const businessType = answers.businessType || "online";
      const idea = (answers.selectedIdea ?? answers.customIdea ?? "").trim();
      const useBpId = bpId !== undefined ? bpId : blueprintIdRef.current;
      console.log("Fetching roadmap for:", idea, "bpId:", useBpId);
      const { data: rmData, error: rmErr } = await supabase.functions.invoke("generate-roadmap", {
        body: { ideaName: idea, country, businessType, tone: answers.tone, blueprintId: useBpId },
      });
      if (rmErr) { console.error("Roadmap invoke error:", rmErr); return; }
      console.log("Roadmap result:", rmData?.roadmap ? "SUCCESS" : "NO ROADMAP", rmData);
      if (rmData?.roadmap) {
        setReport(prev => ({ ...prev, roadmap: rmData.roadmap }));
      }
    } catch (e) { console.error("Roadmap fetch error:", e); }
    finally { setRoadmapLoading(false); }
  };

  const handleSubmit = async () => {
    if (!ideaName) return;
    if (!isAdmin && tokenBalance !== null && tokenBalance <= 0) { setView("store"); return; }

    // Deduct token + reset state
    setReport({});
    setChunksComplete(0);
    setBlueprintId(null);
    blueprintIdRef.current = null;
    setGenerating(true);
    setView("results");

    try {
      // Fire all 4 chunks sequentially — chunk 0 handles token deduction
      let mergedReport: Record<string, unknown> = {};

      for (let i = 0; i < 4; i++) {
        const { data: chunkData, error: chunkError } = await supabase.functions.invoke("generate-blueprint-chunk", {
          body: { answers, chunkIndex: i, deductToken: i === 0 },
        });
        if (chunkError) throw chunkError;
        if (chunkData?.error === "NO_TOKENS" && !isAdmin) { setView("store"); setGenerating(false); return; }
        if (chunkData?.error) throw new Error(chunkData.error);
        if (chunkData?.sections) {
          mergedReport = { ...mergedReport, ...chunkData.sections };
          setReport(prev => ({ ...prev, ...chunkData.sections }));
          setChunksComplete(i + 1);
        }
      }

      if (!isAdmin) {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) await refreshTokenBalance(session.session.user.id);
      }

      setGenerating(false);

      // Save full blueprint
      const bpId = await saveBlueprint(mergedReport);
      if (bpId) {
        setBlueprintId(bpId);
        blueprintIdRef.current = bpId;
      }

      // Generate roadmap in background — always fire, bpId may be null
      fetchRoadmap(bpId ?? null);

    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      console.error("Generation error:", e);
      toast({ title: "Could not generate your blueprint", description: msg, variant: "destructive" });
      setGenerating(false);
      setView("form");
    }
  };

  const handleStartOver = () => {
    setAnswers(initialAnswers);
    setReport({});
    setBlueprintId(null);
    blueprintIdRef.current = null;
    setChunksComplete(0);
    setGenerating(false);
    setRoadmapLoading(false);
    setView("home");
  };

  if (!isAdmin && view === "store") return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm"><TokenStore onClose={() => setView("home")} /></div>
    </div>
  );

  if (view === "home") return <HomeView onStart={() => setView("form")} tokenBalance={isAdmin ? null : tokenBalance} isAdmin={isAdmin} />;
  if (view === "form") return <FormView answers={answers} setAnswers={setAnswers} onBack={() => setView("home")} onSubmit={handleSubmit} />;

  if (view === "results") return (
    <ResultsView
      ideaName={ideaName}
      answers={answers}
      report={report as Report}
      onStartOver={handleStartOver}
      isPaid={true}
      generating={generating}
      chunksComplete={chunksComplete}
      roadmapLoading={roadmapLoading}
      onFetchRoadmap={() => fetchRoadmap()}
    />
  );

  return <HomeView onStart={() => setView("form")} tokenBalance={isAdmin ? null : tokenBalance} isAdmin={isAdmin} />;
};

export default Index;
