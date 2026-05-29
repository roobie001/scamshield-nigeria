import { useState, useId, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  PhoneCall,
  Share2,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Info
} from "lucide-react";

// Typical Nigerian scam templates for quick pre-filling
interface PresetTemplate {
  id: string;
  label: string;
  scamType: string;
  source: string; // SMS, WhatsApp, Email, etc.
  text: string;
}

const PRESETS: PresetTemplate[] = [
  {
    id: "bvn_block",
    label: "BVN Blocked SMS",
    scamType: "Bank Verification Scam",
    source: "SMS",
    text: "Dear customer, your bank account BVN has been BLOCKED. To reactivate your account, reactivate online or call our customer card care support desk on 09071234567 immediately.",
  },
  {
    id: "fake_alert",
    label: "Fake Bank Credit SMS",
    scamType: "Fake Credit Alert",
    source: "SMS",
    text: "Credit Alert! Acct: *456 Amt: NGN 150,000.00 Desc: Transfer from OKAFOR CHIDI Bal: NGN 345,600.00. Confirm transactions by calling 08122334455.",
  },
  {
    id: "nnpc_job",
    label: "NNPC Job Offer Email",
    scamType: "Job Recruitment Fraud",
    source: "Email",
    text: "Congratulations! You have been selected for NNPC recruitment interview at Abuja Head Office on 31st May. A mandatory screening and tag fee of N15,500 is required. Pay to account 2003445566 (UBA) to confirm portal slot. Goodluck.",
  },
  {
    id: "glo_win",
    label: "Glo Promo Lottery",
    scamType: "Winner Promo Scam",
    source: "SMS / WhatsApp",
    text: "GLO COM OFFICE: Dear user, your active SIM has selected you to receive Star Promo Cash sum of ₦5,000,000 with a free brand new Toyota Hilux! To claim your cash prize, dial MTN agent OLUWASEUN on 08031122334. Token code GNG-009.",
  },
  {
    id: "crypto_double",
    label: "Double Cash Investment",
    scamType: "Ponzi / Crypto Scam",
    source: "WhatsApp",
    text: "Greetings my brother, are you tired of inflation? Double your savings with standard daily oil mining index. Invest 50,000 Naira and get 150,000 Naira back in just 2 hours! 100% SECURED AND GTRBANK REGISTERED. Telegram link: t.me/profitpremiumNG",
  },
];

interface AnalysisResult {
  verdict: "SCAM" | "SUSPICIOUS" | "SAFE";
  confidence: number;
  scamType: string;
  redFlags: string[];
  explanation: string;
  actionUrgency: "CRITICAL" | "CAUTION" | "NONE";
  safetyTips: string[];
}

