import React, { useState, useMemo, useEffect } from 'react';
import { getScenarioData, getOutcomeDescription } from './data/curriculum';
import { QuestionConfig, Student, ExamMetadata, AnalysisResult, SavedAnalysis } from './types';
import { AnalysisView } from './components/AnalysisView';
import { ChevronRight, ChevronLeft, Plus, Trash2, GraduationCap, LayoutDashboard, Settings, Info, Save, RotateCcw, LogOut, User as UserIcon, Users, FileText, Upload, Download, RefreshCw, List, ExternalLink, X, History, TrendingUp, Key, BookOpen } from 'lucide-react';
import { ScenarioVisualSelector } from './components/ScenarioVisualSelector';
import { MEB_SCENARIOS } from './services/mebScraperAdvanced';
import { getScenarioTemplate, saveScenarioTemplate } from './services/mebScenarioService';
import { isSupabaseConfigured } from './services/supabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { studentListService, studentService, StudentList } from './services/supabase';
import { supabase } from './services/supabase';
import { DataImport } from './components/DataImport';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SettingsModal } from './components/SettingsModal';
import { analysisHistoryService } from './services/supabaseHistoryService';
import AdminDashboard from './modules/admin-dashboard/AdminDashboard';
import { QuestionBankDashboard } from './modules/question-bank';
import { StudentDashboard } from './modules/student-portal';
import { ParentDashboard } from './modules/parent-portal';
import { NotificationProvider, ToastContainer } from './modules/notifications';
import { I18nProvider, LanguageSelector } from './modules/i18n';

// Steps Enum
enum Step {
  METADATA = 0,
  QUESTIONS = 1,
  SCORES = 2,
  ANALYSIS = 3
}

const STORAGE_KEY = 'exam_analysis_v2'; // Updated to clear old cache
const isDebug = import.meta.env.DEV;

const INITIAL_METADATA: ExamMetadata = {
  grade: '5',
  subject: 'İngilizce',
  scenario: '1',
  schoolName: '',
  teacherName: '',
  academicYear: '2025-2026',
  className: '',
  date: '', // Opsiyonel - boş bırakılabilir
  // Professional reporting fields
  term: '1',
  examNumber: '1',
  examType: 'Yazılı',
  district: '',
  province: '',
  schoolType: 'Ortaokul'
};

// Gelişmiş Bloom Taksonomisi Otomatik Etiketleme Servisi
import {
  analyzeBloomByKeywords,
  inferDifficultyFromBloom,
  getBloomSuggestion,
  applyAutoBloomToQuestions as applyAutoBloomService
} from './services/autoBloomService';

// Geriye uyumluluk için basit wrapper fonksiyonlar
const inferBloomLevel = (text: string): QuestionConfig['cognitiveLevel'] | undefined => {
  const result = analyzeBloomByKeywords(text);
  return result.level || undefined;
};

const inferDifficulty = (level: QuestionConfig['cognitiveLevel'] | undefined): QuestionConfig['difficulty'] | undefined => {
  if (!level) return undefined;
  return inferDifficultyFromBloom(level);
};

const applyAutoBloom = (question: QuestionConfig, description: string): QuestionConfig => {
  // Manuel etiketleme varsa koru
  if (question.cognitiveLevel && question.difficulty) {
    return question;
  }

  const suggestion = getBloomSuggestion(question);

  return {
    ...question,
    cognitiveLevel: question.cognitiveLevel || suggestion.cognitiveLevel,
    difficulty: question.difficulty || suggestion.difficulty
  };
};

const applyAutoBloomToQuestions = (list: QuestionConfig[]) =>
  list.map((question) => applyAutoBloom(question, question.outcome?.description || ''));

