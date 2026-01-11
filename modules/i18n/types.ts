// =====================================================
// MODÜL: ULUSLARARASILAŞTIRMA (i18n) - TYPE TANIMLARI
// =====================================================

/**
 * Desteklenen diller
 */
export type SupportedLanguage = 'tr' | 'en' | 'de' | 'ar';

/**
 * Dil bilgisi
 */
export interface LanguageInfo {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
    rtl: boolean;
    dateFormat: string;
    numberFormat: {
        decimal: string;
        thousand: string;
    };
}

/**
 * Çeviri anahtarları - Common
 */
export interface CommonTranslations {
    // Genel
    appName: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;

    // Eylemler
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    print: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;

    // Durum
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    draft: string;

    // Zaman
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    lastMonth: string;

    // Sayfalama
    page: string;
    of: string;
    showing: string;
    items: string;
    noResults: string;
}

/**
 * Çeviri anahtarları - Auth
 */
export interface AuthTranslations {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    loginSuccess: string;
    loginError: string;
    logoutSuccess: string;
    sessionExpired: string;
    unauthorized: string;
    forbidden: string;
}

/**
 * Çeviri anahtarları - Dashboard
 */
export interface DashboardTranslations {
    title: string;
    welcome: string;
    overview: string;
    statistics: string;
    recentActivity: string;
    quickActions: string;

    // KPIs
    totalStudents: string;
    totalExams: string;
    averageScore: string;
    passRate: string;
    riskStudents: string;

    // Grafikler
    performanceTrend: string;
    subjectComparison: string;
    bloomDistribution: string;
    difficultyAnalysis: string;
}

/**
 * Çeviri anahtarları - Exam
 */
export interface ExamTranslations {
    title: string;
    exams: string;
    newExam: string;
    editExam: string;
    deleteExam: string;
    examDetails: string;

    // Alanlar
    examName: string;
    subject: string;
    grade: string;
    date: string;
    duration: string;
    questions: string;
    students: string;
    score: string;

    // Analiz
    analyze: string;
    analysis: string;
    results: string;
    statistics: string;

    // Durumlar
    notStarted: string;
    inProgress: string;
    completed: string;
}

/**
 * Çeviri anahtarları - Student
 */
export interface StudentTranslations {
    title: string;
    students: string;
    studentDetails: string;
    studentProgress: string;

    // Alanlar
    name: string;
    studentNumber: string;
    className: string;
    parent: string;

    // Analiz
    strongPoints: string;
    weakPoints: string;
    recommendations: string;
    riskLevel: string;
}

/**
 * Çeviri anahtarları - Report
 */
export interface ReportTranslations {
    title: string;
    reports: string;
    newReport: string;
    generateReport: string;
    exportReport: string;

    // Türler
    classReport: string;
    studentReport: string;
    examReport: string;
    progressReport: string;

    // Seçenekler
    includeCharts: string;
    includeRecommendations: string;
    includeAIAnalysis: string;
}

/**
 * Çeviri anahtarları - Benchmark
 */
export interface BenchmarkTranslations {
    title: string;
    pisaComparison: string;
    timssComparison: string;
    nationalAverage: string;
    oecdAverage: string;
    yourScore: string;
    level: string;
    benchmark: string;
    aboveAverage: string;
    belowAverage: string;
    onTarget: string;
}

/**
 * Tüm çeviriler
 */
export interface Translations {
    common: CommonTranslations;
    auth: AuthTranslations;
    dashboard: DashboardTranslations;
    exam: ExamTranslations;
    student: StudentTranslations;
    report: ReportTranslations;
    benchmark: BenchmarkTranslations;
}

/**
 * Dil context değeri
 */
export interface I18nContextValue {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: <K extends keyof Translations>(namespace: K) => Translations[K];
    formatDate: (date: Date | string) => string;
    formatNumber: (num: number, decimals?: number) => string;
    formatCurrency: (amount: number) => string;
    languageInfo: LanguageInfo;
    availableLanguages: LanguageInfo[];
}