export default function App() {
  const [inputText, setInputText] = useState<string>(PRESETS[0].text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Analyzing grammar...");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Form submission ID
  const analysisFormId = useId();

  // Handle preset selection
  const handleSelectPreset = (text: string) => {
    setInputText(text);
    setError(null);
  };

  // Perform dynamic analysis via Express server endpoint
  const handleAnalyse = async (e: FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === "") {
      setError("Please paste or type a message first.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    // Dynamic step labels for premium loading feel
    const steps = [
      "Securing connection path...",
      "Consulting Nigerian fraud database...",
      "Parsing linguistic patterns & phone numbers...",
      "Validating bank references...",
      "Finalizing Shield Report...",
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setLoadingStep(steps[stepIndex]);
      }
    }, 1100);

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Failed to process message.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(
        err.message || "An unexpected error occurred while calling the Scam Shield engine."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for status styling - customized for Geometric Balance high-contrast theme
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "SCAM":
        return {
          bg: "bg-red-50/70 border-red-200",
          text: "text-red-700",
          darkText: "text-red-900 border-red-100",
          badge: "px-4 py-1.5 rounded-full bg-red-100/90 text-red-700 font-black text-sm sm:text-base border border-red-200 uppercase tracking-tighter shadow-xs inline-block",
          accent: "#EF4444",
          icon: <ShieldAlert className="w-12 h-12 text-red-500 flex-shrink-0" />,
        };
      case "SUSPICIOUS":
        return {
          bg: "bg-yellow-50/70 border-yellow-200",
          text: "text-yellow-750",
          darkText: "text-yellow-900 border-yellow-101",
          badge: "px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-850 font-black text-sm sm:text-base border border-yellow-250 uppercase tracking-tighter shadow-xs inline-block",
          accent: "#F59E0B",
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500 flex-shrink-0" />,
        };
      default:
        return {
          bg: "bg-emerald-50/70 border-emerald-200",
          text: "text-emerald-700",
          darkText: "text-emerald-900 border-emerald-101",
          badge: "px-4 py-1.5 rounded-full bg-emerald-100 text-[#008751] font-black text-sm sm:text-base border border-emerald-200 uppercase tracking-tighter shadow-xs inline-block",
          accent: "#008751",
          icon: <ShieldCheck className="w-12 h-12 text-[#008751] flex-shrink-0" />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#008751]/25 selection:text-[#008751] flex flex-col justify-between">
      
      {/* Premium Header Section from Geometric Balance */}
      <header className="bg-[#008751] text-white py-6 px-4 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-lg text-[#008751] flex items-center justify-center shadow-xs">
            <Shield className="h-9 w-9 text-[#008751] fill-[#008751]/10" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">ScamShield Nigeria</h1>
            <p className="text-green-100 text-xs sm:text-sm opacity-90">Protecting Nigerians from digital scams</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono bg-white/20 px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/30 text-white font-semibold">
            Powered by Gemini AI
          </span>
        </div>
      </header>

      {/* Live Safety Announcement Bar */}
      <div className="bg-[#007043] text-white text-xs py-2 px-4 shadow-inner overflow-hidden border-t border-emerald-600/20">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <span className="flex-none font-bold bg-white/20 text-white px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
            Alert
          </span>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis flex-1 tracking-wide font-medium">
            🚨 2026 CYBER SAFETY ALERT: Banks will never request OTPs or BVN reactivation codes via SMS.
          </div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Intro Banner */}
        <div className="text-center sm:text-left bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-1000 tracking-tight">
            Verify Messages Instantaneously
          </h2>
          <p className="mt-1.5 text-slate-600 max-w-2xl text-xs sm:text-sm leading-relaxed font-light">
            Paste suspicious bank alerts, lottery text messages, job invitation emails, 
            or investment pitches. Our AI security inspector checks spelling anomalies, phone-number danger patterns, and cash demand tricks to shield your money.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Verification Panel and Presets */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Analyzer Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#008751]"></span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspicious Message</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold transition cursor-pointer"
                  >
                    Clear Area
                  </button>
                </div>

                <form id={analysisFormId} onSubmit={handleAnalyse} className="space-y-4">
                  <div className="relative">
                    <textarea
                      rows={6}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="E.g. Paste the SMS message copy or phishing email body text here..."
                      className="w-full text-slate-800 text-sm p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-[#008751] outline-hidden placeholder:text-slate-400 bg-slate-50 font-sans transition resize-none leading-relaxed"
                      maxLength={1500}
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono bg-white/70 px-1.5 py-0.5 rounded border border-slate-100">
                      {inputText.length}/1500 chars
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-xs text-red-800 font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-[#008751] hover:bg-[#006e42] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-900/10 uppercase tracking-widest text-xs cursor-pointer ${
                      isLoading ? "opacity-75 cursor-wait" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{loadingStep}</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 fill-current" />
                        <span>Analyse Now</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#008751]" />
                Select a Nigeria Scam preset to inspect
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset) => {
                  const isActive = inputText === preset.text;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.text)}
                      className={`text-left p-3.5 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? "bg-[#008751]/5 border-[#008751]/30 ring-1 ring-[#008751]"
                          : "bg-white border-slate-200 hover:border-[#008751]/30 hover:bg-slate-50/50 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-slate-800">{preset.label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-100">
                          {preset.source}
                        </span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 text-[11px] leading-relaxed mb-2 italic">
                        "{preset.text}"
                      </p>
                      <span className="text-[10px] font-medium text-[#008751] flex items-center gap-0.5">
                        Test This Preset <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Analysis Results or Security Educational corner */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[440px]"
                >
                  <div className="relative mb-6">
                    <span className="absolute inline-flex h-16 w-16 rounded-full bg-[#008751]/10 animate-ping"></span>
                    <div className="relative bg-[#008751]/15 p-4 rounded-full border border-[#008751]/35">
                      <Shield className="w-10 h-10 text-[#008751] animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">Inspecting Message Elements</h3>
                  <p className="text-slate-500 text-sm max-w-sm mt-2 font-light leading-relaxed">
                    The Gemini AI model is currently decoding vocabulary, grammar triggers, phone-number tags, 
                    and banking regulatory templates.
                  </p>
                  <p className="mt-8 text-xs text-[#008751] font-mono bg-[#008751]/5 px-4 py-2 rounded-full font-bold border border-[#008751]/15">
                    {loadingStep}
                  </p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-6"
                >
                  {/* Verdict Card - Styled strictly per Geometric Balance specification */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Flex justify-between layout */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Analysis Verdict</h2>
                          <div className="flex items-center gap-2">
                            <span className={getVerdictStyle(result.verdict).badge}>
                              {result.verdict} DETECTED
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Scam Type</h2>
                          <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 block sm:inline-block uppercase tracking-wide">
                            {result.scamType}
                          </span>
                        </div>
                      </div>

                      {/* Confidence score block with border container and large typography */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence Score</span>
                          <span className="text-2xl font-black" style={{ color: getVerdictStyle(result.verdict).accent }}>
                            {result.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full"
                            style={{ backgroundColor: getVerdictStyle(result.verdict).accent }}
                          />
                        </div>
                      </div>

                      {/* Action Threat Level Badge */}
                      <div className="mb-6 p-3 rounded-lg border flex items-center justify-between text-xs" style={{ borderColor: getVerdictStyle(result.verdict).accent + "20" }}>
                        <span className="font-semibold text-slate-500 uppercase">Emergency Level</span>
                        <span className="font-extrabold tracking-widest uppercase py-0.5 px-2.5 rounded text-[10px] text-white" style={{ backgroundColor: getVerdictStyle(result.verdict).accent }}>
                          {result.actionUrgency}
                        </span>
                      </div>

                      {/* Explanatory summary */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6Shared text-left">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Cyber Threat Details
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-light">
                          {result.explanation}
                        </p>
                      </div>

                      {/* Warning Flags list */}
                      {result.redFlags && result.redFlags.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Red Flags</h2>
                          <ul className="space-y-2.5">
                            {result.redFlags.map((flag, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-700">
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-xs leading-relaxed font-medium">{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Localized Safety Tips list */}
                      <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Protection Steps</h2>
                        <ul className="space-y-2.5 text-xs text-slate-700">
                          {result.safetyTips.map((tip, i) => (
                            <li key={i} className="flex gap-2.5 items-start">
                              <span className="flex-none font-bold bg-[#008751]/10 text-[#008751] w-5 h-5 rounded-md flex items-center justify-center text-[10px]">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tip box customized in dynamic golden block */}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-105 rounded-lg">
                      <p className="text-xs text-yellow-800 leading-relaxed font-semibold">
                        🔔 <strong>SECURITY PRO ACTION:</strong> {result.safetyTips[0] || "Official Nigerian financial institutions never ask for your private BVN keys, login credentials, or pin transfers over WhatsApp or unverified SMS numbers."}
                      </p>
                    </div>

                    {/* Report action handles */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex gap-2.5">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Report
                      </button>
                      <a
                        href="https://www.ncc.gov.ng"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        Report to NCC
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                </motion.div>
              )}

              {!result && !isLoading && (
                <motion.div
                  key="placeholder"
                  className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-between min-h-[440px]"
                >
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                      <Info className="w-6 h-6 text-[#008751]" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Direct Verification Matrix</span>
                        <p className="text-slate-500 mt-0.5">Inputs compared against real Nigerian communication layouts.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Educational Safety Hub
                      </h4>
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5 text-xs">
                          <div className="mt-0.5 bg-amber-50 text-amber-700 p-1.5 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">
                              Official Banks Never Call via SMS Shortcodes
                            </span>
                            <p className="text-slate-500 leading-relaxed mt-0.5 font-light text-[11px]">
                              They communicate via official financial institutional IDs. Numbers requesting a phone call are 100% fraudulent.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                          <div className="mt-0.5 bg-[#008751]/5 text-[#008751] p-1.5 rounded">
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">National Shortcodes for Support</span>
                            <p className="text-slate-500 leading-relaxed mt-0.5 font-light text-[11px]">
                              In case of account debit concerns, dial your bank's designated regulatory USSD immediately to freeze accounts.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                          <div className="mt-0.5 bg-blue-50 text-blue-600 p-1.5 rounded">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Job Recruitments Are Free</span>
                            <p className="text-slate-550 leading-relaxed mt-0.5 font-light text-[11px]">
                              Corporate organizations (such as NNPC, NLNG, NLRC, Shell) never request payments or screening fees in personal accounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      Live AI Agent Analysis Mode
                    </span>
                    <span className="font-bold text-[#008751] flex items-center gap-0.5">
                      Verify now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Local Emergency Hotlines / Resources Drawer Footer */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <PhoneCall className="w-5 h-5 text-[#008751]" />
            <span>Official Cybercrime Helplines & Verification Portals</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-800">Central Bank of Nigeria (CBN)</span>
              <p className="text-slate-500 mt-1 font-light leading-relaxed">Verify banking systems regulations, write directly to support departments.</p>
              <a
                href="https://www.cbn.gov.ng"
                target="_blank"
                rel="noreferrer"
                className="text-[#008751] font-bold flex items-center gap-0.5 mt-2 hover:underline"
              >
                CBN Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-800">EFCC Cybercrime Desk</span>
              <p className="text-slate-500 mt-1 font-light leading-relaxed">Report financial cyber-criminals, Ponzi promoters, and active imposter pages.</p>
              <a
                href="https://www.efcc.gov.ng"
                target="_blank"
                rel="noreferrer"
                className="text-[#008751] font-bold flex items-center gap-0.5 mt-2 hover:underline"
              >
                Send EFCC Alert <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold block text-slate-800">NCC Anti-Fraud Portal</span>
              <p className="text-slate-500 mt-1 font-light leading-relaxed">Report malicious SIM telephone lines and spam SMS addresses directly.</p>
              <a
                href="https://www.ncc.gov.ng"
                target="_blank"
                rel="noreferrer"
                className="text-[#008751] font-bold flex items-center gap-0.5 mt-2 hover:underline"
              >
                NCC Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </main>

      {/* Share Report Modal Dialog */}
      <AnimatePresence>
        {showShareModal && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4 text-[#008751] font-bold">
                <Shield className="w-6 h-6 fill-[#008751]/10" />
                <h3 className="text-lg">Share Alert Report</h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 mb-5 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={getVerdictStyle(result.verdict).badge}>
                    Status: {result.verdict}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">
                    Category: {result.scamType}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{inputText.length > 100 ? `${inputText.substring(0, 100)}...` : inputText}"
                </p>
                <div className="text-[11px] text-slate-500 font-bold">
                  ⚠️ Generated safely via ScamShield Nigeria Agent. Avoid sharing OTP links.
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `⚠️ SCAMSHIELD ALERT REPORT: This message is a ${result.verdict} (${result.scamType}). Warning Signs: ${result.redFlags[0] || 'Unverified source'}. Tips: Never share OTPs. Inspect carefully via ScamShield Nigeria.`
                    );
                    alert("Report text copied to your clipboard!");
                    setShowShareModal(false);
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Copy Report Body
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer styled beautifully per style specification with status squares and copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 mb-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-xs"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-xs"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suspicious</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#008751] rounded-xs"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safe</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          © 2026 SCAMSHIELD NIGERIA • CYBER-SAFETY INITIATIVE
        </div>
      </footer>

    </div>
  );
}
