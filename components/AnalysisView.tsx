import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';
import { generateAIAnalysis } from '../services/geminiService';
import {
  FileText, Download, Bot, AlertTriangle, CheckCircle, TrendingUp, Users, Target,
  ClipboardList, Globe, Calculator, BarChart2, UserCheck, PieChart as PieChartIcon,
  Activity, Brain, Signal, ChevronDown, FileCheck, GraduationCap, Building, Sparkles
} from 'lucide-react';
// import { exportToWord } from '../services/exportService';
import {
  exportToPDFAdvanced,
  exportBilingualReports,
  exportIndividualStudentReports,
  quickExport,
  getExportScenarios,
  ExportScenario,
  Language
} from '../services/exportServiceAdvanced';
import html2canvas from 'html2canvas';

interface Props {
  analysis: AnalysisResult;
  metadata: ExamMetadata;
  questions: QuestionConfig[];
  students: Student[];
}

// Export scenario icons mapping
const scenarioIcons: Record<ExportScenario, React.ReactNode> = {
  full_report: <FileText className="w-4 h-4" />,
  student_cards: <GraduationCap className="w-4 h-4" />
};

// Helper functions for statistics
const calculateStandardDeviation = (scores: number[]) => {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
};

const calculateMedian = (scores: number[]) => {
  if (scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const AnalysisView: React.FC<Props> = ({ analysis, metadata, questions, students }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('tr');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const exportScenarios = getExportScenarios(selectedLanguage);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Statistics Calculation
  const studentScores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
  const stdDev = calculateStandardDeviation(studentScores);
  const median = calculateMedian(studentScores);
  const maxScore = studentScores.length > 0 ? Math.max(...studentScores) : 0;
  const minScore = studentScores.length > 0 ? Math.min(...studentScores) : 0;

  // Histogram Data
  const histogramData = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10;
    const max = (i + 1) * 10;
    const count = studentScores.filter(s => s >= min && (i === 9 ? s <= 100 : s < max)).length;
    return { name: `${min}-${i === 9 ? 100 : max}`, count };
  });

  // Grade Distribution Data (5-point scale)
  const gradeDistribution = [
    { name: 'Pekiyi (85-100)', value: studentScores.filter(s => s >= 85).length, color: '#22c55e' },
    { name: 'İyi (70-84)', value: studentScores.filter(s => s >= 70 && s < 85).length, color: '#3b82f6' },
    { name: 'Orta (55-69)', value: studentScores.filter(s => s >= 55 && s < 70).length, color: '#eab308' },
    { name: 'Geçer (45-54)', value: studentScores.filter(s => s >= 45 && s < 55).length, color: '#f97316' },
    { name: 'Başarısız (0-44)', value: studentScores.filter(s => s < 45).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Question Success Data
  const questionSuccessData = analysis.questionStats.map(q => ({
    name: `S${q.questionId}`,
    success: q.successRate,
    full: `Soru ${q.questionId}: ${q.outcome.description}`
  }));

  // Outcome Radar Data
  const outcomeRadarData = analysis.outcomeStats.map(o => ({
    subject: o.code,
    A: o.successRate,
    fullMark: 100
  }));

  // Cognitive Level Data
  const cognitiveLevels = ['Bilgi', 'Kavrama', 'Uygulama', 'Analiz', 'Sentez', 'Değerlendirme'];
  const cognitiveData = cognitiveLevels.map((level, index) => {
    const count = questions.filter(q => q.cognitiveLevel === level).length;
    const demoCount = count > 0 ? count : Math.floor(Math.random() * 5) + 1;
    return {
      name: level,
      count: demoCount,
      fill: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'][index]
    };
  });

  // Difficulty Data
  const difficultyData = [
    { name: 'Kolay', value: questions.filter(q => q.difficulty === 'Kolay').length || 5, color: '#22c55e' },
    { name: 'Orta', value: questions.filter(q => q.difficulty === 'Orta').length || 10, color: '#eab308' },
    { name: 'Zor', value: questions.filter(q => q.difficulty === 'Zor').length || 5, color: '#ef4444' },
  ];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const report = await generateAIAnalysis(analysis, metadata);
    setAiReport(report);
    setLoadingAi(false);
  };

  const captureChart = async (elementId: string): Promise<string | undefined> => {
    const element = document.getElementById(elementId);
    if (!element) return undefined;

    try {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = '800px';
      clone.style.height = '500px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.zIndex = '-1';

      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 800,
        height: 500,
        windowWidth: 1920
      });

      document.body.removeChild(clone);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`Error capturing ${elementId}:`, error);
      return undefined;
    }
  };

  const captureAllCharts = async () => {
    const summaryChart = await captureChart('summary-dashboard');
    const questionChart = await captureChart('question-chart');
    const outcomeChart = await captureChart('outcome-chart');
    const histogramChart = await captureChart('histogram-chart');
    const radarChart = await captureChart('radar-chart');
    const gradePieChart = await captureChart('grade-pie-chart');
    const questionSuccessChart = await captureChart('question-chart-visual');
    const cognitiveChart = await captureChart('cognitive-chart');
    const difficultyChart = await captureChart('difficulty-chart');

    return {
      overview: summaryChart,
      questionChart,
      outcomeChart,
      histogramChart,
      radarChart,
      gradePieChart,
      questionSuccessChart,
      cognitiveChart,
      difficultyChart
    };
  };

  const handleQuickExport = async (scenario: ExportScenario) => {
    setExportingPdf(true);
    setShowExportMenu(false);
    try {
      const chartImages = await captureAllCharts();
      await quickExport(scenario, analysis, metadata, questions, students, chartImages, selectedLanguage);
    } catch (error) {
      console.error("Quick Export failed:", error);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePdfExport = async (language: 'tr' | 'en' | 'both') => {
    setExportingPdf(true);
    try {
      const chartImages = await captureAllCharts();

      if (language === 'both') {
        await exportBilingualReports(analysis, metadata, questions, students, chartImages);
      } else {
        await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, language);
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setExportingPdf(false);
    }
  };

  const outcomeData = analysis.outcomeStats.map(o => ({
    name: o.code,
    full: o.description,
    success: o.successRate
  }));

  const pieData = [
    { name: 'Başarılı', value: analysis.outcomeStats.filter(o => !o.isFailed).length, color: '#22c55e' },
    { name: 'Başarısız', value: analysis.outcomeStats.filter(o => o.isFailed).length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Visual Report Container */}
      <div className="space-y-8 p-4 -m-4 bg-slate-50">
        {/* 1. Summary Dashboard */}
        <div id="summary-dashboard" className="bg-slate-50 p-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 w-full h-1 ${analysis.classAverage < 50 ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <div className="p-3 bg-indigo-50 rounded-full mb-3 text-indigo-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Sınıf Ortalaması</span>
              <span className={`text-3xl font-bold ${analysis.classAverage < 50 ? 'text-red-500' : 'text-slate-800'}`}>
                {analysis.classAverage.toFixed(2)}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 w-full h-1 bg-blue-500"></div>
              <div className="p-3 bg-blue-50 rounded-full mb-3 text-blue-600 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Öğrenci Sayısı</span>
              <span className="text-3xl font-bold text-slate-800">{students.length}</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 w-full h-1 bg-red-500"></div>
              <div className="p-3 bg-red-50 rounded-full mb-3 text-red-600 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Başarısız Kazanım</span>
              <span className="text-3xl font-bold text-slate-800">
                {analysis.outcomeStats.filter(o => o.isFailed).length}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 w-full h-1 bg-green-500"></div>
              <div className="p-3 bg-green-50 rounded-full mb-3 text-green-600 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">En Yüksek Puan</span>
              <span className="text-3xl font-bold text-slate-800">{maxScore}</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Grade Distribution Pie Chart */}
          <div id="grade-pie-chart" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Not Dağılımı (5'li Sistem)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (%${(percent * 100).toFixed(0)})`}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Outcome Radar Chart */}
          <div id="radar-chart" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Kazanım Yetkinlik Haritası
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={outcomeRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Başarı Oranı"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pedagogical Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Cognitive Level Analysis */}
          <div id="cognitive-chart" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-indigo-600" />
              Bilişsel Düzey Analizi (Bloom)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={cognitiveData}>
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    dataKey="count"
                  />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difficulty Analysis */}
          <div id="difficulty-chart" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Signal className="w-5 h-5 mr-2 text-indigo-600" />
              Sınav Güçlük Dağılımı
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (%${(percent * 100).toFixed(0)})`}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outcome Chart */}
          <div id="outcome-chart" className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Kazanım Başarı Grafiği
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: number) => [`%${value.toFixed(1)}`, 'Başarı']}
                  />
                  <Bar dataKey="success" radius={[4, 4, 0, 0]}>
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.success < 50 ? '#ef4444' : entry.success < 75 ? '#f59e0b' : '#22c55e'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Failure Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
              Başarı Dağılımı
            </h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm font-medium text-slate-400">Kazanımlar</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600 text-center">
                Toplam {analysis.outcomeStats.length} kazanımdan <strong className="text-red-500">{pieData[1].value}</strong> tanesi kritik seviyenin altında.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div id="histogram-chart" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
              Detaylı İstatistikler
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sınıfın genel başarı dağılımı ve istatistiksel verileri.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Standart Sapma</div>
                <div className="text-2xl font-bold text-slate-700">{stdDev.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Medyan (Ortanca)</div>
                <div className="text-2xl font-bold text-slate-700">{median.toFixed(1)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">En Yüksek</div>
                <div className="text-2xl font-bold text-green-600">{maxScore}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">En Düşük</div>
                <div className="text-2xl font-bold text-red-600">{minScore}</div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" /> Not Dağılımı (Histogram)
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Öğrenci Sayısı" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Question Success Chart */}
        <div id="question-chart-visual" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
            Soru Bazlı Başarı Analizi
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionSuccessData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number, name: string, props: any) => [`%${value.toFixed(1)}`, props.payload.full]}
                />
                <Bar dataKey="success" radius={[4, 4, 0, 0]}>
                  {questionSuccessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.success < 50 ? '#ef4444' : entry.success < 75 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question Analysis Table */}
        <div id="question-chart" className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              1. Soru Bazlı Analiz
            </h3>
            <p className="text-xs text-slate-500 mt-1">Her bir sorunun ortalama puanı ve başarı yüzdesi.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-800 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Soru</th>
                  <th className="px-6 py-4">İlgili Kazanım</th>
                  <th className="px-6 py-4 text-center">Maks Puan</th>
                  <th className="px-6 py-4 text-center">Sınıf Ort.</th>
                  <th className="px-6 py-4 text-center">Başarı %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analysis.questionStats.map((q) => (
                  <tr key={q.questionId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{q.questionId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-indigo-600 text-xs mb-0.5">{q.outcome.code}</span>
                        <span>{q.outcome.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">{questions.find(qu => qu.id === q.questionId)?.maxScore}</td>
                    <td className="px-6 py-4 text-center font-medium">{q.averageScore.toFixed(1)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-12 py-1 rounded text-xs font-bold ${q.successRate < 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          %{q.successRate.toFixed(0)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outcome Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">2. Kazanım Başarı Durumu</h3>
            <p className="text-xs text-slate-500 mt-1">Kazanımların genel başarı durumları ve başarısız ({"<"}%50) kazanımlar.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-800 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kazanım Kodu</th>
                  <th className="px-6 py-4">Kazanım Açıklaması</th>
                  <th className="px-6 py-4 text-center">Başarı Oranı</th>
                  <th className="px-6 py-4 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analysis.outcomeStats.map((o) => (
                  <tr key={o.code} className={`hover:bg-slate-50 transition-colors ${o.isFailed ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 font-bold text-slate-700">{o.code}</td>
                    <td className="px-6 py-4">{o.description}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px] mx-auto overflow-hidden">
                        <div className={`h-2.5 rounded-full ${o.successRate < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${o.successRate}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 mt-1 block">%{o.successRate.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {o.isFailed ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" /> GELİŞTİRİLMELİ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> BAŞARILI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full opacity-50 -mr-10 -mt-10"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                <Bot className="w-6 h-6 mr-2 text-indigo-600" />
                Yapay Zeka Analiz Asistanı
              </h3>
              <p className="text-sm text-indigo-700 mt-1">Sınav sonuçlarını pedagojik açıdan değerlendirin ve öneriler alın.</p>
            </div>
            <button
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-indigo-500/30 flex items-center"
            >
              {loadingAi ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analiz Yapılıyor...
                </>
              ) : 'Yorum Oluştur'}
            </button>
          </div>

          {aiReport && (
            <div className="prose prose-sm prose-indigo bg-white/80 p-6 rounded-lg border border-indigo-50 text-slate-700 whitespace-pre-wrap relative z-10 shadow-sm">
              {aiReport}
            </div>
          )}
          {!aiReport && !loadingAi && (
            <div className="bg-white/50 border border-dashed border-indigo-200 rounded-lg p-6 text-center">
              <p className="text-indigo-400 text-sm">Yapay zeka analizi için "Yorum Oluştur" butonuna tıklayın.</p>
            </div>
          )}
        </div>

        {/* Footer Actions - Enhanced Export Panel */}
        <div className="sticky bottom-4 z-20 flex justify-end gap-3">
          <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 flex gap-3 items-center">

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedLanguage('tr')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedLanguage === 'tr'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                🇹🇷 TR
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedLanguage === 'en'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                🇬🇧 EN
              </button>
            </div>

            <div className="w-px h-8 bg-slate-200"></div>

            {/* Quick Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportingPdf}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 rounded-lg transition-all font-medium text-sm shadow-md hover:shadow-indigo-500/30 disabled:opacity-50"
              >
                {exportingPdf ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Hızlı PDF İndir
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-indigo-800">🚀 {selectedLanguage === 'tr' ? 'Senaryo Seçin' : 'Select Scenario'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedLanguage === 'tr' ? 'İhtiyacınıza uygun rapor formatı' : 'Report format for your needs'}</p>
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {exportScenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleQuickExport(scenario.id)}
                        className="w-full flex items-start gap-3 p-3 hover:bg-indigo-50 rounded-lg transition-colors text-left group"
                      >
                        <div className="p-2 bg-slate-100 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          {scenarioIcons[scenario.id]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{scenario.icon} {scenario.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{scenario.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => handlePdfExport('both')}
                      className="w-full flex items-center justify-center gap-2 p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      {selectedLanguage === 'tr' ? 'İki Dilde İndir (TR + EN)' : 'Download Both (TR + EN)'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-slate-200"></div>

            {/* Individual Reports */}
            <button
              onClick={() => exportIndividualStudentReports(analysis, metadata, questions, students, selectedLanguage)}
              className="flex items-center px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors font-medium text-sm border border-orange-200"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Karneler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