const createLocalStudentId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function MainApp() {
  const { user, signOut, isAdmin } = useAuth();
  const [step, setStep] = useState<Step>(Step.METADATA);

  // State
  const [metadata, setMetadata] = useState<ExamMetadata>(INITIAL_METADATA);
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // New States for Features
  const [showClassModal, setShowClassModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [savedClasses, setSavedClasses] = useState<StudentList[]>([]);
  const [bulkStudentText, setBulkStudentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);    
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [showStudentPortal, setShowStudentPortal] = useState(false);
  const [showParentPortal, setShowParentPortal] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [currentStudentListId, setCurrentStudentListId] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // --- PERSISTENCE LOGIC ---

  // Load on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.metadata) setMetadata(parsed.metadata);
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.step !== undefined) setStep(parsed.step);
        if (parsed.currentAnalysisId) setCurrentAnalysisId(parsed.currentAnalysisId);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (!isLoaded) return;

    const dataToSave = {
      metadata,
      questions,
      students,
      step,
      currentAnalysisId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [metadata, questions, students, step, currentAnalysisId, isLoaded]);

  // --- NEW FEATURES HANDLERS ---

  // Auto-redirect to production URL
  useEffect(() => {
    // FORCE REDIRECT TO PRODUCTION DOMAIN (Preserving path, query, and hash)
    /* 
    if (window.location.hostname.includes('vercel.app') && window.location.hostname !== 'sinav-analiz-uzmani.vercel.app') {
      const targetUrl = new URL(window.location.href);
      targetUrl.hostname = 'sinav-analiz-uzmani.vercel.app';
      window.location.href = targetUrl.toString();
      return;
    }
    */
  }, []);

  // Update analysis count with debug logging
  useEffect(() => {
    const fetchCount = async () => {
      try {
        if (isDebug) {
          console.log('Fetching analyses...');
        }
        const analyses = await analysisHistoryService.getAllAnalyses();
        if (isDebug) {
          console.log(`Found ${analyses.length} analyses:`, analyses);
        }
        setAnalysisCount(analyses.length);

        if (analyses.length === 0) {
          if (isDebug) {
            console.warn('No analyses found for this user.');
            const { data: { user } } = await supabase.auth.getUser();
            console.log('Current user:', user?.email, user?.id);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching analyses:', error);
      }
    };
    fetchCount();
  }, [showProgressDashboard]);

  const handleSaveAnalysis = async () => {
    if (questions.length === 0 || students.length === 0) {
      alert('Kaydedilecek analiz verisi bulunamadı.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentAnalysisId) {
        // Update existing
        await analysisHistoryService.updateAnalysis(currentAnalysisId, {
          metadata,
          analysis,
          questions,
          students
        });
        alert('Analiz başarıyla GÜNCELLENDİ!');
      } else {
        // Create new
        const saved = await analysisHistoryService.saveAnalysis(metadata, analysis, questions, students);
        if (saved) {
          setCurrentAnalysisId(saved.id);
          const analyses = await analysisHistoryService.getAllAnalyses();
          setAnalysisCount(analyses.length);
          alert('Yeni analiz başarıyla KAYDEDİLDİ!');
        } else {
          alert('Analiz kaydedilirken bir hata oluştu.');
        }
      }
      if (metadata.scenario !== 'custom' && questions.length > 0) {
        saveScenarioTemplate(metadata.grade, metadata.subject, metadata.scenario, questions);
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadAnalysis = (savedAnalysis: SavedAnalysis) => {
    setMetadata(savedAnalysis.metadata);
    setQuestions(savedAnalysis.questions);
    setStudents(savedAnalysis.students);
    setCurrentAnalysisId(savedAnalysis.id);
    setCurrentStudentListId(null);
    setStep(Step.ANALYSIS);
    setShowProgressDashboard(false);
  };

  const handleApplyOCRStudents = (
    newStudents: Student[],
    options?: { preserveScores?: boolean }
  ) => {
    const preserveScores = options?.preserveScores ?? true;
    if (!preserveScores) {
      setStudents(newStudents);
      setCurrentAnalysisId(null);
      setStep(Step.SCORES);
      return;
    }

    setStudents((prev) => {
      const now = Date.now();
      const map = new Map<string, Student>();
      prev.forEach((student) => {
        map.set(normalizeStudentKey(student), student);
      });

      return newStudents.map((student, index) => {
        const key = normalizeStudentKey(student);
        const existing = map.get(key);
        if (!existing) {
          return { ...student, id: student.id || `${now}-${index}` };
        }
        return {
          ...student,
          id: existing.id,
          scores: existing.scores,
          student_number: student.student_number || existing.student_number
        };
      });
    });
    setCurrentAnalysisId(null);
    setStep(Step.SCORES);
  };

  const normalizeStudentKey = (student: Student) => {
    const numberKey = student.student_number?.replace(/\s+/g, '').trim();
    if (numberKey) return `num:${numberKey.toLowerCase()}`;
    const nameKey = student.name.trim().replace(/\s+/g, ' ').toLowerCase();
    return `name:${nameKey}`;
  };

  const mergeStudents = (existing: Student[], incoming: Student[], preserveScores = true) => {
    const map = new Map<string, Student>();
    const result: Student[] = [];
    const now = Date.now();

    existing.forEach((student) => {
      const key = normalizeStudentKey(student);
      map.set(key, student);
      result.push(student);
    });

    incoming.forEach((student) => {
      const key = normalizeStudentKey(student);
      const existingStudent = map.get(key);
      if (existingStudent) {
        if (preserveScores) {
          if (!existingStudent.student_number && student.student_number) {
            existingStudent.student_number = student.student_number;
          }
          if (!existingStudent.name && student.name) {
            existingStudent.name = student.name;
          }
        } else {
          const index = result.findIndex((item) => item.id === existingStudent.id);
          const updated = {
            ...student,
            id: existingStudent.id,
            scores: {}
          };
          map.set(key, updated);
          if (index !== -1) {
            result[index] = updated;
          }
        }
        return;
      }
      map.set(key, student);
      result.push(student);
    });

    return result.map((student, index) => ({
      ...student,
      id: student.id || `${now}-${index}`
    }));
  };

  const handleAppendOCRStudents = (
    newStudents: Student[],
    options?: { preserveScores?: boolean }
  ) => {
    setStudents((prev) => mergeStudents(prev, newStudents, options?.preserveScores ?? true));
    setCurrentAnalysisId(null);
    setStep(Step.SCORES);
  };

  const resetAnalysis = () => {
    if (confirm('Mevcut analiz verileri silinecek ve yeni bir analiz başlatılacak. Emin misiniz?')) {
      setMetadata(INITIAL_METADATA);
      setQuestions([]);
      setStudents([]);
      setCurrentAnalysisId(null);
      setCurrentStudentListId(null);
      setStep(Step.METADATA);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadSavedClasses = async () => {
    try {
      const classes = await studentListService.getAll();
      setSavedClasses(classes);
      setShowClassModal(true);
    } catch (error) {
      console.error('Sınıflar yüklenirken hata:', error);
      alert('Kayıtlı sınıflar yüklenemedi.');
    }
  };

  const loadClass = async (cls: StudentList, options?: { mode?: 'replace' | 'append' }) => {
    if (!cls.id) {
      alert('Seçilen sınıf bulunamadı.');
      return;
    }
    const mode = options?.mode ?? 'replace';
    if (mode === 'replace' && !confirm(`${cls.name} sınıfı yüklenecek. Mevcut öğrenci listesi silinebilir. Devam edilsin mi?`)) {
      return;
    }
    if (mode === 'append' && students.length > 0 && !confirm(`${cls.name} sınıfı mevcut listeye eklenecek. Devam edilsin mi?`)) {
      return;
    }

    if (mode === 'replace') {
      setMetadata(prev => ({
        ...prev,
        schoolName: cls.school_name || prev.schoolName,
        className: cls.name,
        grade: cls.grade,
        subject: cls.subject || prev.subject,
        academicYear: cls.academic_year
      }));
      setCurrentStudentListId(cls.id);
    } else if (currentStudentListId && currentStudentListId !== cls.id) {
      setCurrentStudentListId(null);
    }

    try {
      const roster = await studentService.getByList(cls.id);
      if (roster.length > 0) {
        const newStudents = roster.map((student) => ({
          id: student.id || `${Date.now()}-${Math.random()}`,
          name: student.full_name,
          scores: {},
          student_number: student.student_number || undefined
        }));
        if (mode === 'append') {
          setStudents(prev => mergeStudents(prev, newStudents, true));
        } else {
          setStudents(newStudents);
        }
      } else {
        if (mode === 'replace') {
          setStudents([]);
        }
        alert('Bu sınıfta kayıtlı öğrenci listesi bulunamadı.');
      }
    } catch (error) {
      console.error('Öğrenciler yüklenirken hata:', error);
      alert('Öğrenci listesi yüklenemedi.');
    } finally {
      setShowClassModal(false);
    }
  };

  const saveCurrentClass = async () => {
    if (!metadata.className) {
      alert('Lütfen önce sınıf adını giriniz.');
      return;
    }
    if (students.length === 0) {
      alert('Kaydedilecek öğrenci listesi boş.');
      return;
    }

    setIsSaving(true);
    try {
      const listPayload = {
        name: metadata.className,
        grade: metadata.grade,
        academic_year: metadata.academicYear,
        subject: metadata.subject,
        school_name: metadata.schoolName,
        total_students: students.length
      };

      let listId = currentStudentListId;

      if (listId) {
        const updated = await studentListService.update(listId, listPayload);
        if (!updated) {
          alert('Sınıf güncellenemedi. Lütfen veritabanı ayarlarını kontrol edin.');
          return;
        }
        await studentService.deleteByList(listId);
      } else {
        const created = await studentListService.create(listPayload);
        if (!created?.id) {
          alert('Sınıf kaydedilirken bir hata oluştu. Lütfen veritabanı ayarlarını kontrol edin.');
          return;
        }
        listId = created.id;
        setCurrentStudentListId(listId);
      }

      const rosterPayload = students.map((student) => ({
        student_list_id: listId!,
        full_name: student.name,
        student_number: student.student_number || null,
        is_active: true
      }));

      const savedStudents = await studentService.bulkCreate(rosterPayload);
      await studentListService.update(listId!, { total_students: savedStudents.length });

      alert(currentStudentListId ? 'Sınıf listesi güncellendi.' : 'Sınıf ve öğrenci listesi başarıyla kaydedildi.');
    } catch (error) {
      console.error('Sınıf kaydedilirken hata:', error);
      alert('Sınıf kaydedilirken bir hata oluştu. Lütfen veritabanı ayarlarını kontrol edin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAdd = () => {
    const names = bulkStudentText.split('\n').filter(n => n.trim().length > 0);
    if (names.length === 0) return;

    const newStudents = names.map((name) => ({
      id: createLocalStudentId(),
      name: name.trim(),
      scores: {}
    }));

    setStudents([...students, ...newStudents]);
    setBulkStudentText('');
    setShowBulkAddModal(false);
    alert(`${names.length} öğrenci eklendi.`);
  };

  // --- EXISTING HANDLERS ---

  const handleMetadataChange = (field: keyof ExamMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const initQuestions = () => {
    if (questions.length > 0) {
      setStep(Step.QUESTIONS);
      return;
    }

    let defaults: QuestionConfig[];

    if (metadata.scenario === 'custom') {
      defaults = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        order: i + 1,
        maxScore: 10,
        outcome: { code: "", description: "" }
      }));
    } else {
      const template = getScenarioTemplate(metadata.grade, metadata.subject, metadata.scenario);
      if (template && template.length > 0) {
        setQuestions(applyAutoBloomToQuestions(template));
        setStep(Step.QUESTIONS);
        return;
      }
      defaults = getScenarioData(metadata.grade, metadata.subject, metadata.scenario);
    }

    setQuestions(applyAutoBloomToQuestions(defaults));
    setStep(Step.QUESTIONS);
  };

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, {
      id: newId,
      order: questions.length + 1,
      maxScore: 10,
      outcome: { code: '', description: '' }
    }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: keyof QuestionConfig, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateQuestionOutcome = (id: number, code: string) => {
    const description = getOutcomeDescription(code);
    setQuestions(prev => prev.map(q => q.id === id ? {
      ...applyAutoBloom(q, description || q.outcome.description),
      outcome: {
        code: code,
        description: description ? description : q.outcome.description
      }
    } : q));
  };

  const updateQuestionOutcomeDesc = (id: number, description: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? {
      ...applyAutoBloom(q, description),
      outcome: { ...q.outcome, description }
    } : q));
  };

  const addStudent = () => {
    const newId = createLocalStudentId();
    setStudents([...students, { id: newId, name: `Öğrenci ${students.length + 1}`, scores: {} }]);
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const updateScore = (studentId: string, questionId: number, score: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, scores: { ...s.scores, [questionId]: score } };
      }
      return s;
    }));
  };

  // Analysis Logic
  const analysis: AnalysisResult = useMemo(() => {
    if (questions.length === 0 || students.length === 0) {
      return {
        questionStats: [],
        outcomeStats: [],
        studentStats: [],
        classAverage: 0,
        averageSuccess: 0,
        totalQuestions: 0
      };
    }

    const totalMaxScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    const studentStats = students.map(s => {
      const totalScore = Object.values(s.scores).reduce((a: number, b: number) => a + b, 0);
      return {
        studentId: s.id,
        totalScore,
        percentage: Number(totalMaxScore) > 0 ? (Number(totalScore) / Number(totalMaxScore)) * 100 : 0
      };
    });

    const classAverage = studentStats.reduce((sum, s) => sum + s.percentage, 0) / (students.length || 1);

    const questionStats = questions.map(q => {
      const scores = students.map(s => s.scores[q.id] || 0);
      const avg = scores.reduce((a, b) => a + b, 0) / (students.length || 1);
      const successRate = q.maxScore > 0 ? (avg / q.maxScore) * 100 : 0;
      return {
        questionId: q.id,
        averageScore: avg,
        successRate,
        outcome: q.outcome
      };
    });

    const outcomeMap = new Map<string, { totalRate: number, count: number, desc: string }>();

    questionStats.forEach(qs => {
      if (!qs.outcome.code) return;
      const current = outcomeMap.get(qs.outcome.code) || { totalRate: 0, count: 0, desc: qs.outcome.description };
      outcomeMap.set(qs.outcome.code, {
        totalRate: current.totalRate + qs.successRate,
        count: current.count + 1,
        desc: current.desc
      });
    });

    const outcomeStats = Array.from(outcomeMap.entries()).map(([code, data]) => ({
      code,
      description: data.desc,
      successRate: data.totalRate / data.count,
      isFailed: (data.totalRate / data.count) < 50
    }));

    const averageSuccess = classAverage;

    return {
      questionStats,
      outcomeStats,
      studentStats,
      classAverage,
      averageSuccess,
      totalQuestions: questions.length
    };
  }, [questions, students]);

  // --- RENDER HELPERS ---

  const renderMetadataStep = () => (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative animate-fade-in">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={loadSavedClasses}
          className="flex items-center text-indigo-600 hover:text-indigo-800 p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all text-sm font-bold"
          title="Kayıtlı Sınıf Yükle"
        >
          <Download className="w-4 h-4 mr-2" /> Sınıf Yükle
        </button>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-100 rounded-xl mr-3">
          <Settings className="text-indigo-600 w-6 h-6" />
        </div>
        Sınav Ayarları
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-start p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
            <Info className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-indigo-600" />
            <div>
              <strong className="block mb-1 text-indigo-900">Otomatik Kayıt</strong>
              Verileriniz tarayıcınıza anlık olarak kaydedilir. MEB senaryosu seçtiğinizde sorular ve kazanımlar otomatik yüklenir.
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Okul Adı</label>
          <input type="text" className="input-primary"
            value={metadata.schoolName} onChange={(e) => handleMetadataChange('schoolName', e.target.value)} placeholder="Örn: Atatürk Ortaokulu" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Öğretmen Adı</label>
          <input type="text" className="input-primary"
            value={metadata.teacherName} onChange={(e) => handleMetadataChange('teacherName', e.target.value)} placeholder="Örn: Ayşe Yılmaz" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sınıf Kademesi</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.grade} onChange={(e) => handleMetadataChange('grade', e.target.value)}>
            <option value="5">5. Sınıf</option>
            <option value="6">6. Sınıf</option>
            <option value="7">7. Sınıf</option>
            <option value="8">8. Sınıf</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Ders</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.subject} onChange={(e) => handleMetadataChange('subject', e.target.value)}>
            <option value="İngilizce">İngilizce</option>
            <option value="Matematik">Matematik</option>
            <option value="Türkçe">Türkçe</option>
            <option value="Fen Bilimleri">Fen Bilimleri</option>
          </select>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-sm font-bold text-slate-700">Senaryo Seçimi</label>
            <a href="https://odsgm.meb.gov.tr/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
              <ExternalLink className="w-3 h-3 mr-1" /> MEB Güncel Senaryoları
            </a>
          </div>
          <ScenarioVisualSelector
            grade={metadata.grade}
            subject={metadata.subject}
            selectedScenario={metadata.scenario}
            onSelect={(id) => handleMetadataChange('scenario', id)}
            scenarios={[]}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Şube (Örn: 5/A)</label>
          <input type="text" className="input-primary"
            value={metadata.className} onChange={(e) => handleMetadataChange('className', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Dönem</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.term} onChange={(e) => handleMetadataChange('term', e.target.value as '1' | '2')}>
            <option value="1">1. Dönem</option>
            <option value="2">2. Dönem</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sınav Numarası</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.examNumber} onChange={(e) => handleMetadataChange('examNumber', e.target.value)}>
            <option value="1">1. Sınav</option>
            <option value="2">2. Sınav</option>
            <option value="3">3. Sınav</option>
            <option value="4">4. Sınav</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sınav Tarihi (Opsiyonel)</label>
          <input
            type="text"
            className="input-primary"
            value={metadata.date || ''}
            onChange={(e) => handleMetadataChange('date', e.target.value)}
            placeholder="YYYY-MM-DD veya GG.AA.YYYY"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sınav Türü</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.examType} onChange={(e) => handleMetadataChange('examType', e.target.value as 'Yazılı' | 'Sözlü' | 'Performans' | 'Proje')}>
            <option value="Yazılı">Yazılı Sınav</option>
            <option value="Sözlü">Sözlü Sınav</option>
            <option value="Performans">Performans Değerlendirme</option>
            <option value="Proje">Proje Ödevi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Okul Türü</label>
          <select className="input-primary cursor-pointer appearance-none"
            value={metadata.schoolType} onChange={(e) => handleMetadataChange('schoolType', e.target.value as 'İlkokul' | 'Ortaokul' | 'Lise')}>
            <option value="İlkokul">İlkokul</option>
            <option value="Ortaokul">Ortaokul</option>
            <option value="Lise">Lise</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">İl (Opsiyonel)</label>
          <input type="text" className="input-primary"
            value={metadata.province || ''} onChange={(e) => handleMetadataChange('province', e.target.value)} placeholder="Örn: Ankara" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">İlçe (Opsiyonel)</label>
          <input type="text" className="input-primary"
            value={metadata.district || ''} onChange={(e) => handleMetadataChange('district', e.target.value)} placeholder="Örn: Çankaya" />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={initQuestions}
          className="btn-primary text-lg px-10 py-4"
        >
          Devam Et <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <div className="p-2 bg-indigo-100 rounded-xl mr-3">
              <FileText className="text-indigo-600 w-6 h-6" />
            </div>
            Soru ve Kazanım Düzenleme
          </h2>
          <p className="text-slate-500 text-sm mt-2 ml-14">{metadata.grade}. Sınıf {metadata.subject} - {metadata.scenario === 'custom' ? 'Özel Senaryo' : `${metadata.scenario}. Senaryo`}</p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
            Toplam Puan: <span className={`font-bold text-lg ml-2 ${questions.reduce((a, b) => a + b.maxScore, 0) === 100 ? 'text-green-600' : 'text-indigo-600'}`}>{questions.reduce((a, b) => a + b.maxScore, 0)}</span>
          </div>
          <button
            onClick={addQuestion}
            className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" /> Soru Ekle
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="flex flex-col md:flex-row gap-4 p-6 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all bg-slate-50/30 hover:bg-white shadow-sm hover:shadow-md group">
            <div className="flex items-center gap-4 w-full md:w-auto shrink-0 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
              <div className="flex flex-col items-center gap-3">
                <span className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl font-bold text-xl shrink-0 shadow-indigo-200 shadow-lg">
                  {idx + 1}
                </span>
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Soruyu Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 text-center">PUAN</label>
                <input
                  type="number"
                  className="w-24 p-3 border-2 border-slate-200 rounded-xl text-center font-bold text-2xl text-slate-800 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-white shadow-sm transition-all"
                  value={q.maxScore}
                  onChange={(e) => updateQuestion(q.id, 'maxScore', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex-1 pt-2 md:pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">KAZANIM KODU</label>
                  <input
                    type="text"
                    placeholder="Örn: E5.1.S1"
                    className="input-primary uppercase"
                    value={q.outcome.code}
                    onChange={(e) => updateQuestionOutcome(q.id, e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">KAZANIM AÇIKLAMASI (Otomatik)</label>
                  <input
                    type="text"
                    placeholder="Kazanım kodu girildiğinde otomatik dolar..."
                    className="input-primary bg-slate-50"
                    value={q.outcome.description}
                    onChange={(e) => updateQuestionOutcomeDesc(q.id, e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">BİLİŞSEL DÜZEY (Bloom)</label>
                  <select
                    className="input-primary cursor-pointer appearance-none"
                    value={q.cognitiveLevel || ''}
                    onChange={(e) => updateQuestion(q.id, 'cognitiveLevel', e.target.value || undefined)}
                  >
                    <option value="">Seçiniz</option>
                    <option value="Bilgi">Bilgi</option>
                    <option value="Kavrama">Kavrama</option>
                    <option value="Uygulama">Uygulama</option>
                    <option value="Analiz">Analiz</option>
                    <option value="Sentez">Sentez</option>
                    <option value="Değerlendirme">Değerlendirme</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 ml-1">ZORLUK DÜZEYİ</label>
                  <select
                    className="input-primary cursor-pointer appearance-none"
                    value={q.difficulty || ''}
                    onChange={(e) => updateQuestion(q.id, 'difficulty', e.target.value || undefined)}
                  >
                    <option value="">Seçiniz</option>
                    <option value="Kolay">Kolay</option>
                    <option value="Orta">Orta</option>
                    <option value="Zor">Zor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-300 group hover:border-indigo-300 transition-colors">
            <div className="bg-white p-6 rounded-full mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-slate-700 font-bold text-xl">Henüz soru eklenmedi</p>
            <p className="text-slate-500 text-sm mb-6 mt-1">Analize başlamak için sorularınızı ekleyin</p>
            <button onClick={addQuestion} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
              İlk Soruyu Ekle
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
        <button onClick={() => setStep(Step.METADATA)} className="flex items-center text-slate-600 hover:text-slate-900 font-bold px-6 py-3 hover:bg-slate-50 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 mr-2" /> Geri Dön
        </button>
        <button onClick={() => {
          if (questions.length === 0) {
            alert("Lütfen en az bir soru ekleyin.");
            return;
          }
          if (students.length === 0) {
            // Init dummy students row
            setStudents(Array.from({ length: 5 }).map((_, i) => ({ id: i.toString(), name: `Öğrenci ${i + 1}`, scores: {} })));
          }
          setStep(Step.SCORES);
        }} className="btn-primary text-lg px-8 py-3.5">
          Not Girişine Geç <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderScoresStep = () => (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Öğrenci Not Girişi</h2>

          <p className="text-sm text-slate-500">{metadata.className} Sınıfı - {questions.length} Soru</p>
          {isLoaded && <span className="text-xs text-green-600 flex items-center mt-1"><Save className="w-3 h-3 mr-1" /> Otomatik Kaydediliyor</span>}
        </div>

        <div className="flex items-center gap-2">
          <DataImport questions={questions} onImport={(newStudents) => setStudents(newStudents)} />
          <button
            onClick={loadSavedClasses}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-bold transition-all"
            title="Kayıtlı Sınıf Yükle"
          >
            <Download className="w-4 h-4 mr-1" /> Sınıf Yükle
          </button>
          <button
            onClick={() => setShowBulkAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-bold transition-all"
          >
            <List className="w-4 h-4 mr-1" /> Toplu Ekle
          </button>
          <button
            onClick={saveCurrentClass}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-bold transition-all"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            Sınıfı Kaydet
          </button>
          <button onClick={addStudent} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold transition-all shadow-md hover:shadow-green-500/30">
            <Plus className="w-5 h-5 mr-1" /> Öğrenci Ekle
          </button>
        </div>
      </div>

      <div className="overflow-auto border border-slate-200 rounded-xl flex-1 shadow-inner bg-slate-50 relative">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-4 py-4 border-b border-slate-200 font-bold w-12 text-center bg-slate-100">No</th>
              <th className="px-4 py-4 border-b border-slate-200 min-w-[200px] font-bold bg-slate-100">Ad Soyad</th>
              {questions.map((q, idx) => (
                <th key={q.id} className="px-2 py-4 border-b border-slate-200 text-center min-w-[70px] bg-slate-100">
                  <div className="flex flex-col items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-bold mb-1">{idx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{q.maxScore}p</span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 border-b border-slate-200 text-center font-bold bg-slate-200 min-w-[80px]">Toplam</th>
              <th className="px-4 py-4 border-b border-slate-200 text-center font-bold bg-slate-100 w-16">Sil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {students.map((student, idx) => (
              <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="px-4 py-3 text-slate-500 font-medium text-center">{idx + 1}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    className="w-full bg-transparent border-b-2 border-transparent focus:border-indigo-500 focus:ring-0 p-1 text-slate-900 font-bold placeholder:font-normal"
                    value={student.name}
                    placeholder="İsim Giriniz"
                    onChange={(e) => setStudents(prev => prev.map(s => s.id === student.id ? { ...s, name: e.target.value } : s))}
                  />
                </td>
                {questions.map(q => (
                  <td key={q.id} className="px-2 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      max={q.maxScore}
                      className={`w-14 text-center border-2 rounded-lg p-2 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none ${(student.scores[q.id] || 0) > q.maxScore
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : (student.scores[q.id] !== undefined ? 'border-slate-300 bg-white text-slate-800' : 'border-slate-200 bg-slate-50 text-slate-400')
                        }`}
                      placeholder="-"
                      value={student.scores[q.id] === undefined ? '' : student.scores[q.id]}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        updateScore(student.id, q.id, val);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-black text-indigo-700 bg-slate-50 text-lg border-l border-slate-100">
                  {Object.values(student.scores).reduce((a: number, b: number) => a + b, 0)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => removeStudent(student.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between shrink-0 pt-4 border-t border-slate-100">
        <button onClick={() => setStep(Step.QUESTIONS)} className="flex items-center text-slate-600 hover:text-slate-900 font-bold px-5 py-3 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> Geri Dön
        </button>
        <button onClick={() => setStep(Step.ANALYSIS)} className="flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all">
          Analizi Tamamla <LayoutDashboard className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analiz Sonuçları</h1>
          <p className="text-slate-500 text-sm">Rapor hazır. İndirebilir veya yapay zeka ile yorumlayabilirsiniz.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAnalysis}
            className="text-green-600 font-bold hover:text-green-800 flex items-center bg-green-50 px-5 py-2.5 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
          >
            <Save className="w-5 h-5 mr-1" /> Kaydet
          </button>
          <button onClick={() => setStep(Step.SCORES)} className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center bg-indigo-50 px-5 py-2.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" /> Düzenlemeye Dön
          </button>
        </div>
      </div>

      <AnalysisView
        analysis={analysis}
        metadata={metadata}
        questions={questions}
        students={students}
        onApplyStudents={handleApplyOCRStudents}
        onAppendStudents={handleAppendOCRStudents}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-inter selection:bg-indigo-100 selection:text-indigo-700" >
      {/* Navbar */}
      < nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 py-3">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl mr-3 shadow-lg shadow-indigo-200">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">Sınav Analiz</span>
                <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">Uzmanı</span>
              </div>

              <button
                onClick={resetAnalysis}
                className="ml-6 flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Yeni Analiz</span>
              </button>
              <button
                onClick={() => setShowProgressDashboard(true)}
                className="ml-2 flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors relative"
              >
                <History className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Geçmiş</span>
                {analysisCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {analysisCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowQuestionBank(true)}
                className="ml-2 flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Soru Bankası</span>
              </button>
              <button
                onClick={() => setShowStudentPortal(true)}
                className="ml-2 flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <UserIcon className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Öğrenci Portalı</span>
              </button>
              <button
                onClick={() => setShowParentPortal(true)}
                className="ml-2 flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <Users className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Veli Portalı</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowAdminDashboard(true)}
                  className="ml-2 flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Yönetici</span>
                </button>
              )}

              <button
                onClick={() => setShowSettingsModal(true)}
                className="ml-2 flex items-center px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors"
                title="API Ayarları"
              >
                <Key className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">API</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { s: Step.METADATA, l: 'Ayarlar' },
                  { s: Step.QUESTIONS, l: 'Sorular' },
                  { s: Step.SCORES, l: 'Notlar' },
                  { s: Step.ANALYSIS, l: 'Analiz' }
                ].map((item, idx) => (
                  <div key={item.s} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all ${step === item.s ? 'bg-indigo-50 text-indigo-700 font-bold' : step > item.s ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${step === item.s ? 'bg-indigo-600 animate-pulse' : step > item.s ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm">{item.l}</span>
                    </div>
                    {idx < 3 && <div className="w-4 h-0.5 bg-slate-200 mx-1"></div>}
                  </div>
                ))}
              </div>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-4">
                <LanguageSelector variant="compact" />
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-slate-700">{user?.user_metadata?.full_name || user?.email}</span>
                  <span className="text-xs text-slate-500">{isAdmin ? 'Yönetici' : 'Kullanıcı'}</span>
                </div>
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-9 h-9 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <button onClick={signOut} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Çıkış Yap">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav >

      {/* Main Content */}
      < main className="py-10 px-4 sm:px-6 lg:px-8" >
        <div className="animate-fade-in-up">
          {step === Step.METADATA && renderMetadataStep()}
          {step === Step.QUESTIONS && renderQuestionsStep()}
          {step === Step.SCORES && renderScoresStep()}
          {step === Step.ANALYSIS && renderAnalysisStep()}
        </div>
      </main >

      {/* Modals */}
      {
        showClassModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Kayıtlı Sınıflar</h3>
                <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {savedClasses.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Henüz kayıtlı sınıf bulunmamaktadır.</p>
                ) : (
                  <div className="grid gap-4">
                    {savedClasses.map((cls) => (
                      <div key={cls.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex justify-between items-center group">
                        <div>
                          <h4 className="font-bold text-slate-800">{cls.name}</h4>
                          <p className="text-sm text-slate-500">{cls.school_name || '-'} - {cls.academic_year}</p>
                          <p className="text-xs text-slate-400 mt-1">{cls.grade}. Sınıf {cls.subject || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {step === Step.SCORES && (
                            <button
                              onClick={() => loadClass(cls, { mode: 'append' })}
                              className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-xs font-bold"
                            >
                              Listeye Ekle
                            </button>
                          )}
                          <button
                            onClick={() => loadClass(cls, { mode: 'replace' })}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold"
                          >
                            Seç ve Yükle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        showBulkAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Toplu Öğrenci Ekle</h3>
                <button onClick={() => setShowBulkAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-3">Öğrenci isimlerini alt alta yapıştırın veya yazın.</p>
                <textarea
                  className="w-full h-64 border-2 border-slate-300 rounded-lg p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                  placeholder="Ahmet Yılmaz&#10;Ayşe Demir&#10;Mehmet Kaya..."
                  value={bulkStudentText}
                  onChange={(e) => setBulkStudentText(e.target.value)}
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setShowBulkAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">İptal</button>
                  <button onClick={handleBulkAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Ekle</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Progress Dashboard Modal */}
      {
        showProgressDashboard && (
          <ProgressDashboard
            onLoadAnalysis={handleLoadAnalysis}
            onClose={() => setShowProgressDashboard(false)}
            scope={isAdmin ? 'all' : 'own'}
          />
        )
      }

      {/* Question Bank Modal */}
      {
        showQuestionBank && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Soru Bankası</h3>
                <button onClick={() => setShowQuestionBank(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <QuestionBankDashboard />
              </div>
            </div>
          </div>
        )
      }

      {/* Student Portal Modal */}
      {
        showStudentPortal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Öğrenci Portalı</h3>
                <button onClick={() => setShowStudentPortal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <StudentDashboard />
              </div>
            </div>
          </div>
        )
      }

      {/* Parent Portal Modal */}
      {
        showParentPortal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Veli Portalı</h3>
                <button onClick={() => setShowParentPortal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <ParentDashboard />
              </div>
            </div>
          </div>
        )
      }

      {/* Admin Dashboard Modal */}
      {
        showAdminDashboard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Yönetici Dashboard</h3>
                <button onClick={() => setShowAdminDashboard(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <AdminDashboard scope={isAdmin ? 'all' : 'own'} />
              </div>
            </div>
          </div>
        )
      }

      {/* Settings Modal */}
      {
        showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )
      }
    </div >
  );
}

function AuthWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  /* 
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border-t-4 border-red-600">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Yapılandırma Hatası</h2>
          <p className="text-slate-600 mb-6">
            Supabase bağlantı bilgileri (URL veya Anon Key) eksik. Lütfen Vercel panelinden environment variables ayarlarını kontrol edin.
          </p>
          <div className="bg-slate-100 p-4 rounded text-xs font-mono text-slate-500">
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Tanımlı' : '❌ Eksik'}<br />
            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Tanımlı' : '❌ Eksik'}
          </div>
        </div>
      </div>
    );
  }
  */

  // Require Google Auth login
  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <I18nProvider>
      <NotificationProvider>
        <AuthProvider>
          <AuthWrapper />
          <ToastContainer />
        </AuthProvider>
      </NotificationProvider>
    </I18nProvider>
  );
}
