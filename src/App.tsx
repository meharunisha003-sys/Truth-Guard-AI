import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  FileText, 
  Mic, 
  MicOff,
  Loader2,
  ExternalLink,
  Info,
  ChevronRight,
  Zap,
  Globe,
  BrainCircuit,
  PieChart as PieChartIcon,
  Image as ImageIcon,
  X,
  Upload,
  History,
  User,
  Cpu,
  Flag
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { analyzeNews, AnalysisResult } from './services/geminiService';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInputText(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedImage) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeNews(inputText, selectedImage || undefined);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please check your API key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mlData = result ? [
    { name: 'Log. Reg.', score: result.mlMetrics.logisticRegression * 100 },
    { name: 'Naive Bayes', score: result.mlMetrics.naiveBayes * 100 },
    { name: 'Gemini', score: result.confidence },
  ] : [];

  const performanceData = result ? [
    { name: 'Accuracy', score: result.mlMetrics.accuracy * 100 },
    { name: 'Precision', score: result.mlMetrics.precision * 100 },
    { name: 'Recall', score: result.mlMetrics.recall * 100 },
    { name: 'F1-Score', score: result.mlMetrics.f1Score * 100 },
  ] : [];

  const pieData = result ? [
    { name: 'Truth', value: result.truthScore },
    { name: 'Risk', value: 100 - result.truthScore },
  ] : [];

  const xaiData = result ? [
    { subject: 'Language Manipulation', A: result.xaiMetrics.languageManipulation, fullMark: 100 },
    { subject: 'Source Credibility', A: result.xaiMetrics.sourceCredibility, fullMark: 100 },
    { subject: 'Fact Inconsistency', A: result.xaiMetrics.factInconsistency, fullMark: 100 },
    { subject: 'AI Writing Pattern', A: result.xaiMetrics.aiWritingPattern, fullMark: 100 },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase italic">Truth Guard</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Fact Check</a>
            <a href="#" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">API Docs</a>
            <div className="h-4 w-px bg-white/10" />
            <button className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Install Extension
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight leading-[0.9]">
                Detect Misinformation <br />
                <span className="text-emerald-500">In Real-Time.</span>
              </h1>
              <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                Advanced multi-layered analysis combining traditional ML classifiers with Gemini AI reasoning and live fact-checking.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Input News Article</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleRecording}
                      className={cn(
                        "p-2 rounded-full transition-all",
                        isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-zinc-400 hover:text-white"
                      )}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste news text or article URL here..."
                  className="w-full h-32 bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-zinc-700"
                />

                {/* Image Upload Area */}
                <div className="space-y-4">
                  {selectedImage ? (
                    <div className="relative group/img aspect-video rounded-xl overflow-hidden border border-white/10">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/5 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group/upload">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-zinc-500 group-hover/upload:text-emerald-500 transition-colors mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover/upload:text-emerald-400">Upload Evidence Image</p>
                        <p className="text-[8px] text-zinc-600 mt-1">PNG, JPG or WebP (Max 4MB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Claims...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Authenticity</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl space-y-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Search</div>
                <div className="text-xs text-zinc-300">Google Fact Check Integration</div>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl space-y-2">
                <BrainCircuit className="w-4 h-4 text-cyan-500" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Detection</div>
                <div className="text-xs text-zinc-300">Pattern Recognition Layer</div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Result Header Card */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
                    <div className={cn(
                      "p-8 flex flex-col md:flex-row items-center justify-between gap-8",
                      result.classification === 'Real' ? "bg-emerald-500/5" : 
                      result.classification === 'Fake' ? "bg-red-500/5" : "bg-amber-500/5"
                    )}>
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            result.classification === 'Real' ? "bg-emerald-500" : 
                            result.classification === 'Fake' ? "bg-red-500" : "bg-amber-500"
                          )} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Analysis Complete</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">{result.title || 'Analysis Result'}</h2>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            result.classification === 'Real' ? "bg-emerald-500/20 text-emerald-500" : 
                            result.classification === 'Fake' ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                          )}>
                            {result.classification} News
                          </span>
                          <span className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            {result.confidence}% Confidence
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={45}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill={result.classification === 'Real' ? '#10b981' : result.classification === 'Fake' ? '#ef4444' : '#f59e0b'} />
                              <Cell fill="#18181b" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold">{result.truthScore}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Performance Stats */}
                    <div className="px-8 pb-8 flex flex-wrap gap-4">
                      {performanceData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">{item.name}</span>
                          <span className="text-xs font-bold text-emerald-500">{item.score.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8 border-t border-white/5">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ML Layer Metrics</span>
                        </div>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mlData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                              <XAxis type="number" hide domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#71717a' }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                                cursor={{ fill: '#27272a' }}
                              />
                              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                {mlData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#10b981' : entry.score > 40 ? '#f59e0b' : '#ef4444'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-cyan-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Key Reasons</span>
                        </div>
                        <ul className="space-y-3">
                          {result.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs text-zinc-400">
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Intent Analysis & XAI Radar */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Intent Analysis</span>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Type</div>
                          <div className="text-xl font-bold text-amber-500">{result.intentAnalysis.type}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Goal</div>
                          <div className="text-sm text-zinc-300">{result.intentAnalysis.goal}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            <span>Intent Confidence</span>
                            <span>{result.intentAnalysis.confidence}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.intentAnalysis.confidence}%` }}
                              className="h-full bg-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Explainable AI (XAI)</span>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={xaiData}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#71717a' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                            <Radar
                              name="Analysis"
                              dataKey="A"
                              stroke="#06b6d4"
                              fill="#06b6d4"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Model Performance Dashboard */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model Performance Metrics</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-widest border border-emerald-500/20">
                        Live Model Stats
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {performanceData.map((item) => (
                        <div key={item.name} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center space-y-1">
                          <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">{item.name}</div>
                          <div className="text-xl font-bold text-emerald-500">{item.score.toFixed(1)}%</div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Source Verification & NLP Insights */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Source Verification</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div>
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Publisher</div>
                            <div className="text-sm font-bold">{result.sourceVerification.publisher}</div>
                          </div>
                          {result.sourceVerification.isTrusted ? (
                            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Trusted
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase">
                              <AlertTriangle className="w-3 h-3" /> Unverified
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Reputation</div>
                            <div className="text-lg font-bold text-blue-500">{result.sourceVerification.reputationScore}/100</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Bias Type</div>
                            <div className="text-lg font-bold text-amber-500">{result.sourceVerification.biasType}</div>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                          "{result.sourceVerification.verificationDetails}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-purple-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Advanced NLP Insights</span>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Sentiment</div>
                            <div className="text-sm font-bold">{result.nlpInsights.sentiment}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Complexity</div>
                            <div className="text-sm font-bold">{result.nlpInsights.complexityLevel}</div>
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Semantic Consistency</div>
                            <div className="text-sm font-bold text-purple-500">{result.nlpInsights.semanticConsistency}%</div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.nlpInsights.semanticConsistency}%` }}
                              className="h-full bg-purple-500"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Tone</div>
                          <div className="text-sm font-bold italic">"{result.nlpInsights.emotionalTone}"</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Origin & Global Stats */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Content Origin Detection</span>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {result.contentOrigin.type === 'AI Generated' ? <Cpu className="w-5 h-5 text-purple-500" /> : <User className="w-5 h-5 text-blue-500" />}
                            <div>
                              <div className="text-sm font-bold">{result.contentOrigin.type}</div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Detection Type</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-purple-500">{result.contentOrigin.percentage}%</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-zinc-400 leading-relaxed">
                          {result.contentOrigin.details}
                        </div>
                        {result.contentOrigin.linguisticAnomalies.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Linguistic Anomalies</div>
                            <div className="flex flex-wrap gap-2">
                              {result.contentOrigin.linguisticAnomalies.map((anomaly, i) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[8px] font-bold uppercase border border-red-500/20">
                                  {anomaly}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Global Impact & Stats</span>
                      </div>
                      <div className="space-y-4">
                        {result.globalStats.map((stat, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <Flag className="w-3 h-3 text-zinc-500" />
                              <span className="text-xs font-bold">{stat.country}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{stat.status}</div>
                              <div className="text-[8px] text-zinc-500">{stat.impact}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Incident Timeline */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-8">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Verified Incident Timeline</span>
                    </div>
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                      {result.incidentTimeline.map((item, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-blue-500 text-xs">{item.date}</div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">{item.source}</div>
                            </div>
                            <div className="text-xs text-zinc-400">{item.event}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Factual Claim Analysis</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {result.claims.map((claim, i) => (
                        <div key={i} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">{claim.claim}</span>
                            <span className={cn(
                              "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                              claim.status.toLowerCase().includes('true') ? "bg-emerald-500/10 text-emerald-500" : 
                              claim.status.toLowerCase().includes('false') ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                              {claim.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                            Evidence: {claim.evidence}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-cyan-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Deep Reasoning</span>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed">
                      <Markdown>{result.explanation}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-24">
                  <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                    <Search className="w-10 h-10 text-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Awaiting Analysis</h3>
                    <p className="text-xs text-zinc-500 max-w-xs">
                      Submit a news article to see the multi-layered verification dashboard.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Truth Guard v2.0</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
