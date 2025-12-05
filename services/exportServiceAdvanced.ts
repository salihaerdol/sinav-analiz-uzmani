/**
 * Advanced Export Service with Bilingual Support (Turkish & English)
 * World-class educational reporting system
 * Version 2.0 - Professional Grade Export
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

// Language support
export type Language = 'tr' | 'en';

// Export scenario types
export type ExportScenario =
    | 'full_report'           // Tam rapor - tüm bölümler
    | 'executive_summary'     // Yönetici özeti - sadece önemli bilgiler
    | 'student_focused'       // Öğrenci odaklı - bireysel performans
    | 'outcome_analysis'      // Kazanım analizi - detaylı kazanım raporu
    | 'parent_report'         // Veli raporu - sade ve anlaşılır format
    | 'meb_standard';         // MEB standardı - resmi format

export interface ExportOptions {
    language: Language;
    scenario: ExportScenario;
    includeCharts: boolean;
    includeRecommendations: boolean;
    includeStudentList: boolean;
    compactMode: boolean;
}

const translations = {
    tr: {
        reportTitle: 'SINAV SONUÇ ANALİZ RAPORU',
        examAnalysisReport: 'Sınav Analiz Raporu',
        executiveSummary: 'YÖNETİCİ ÖZETİ',
        school: 'Okul',
        teacher: 'Öğretmen',
        class: 'Sınıf',
        subject: 'Ders',
        date: 'Tarih',
        term: 'Dönem',
        examNumber: 'Sınav No',
        examType: 'Sınav Türü',
        academicYear: 'Akademik Yıl',
        classAverage: 'Sınıf Ortalaması',
        totalStudents: 'Öğrenci Sayısı',
        totalQuestions: 'Soru Sayısı',
        visualAnalysis: 'Görsel Analiz ve Grafikler',
        questionAnalysis: 'Soru Bazlı Detaylı Analiz',
        outcomeAnalysis: 'Kazanım Bazlı Analiz',
        studentPerformance: 'Öğrenci Performans Tablosu',
        recommendations: 'ÖNERİLER VE DEĞERLENDİRME',
        questionNo: 'Soru',
        outcomeCode: 'Kazanım Kodu',
        outcomeDesc: 'Kazanım Tanımı',
        avgScore: 'Ort. Puan',
        successRate: 'Başarı %',
        status: 'Durum',
        successful: 'BAŞARILI',
        needsImprovement: 'GELİŞTİRİLMELİ',
        failed: 'BAŞARISIZ',
        studentName: 'Öğrenci Adı',
        totalScore: 'Toplam Puan',
        percentage: 'Yüzde',
        weakAreas: 'Güçlendirilmesi Gereken Kazanımlar',
        strongAreas: 'Başarılı Olunan Kazanımlar',
        generalEvaluation: 'Genel Değerlendirme',
        suggestions: 'Öneriler',
        mebReference: 'MEB Referansı',
        preparedBy: 'Raporu Hazırlayan',
        reportDate: 'Rapor Tarihi',
        signature: 'İmza',
        detailedStatistics: 'Detaylı İstatistikler',
        stdDev: 'Standart Sapma',
        median: 'Medyan (Ortanca)',
        maxScore: 'En Yüksek Puan',
        minScore: 'En Düşük Puan',
        scoreDistribution: 'Puan Dağılımı',
        gradeDistribution: 'Not Dağılımı',
        competencyMap: 'Yetkinlik Haritası',
        cognitiveAnalysis: 'Bilişsel Düzey Analizi',
        difficultyAnalysis: 'Güçlük Düzeyi Analizi',
        page: 'Sayfa',
        of: '/',
        confidential: 'GİZLİ - KURUMSAL KULLANIM İÇİN',
        generatedBy: 'Bu rapor Sınav Analiz Uzmanı tarafından otomatik oluşturulmuştur.',
        parentNotice: 'Sayın Veli',
        studentReportCard: 'Öğrenci Sınav Sonuç Belgesi',
        performanceSummary: 'Performans Özeti',
        actionRequired: 'Dikkat Gerektiren Alanlar',
        excellentAreas: 'Mükemmel Performans Gösterilen Alanlar',
        gradeExcellent: 'Pekiyi',
        gradeGood: 'İyi',
        gradeAverage: 'Orta',
        gradePass: 'Geçer',
        gradeFail: 'Başarısız',
        rank: 'Sıra',
        classRank: 'Sınıf Sıralaması',
        percentile: 'Yüzdelik Dilim',
        comparedToClass: 'Sınıf Ortalamasına Göre',
        aboveAverage: 'Ortalamanın Üstünde',
        belowAverage: 'Ortalamanın Altında',
        atAverage: 'Ortalama Düzeyde'
    },
    en: {
        reportTitle: 'EXAM ANALYSIS REPORT',
        examAnalysisReport: 'Exam Analysis Report',
        executiveSummary: 'EXECUTIVE SUMMARY',
        school: 'School',
        teacher: 'Teacher',
        class: 'Class',
        subject: 'Subject',
        date: 'Date',
        term: 'Term',
        examNumber: 'Exam No',
        examType: 'Exam Type',
        academicYear: 'Academic Year',
        classAverage: 'Class Average',
        totalStudents: 'Total Students',
        totalQuestions: 'Total Questions',
        visualAnalysis: 'Visual Analysis & Charts',
        questionAnalysis: 'Detailed Question Analysis',
        outcomeAnalysis: 'Learning Outcome Analysis',
        studentPerformance: 'Student Performance Table',
        recommendations: 'RECOMMENDATIONS AND EVALUATION',
        questionNo: 'Q#',
        outcomeCode: 'Outcome Code',
        outcomeDesc: 'Learning Outcome',
        avgScore: 'Avg. Score',
        successRate: 'Success %',
        status: 'Status',
        successful: 'SUCCESSFUL',
        needsImprovement: 'NEEDS IMPROVEMENT',
        failed: 'FAILED',
        studentName: 'Student Name',
        totalScore: 'Total Score',
        percentage: 'Percentage',
        weakAreas: 'Areas Needing Improvement',
        strongAreas: 'Strong Areas',
        generalEvaluation: 'General Evaluation',
        suggestions: 'Suggestions',
        mebReference: 'MEB Reference',
        preparedBy: 'Prepared By',
        reportDate: 'Report Date',
        signature: 'Signature',
        detailedStatistics: 'Detailed Statistics',
        stdDev: 'Standard Deviation',
        median: 'Median',
        maxScore: 'Highest Score',
        minScore: 'Lowest Score',
        scoreDistribution: 'Score Distribution',
        gradeDistribution: 'Grade Distribution',
        competencyMap: 'Competency Map',
        cognitiveAnalysis: 'Cognitive Level Analysis',
        difficultyAnalysis: 'Difficulty Level Analysis',
        page: 'Page',
        of: 'of',
        confidential: 'CONFIDENTIAL - FOR INSTITUTIONAL USE ONLY',
        generatedBy: 'This report was automatically generated by Exam Analysis Expert.',
        parentNotice: 'Dear Parent',
        studentReportCard: 'Student Exam Report',
        performanceSummary: 'Performance Summary',
        actionRequired: 'Areas Requiring Attention',
        excellentAreas: 'Areas of Excellent Performance',
        gradeExcellent: 'Excellent',
        gradeGood: 'Good',
        gradeAverage: 'Average',
        gradePass: 'Pass',
        gradeFail: 'Fail',
        rank: 'Rank',
        classRank: 'Class Ranking',
        percentile: 'Percentile',
        comparedToClass: 'Compared to Class Average',
        aboveAverage: 'Above Average',
        belowAverage: 'Below Average',
        atAverage: 'At Average'
    }
};

// Helper functions for stats
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

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Font loader with better error handling
const loadTurkishFont = async (doc: jsPDF): Promise<boolean> => {
    const fontUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf'
    ];

    for (const url of fontUrls) {
        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const buffer = await response.arrayBuffer();
            const fontFileName = 'Roboto-Regular.ttf';

            const base64String = arrayBufferToBase64(buffer);
            doc.addFileToVFS(fontFileName, base64String);
            doc.addFont(fontFileName, 'Roboto', 'normal');
            doc.setFont('Roboto');
            return true;
        } catch (e) {
            console.warn(`Failed to load font from ${url}`, e);
        }
    }

    console.warn('Could not load custom font from any source, falling back to default');
    return false;
};

/**
 * Generate AI-powered recommendations based on analysis
 */
function generateRecommendations(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    lang: Language = 'tr'
): {
    weakAreas: string[];
    strongAreas: string[];
    generalEvaluation: string;
    suggestions: string[];
    actionItems: string[];
    parentMessage: string;
} {
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];
    const suggestions: string[] = [];
    const actionItems: string[] = [];

    // Analyze areas
    analysis.outcomeStats.forEach(outcome => {
        if (outcome.isFailed) {
            weakAreas.push(`${outcome.code}: ${outcome.description} (%${outcome.successRate.toFixed(1)})`);
        } else if (outcome.successRate >= 75) {
            strongAreas.push(`${outcome.code}: ${outcome.description} (%${outcome.successRate.toFixed(1)})`);
        }
    });

    // Generate suggestions based on class performance
    if (analysis.classAverage < 50) {
        suggestions.push(
            lang === 'tr'
                ? '🔴 Sınıf genelinde temel kazanımlarda eksiklikler görülmektedir. Konu tekrarları ve telafi çalışmaları yapılması önerilir.'
                : '🔴 Deficiencies are observed in basic outcomes across the class. Subject reviews and remedial work are recommended.'
        );
        actionItems.push(
            lang === 'tr'
                ? 'Temel kavramların yeniden anlatılması için ek ders planlaması yapılmalı'
                : 'Schedule additional lessons for re-teaching fundamental concepts'
        );
    } else if (analysis.classAverage >= 75) {
        suggestions.push(
            lang === 'tr'
                ? '🟢 Sınıf düzeyi beklenen seviyenin üzerindedir. Öğrencileri daha üst düzey düşünme becerilerine yönlendirecek zenginleştirilmiş etkinlikler planlanabilir.'
                : '🟢 Class level is above expected. Enriched activities guiding students to higher-order thinking skills can be planned.'
        );
        actionItems.push(
            lang === 'tr'
                ? 'İleri düzey problem çözme etkinlikleri eklenebilir'
                : 'Advanced problem-solving activities can be added'
        );
    } else {
        suggestions.push(
            lang === 'tr'
                ? '🟡 Sınıf başarısı orta düzeydedir. Başarısı düşük öğrencilere yönelik bireyselleştirilmiş çalışmalar ile sınıf ortalaması artırılabilir.'
                : '🟡 Class success is at a medium level. Class average can be increased with individualized studies for low-achieving students.'
        );
    }

    // Weak outcome suggestions
    if (weakAreas.length > 0) {
        suggestions.push(
            lang === 'tr'
                ? `📊 Tespit edilen ${weakAreas.length} adet "Geliştirilmeli" kazanım için bir sonraki derste kısa bir tekrar yapılması ve örnek soru çözümleri ile pekiştirilmesi faydalı olacaktır.`
                : `📊 It would be beneficial to do a short review and reinforce with sample questions in the next lesson for the ${weakAreas.length} outcomes identified as "Needs Improvement".`
        );
        actionItems.push(
            lang === 'tr'
                ? `Başarısız kazanımlar için ek çalışma kağıdı hazırlanmalı (${weakAreas.length} kazanım)`
                : `Prepare additional worksheets for failed outcomes (${weakAreas.length} outcomes)`
        );
    }

    // Student distribution analysis
    const lowPerformers = analysis.studentStats.filter(s => s.percentage < 50).length;
    const highPerformers = analysis.studentStats.filter(s => s.percentage >= 85).length;

    if (lowPerformers > 0) {
        suggestions.push(
            lang === 'tr'
                ? `⚠️ %50 barajının altında kalan ${lowPerformers} öğrenci için veli bilgilendirmesi yapılması ve bireysel çalışma planı hazırlanması önerilir.`
                : `⚠️ It is recommended to inform parents and prepare individual study plans for the ${lowPerformers} students who are below the 50% threshold.`
        );
        actionItems.push(
            lang === 'tr'
                ? `${lowPerformers} öğrenci için veli görüşmesi planlanmalı`
                : `Schedule parent meetings for ${lowPerformers} students`
        );
    }

    if (highPerformers > 0) {
        actionItems.push(
            lang === 'tr'
                ? `${highPerformers} başarılı öğrenci için zenginleştirme etkinlikleri planlanabilir`
                : `Enrichment activities can be planned for ${highPerformers} high-performing students`
        );
    }

    // General evaluation
    const generalEvaluation =
        lang === 'tr'
            ? `Bu rapor, ${metadata.academicYear} Eğitim-Öğretim Yılı ${metadata.term}. Dönem ${metadata.subject} dersi ${metadata.examNumber}. ${metadata.examType} sonuçlarına göre hazırlanmıştır.\n\n` +
            `Sınıfın genel başarı ortalaması %${analysis.classAverage.toFixed(2)} olarak hesaplanmıştır. ` +
            `Sınavda yer alan toplam ${analysis.totalQuestions} sorunun analizi sonucunda; öğrencilerin ${strongAreas.length} kazanımda yüksek performans gösterdiği, ` +
            `${weakAreas.length} kazanımda ise desteğe ihtiyaç duyduğu tespit edilmiştir.`
            : `This report has been prepared based on the results of the ${metadata.academicYear} Academic Year ${metadata.term}${metadata.term === '1' ? 'st' : 'nd'} Term ${metadata.subject} ${metadata.examNumber} (${metadata.examType}).\n\n` +
            `The general success average of the class is calculated as ${analysis.classAverage.toFixed(2)}%. ` +
            `As a result of the analysis of ${analysis.totalQuestions} questions in the exam; it has been determined that students showed high performance in ${strongAreas.length} outcomes ` +
            `and needed support in ${weakAreas.length} outcomes.`;

    // Parent message
    const parentMessage = lang === 'tr'
        ? `Sayın Velimiz,\n\nÖğrencinizin ${metadata.subject} dersi ${metadata.examNumber}. ${metadata.examType} sonuçları ekte sunulmuştur. ` +
        `Sınıf ortalaması %${analysis.classAverage.toFixed(1)} olarak hesaplanmıştır. ` +
        `Öğrencinizin gelişim alanları ve güçlü yönleri detaylı olarak incelenmiş ve öneriler sunulmuştur.\n\n` +
        `Herhangi bir sorunuz olması halinde lütfen bizimle iletişime geçiniz.\n\nSaygılarımızla,\n${metadata.teacherName}`
        : `Dear Parent,\n\nPlease find attached your student's ${metadata.subject} ${metadata.examNumber}${metadata.examNumber === '1' ? 'st' : 'nd'} ${metadata.examType} results. ` +
        `The class average is ${analysis.classAverage.toFixed(1)}%. ` +
        `Your student's areas for improvement and strengths have been analyzed in detail with recommendations provided.\n\n` +
        `Please feel free to contact us if you have any questions.\n\nBest regards,\n${metadata.teacherName}`;

    return {
        weakAreas,
        strongAreas,
        generalEvaluation,
        suggestions,
        actionItems,
        parentMessage
    };
}

/**
 * Add professional header to each page
 */
const addProfessionalHeader = (
    doc: jsPDF,
    fontName: string,
    metadata: ExamMetadata,
    t: typeof translations.tr,
    pageNum: number,
    totalPages: number,
    sectionTitle?: string
) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top border line
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(10, 8, pageWidth - 10, 8);

    // Header text
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    // Left side - School and class info
    doc.text(`${metadata.schoolName} | ${metadata.className} | ${metadata.subject}`, 12, 6);

    // Right side - Page number
    doc.text(`${t.page} ${pageNum} ${t.of} ${totalPages}`, pageWidth - 12, 6, { align: 'right' });

    // Section title if provided
    if (sectionTitle) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(41, 128, 185);
        doc.text(sectionTitle, 14, 16);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 18, pageWidth - 14, 18);
    }
};

/**
 * Add professional footer to each page
 */
const addProfessionalFooter = (
    doc: jsPDF,
    fontName: string,
    t: typeof translations.tr,
    isConfidential: boolean = false
) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);

    // Footer text
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);

    const footerText = isConfidential ? t.confidential : t.generatedBy;
    doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Date on footer
    const today = new Date().toLocaleDateString('tr-TR');
    doc.text(today, pageWidth - 12, pageHeight - 8, { align: 'right' });
};

/**
 * Advanced PDF Export with Bilingual Support and Graphics
 */
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: {
        overview?: string;
        questionChart?: string;
        outcomeChart?: string;
        studentChart?: string;
        histogramChart?: string;
        radarChart?: string;
        gradePieChart?: string;
        questionSuccessChart?: string;
        cognitiveChart?: string;
        difficultyChart?: string;
    } = {},
    language: Language = 'tr',
    options: Partial<ExportOptions> = {}
) => {
    const t = translations[language];
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Default options
    const exportOptions: ExportOptions = {
        language,
        scenario: options.scenario || 'full_report',
        includeCharts: options.includeCharts ?? true,
        includeRecommendations: options.includeRecommendations ?? true,
        includeStudentList: options.includeStudentList ?? true,
        compactMode: options.compactMode ?? false
    };

    // Load font
    const fontLoaded = await loadTurkishFont(doc);
    const fontName = fontLoaded ? 'Roboto' : 'times';

    // Calculate total pages based on scenario
    let totalPages = 4; // Default for full report
    if (exportOptions.scenario === 'executive_summary') totalPages = 2;
    if (exportOptions.scenario === 'parent_report') totalPages = 2;
    if (exportOptions.compactMode) totalPages = Math.max(2, totalPages - 1);

    // Get recommendations
    const recs = generateRecommendations(analysis, metadata, language);

    // Calculate student scores for statistics
    const studentScores = students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0));
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);
    const studentPercentages = studentScores.map(s => (s / maxPossibleScore) * 100);
    const stdDev = calculateStandardDeviation(studentPercentages);
    const median = calculateMedian(studentPercentages);
    const maxScore = studentScores.length > 0 ? Math.max(...studentScores) : 0;
    const minScore = studentScores.length > 0 ? Math.min(...studentScores) : 0;

    // --- PAGE 1: COVER PAGE ---
    // Professional cover with gradient effect
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');

    // Decorative elements
    doc.setFillColor(52, 152, 219);
    doc.circle(-20, pageHeight / 4, 80, 'F');
    doc.circle(pageWidth + 30, pageHeight / 3, 60, 'F');

    // White section at bottom
    doc.setFillColor(255, 255, 255);
    doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

    // Main title
    doc.setFont(fontName, 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text(t.reportTitle, pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont(fontName, 'normal');
    doc.text(`${metadata.term}. ${t.term} - ${metadata.examNumber}. ${t.examType}`, pageWidth / 2, 75, { align: 'center' });

    // Decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    // School name
    doc.setFontSize(18);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.schoolName, pageWidth / 2, 100, { align: 'center' });

    // Academic year
    doc.setFontSize(12);
    doc.setFont(fontName, 'normal');
    doc.text(`${metadata.academicYear} ${language === 'tr' ? 'Eğitim Öğretim Yılı' : 'Academic Year'}`, pageWidth / 2, 112, { align: 'center' });

    // Info box in white section
    const infoBoxY = pageHeight / 2 + 20;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(30, infoBoxY, pageWidth - 60, 60, 3, 3, 'F');

    // Info grid
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);

    const leftCol = 45;
    const rightCol = pageWidth / 2 + 15;
    let infoY = infoBoxY + 15;

    doc.setFont(fontName, 'bold');
    doc.text(`${t.class}:`, leftCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(metadata.className, leftCol + 25, infoY);

    doc.setFont(fontName, 'bold');
    doc.text(`${t.subject}:`, rightCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(metadata.subject, rightCol + 25, infoY);

    infoY += 12;
    doc.setFont(fontName, 'bold');
    doc.text(`${t.teacher}:`, leftCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(metadata.teacherName, leftCol + 35, infoY);

    doc.setFont(fontName, 'bold');
    doc.text(`${t.date}:`, rightCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(metadata.date, rightCol + 25, infoY);

    infoY += 12;
    doc.setFont(fontName, 'bold');
    doc.text(`${t.totalStudents}:`, leftCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(students.length.toString(), leftCol + 45, infoY);

    doc.setFont(fontName, 'bold');
    doc.text(`${t.totalQuestions}:`, rightCol, infoY);
    doc.setFont(fontName, 'normal');
    doc.text(questions.length.toString(), rightCol + 40, infoY);

    // Key Statistics Box
    const statsBoxY = infoBoxY + 75;
    doc.setFillColor(41, 128, 185);
    doc.roundedRect(30, statsBoxY, pageWidth - 60, 35, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(fontName, 'bold');
    doc.text(`%${analysis.classAverage.toFixed(1)}`, pageWidth / 2, statsBoxY + 22, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(fontName, 'normal');
    doc.text(t.classAverage.toUpperCase(), pageWidth / 2, statsBoxY + 32, { align: 'center' });

    // Status indicators
    const statusY = statsBoxY + 50;
    const successColor = analysis.classAverage >= 50 ? [40, 167, 69] : [220, 53, 69];
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.circle(pageWidth / 2 - 30, statusY, 5, 'F');
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.setFontSize(10);
    doc.text(analysis.classAverage >= 50 ? t.successful : t.needsImprovement, pageWidth / 2 - 20, statusY + 3);

    // Footer on cover
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(t.generatedBy, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // --- PAGE 2: SUMMARY & STATISTICS ---
    doc.addPage();
    addProfessionalHeader(doc, fontName, metadata, t, 2, totalPages, t.detailedStatistics);

    let currentY = 25;

    // Statistics Cards Row
    const cardWidth = 42;
    const cardHeight = 28;
    const cardGap = 5;
    const cardsStartX = 14;

    const statsCards = [
        { label: t.classAverage, value: `%${analysis.classAverage.toFixed(1)}`, color: analysis.classAverage >= 50 ? [40, 167, 69] : [220, 53, 69] },
        { label: t.stdDev, value: stdDev.toFixed(2), color: [100, 100, 100] },
        { label: t.median, value: median.toFixed(1), color: [100, 100, 100] },
        { label: t.maxScore, value: maxScore.toString(), color: [40, 167, 69] }
    ];

    statsCards.forEach((card, i) => {
        const x = cardsStartX + (i * (cardWidth + cardGap));

        // Card background
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');

        // Card border
        doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
        doc.setLineWidth(0.5);
        doc.line(x, currentY, x + cardWidth, currentY);

        // Label
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(card.label, x + cardWidth / 2, currentY + 10, { align: 'center' });

        // Value
        doc.setFont(fontName, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(card.value, x + cardWidth / 2, currentY + 22, { align: 'center' });
    });

    currentY += cardHeight + 15;

    // Charts Section (2x2 grid)
    if (exportOptions.includeCharts) {
        const chartWidth = 88;
        const chartHeight = 55;

        // Row 1
        if (chartImages.gradePieChart) {
            doc.setFont(fontName, 'bold');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(t.gradeDistribution, 14, currentY);
            doc.addImage(chartImages.gradePieChart, 'PNG', 14, currentY + 3, chartWidth, chartHeight);
        }

        if (chartImages.histogramChart) {
            doc.text(t.scoreDistribution, 108, currentY);
            doc.addImage(chartImages.histogramChart, 'PNG', 108, currentY + 3, chartWidth, chartHeight);
        }

        currentY += chartHeight + 15;

        // Row 2
        if (chartImages.radarChart && currentY + chartHeight < pageHeight - 20) {
            doc.text(t.competencyMap, 14, currentY);
            doc.addImage(chartImages.radarChart, 'PNG', 14, currentY + 3, chartWidth, chartHeight);
        }

        if (chartImages.questionSuccessChart && currentY + chartHeight < pageHeight - 20) {
            doc.text(t.questionAnalysis, 108, currentY);
            doc.addImage(chartImages.questionSuccessChart, 'PNG', 108, currentY + 3, chartWidth, chartHeight);
        }
    }

    addProfessionalFooter(doc, fontName, t);

    // --- PAGE 3: DETAILED ANALYSIS ---
    doc.addPage();
    addProfessionalHeader(doc, fontName, metadata, t, 3, totalPages, t.questionAnalysis);
    currentY = 25;

    // Question Analysis Table
    const questionRows = analysis.questionStats.map((q, idx) => [
        (idx + 1).toString(),
        q.outcome.code,
        q.outcome.description.length > 45 ? q.outcome.description.substring(0, 45) + '...' : q.outcome.description,
        q.averageScore.toFixed(1),
        `%${q.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[t.questionNo, t.outcomeCode, t.outcomeDesc, t.avgScore, t.successRate]],
        body: questionRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            font: fontName,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 22, fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
                else data.cell.styles.textColor = [245, 158, 11];
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Outcome Analysis Table
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(41, 128, 185);
    doc.text(t.outcomeAnalysis, 14, currentY);
    currentY += 5;

    const outcomeRows = analysis.outcomeStats.map(stat => [
        stat.code,
        stat.description.length > 50 ? stat.description.substring(0, 50) + '...' : stat.description,
        `%${stat.successRate.toFixed(1)}`,
        stat.isFailed ? t.needsImprovement : t.successful
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[t.outcomeCode, t.outcomeDesc, t.successRate, t.status]],
        body: outcomeRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            font: fontName,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [52, 73, 94],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: 32, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === t.needsImprovement) {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [255, 240, 240];
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fillColor = [240, 255, 240];
                }
            }
        }
    });

    addProfessionalFooter(doc, fontName, t);

    // --- PAGE 4: STUDENT PERFORMANCE & RECOMMENDATIONS ---
    if (exportOptions.includeStudentList) {
        doc.addPage();
        addProfessionalHeader(doc, fontName, metadata, t, 4, totalPages, t.studentPerformance);
        currentY = 25;

        // Sort students by score
        const sortedStudents = [...students].sort((a, b) => {
            const scoreA = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
            const scoreB = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
            return scoreB - scoreA;
        });

        const studentRows = sortedStudents.map((s, idx) => {
            const totalScore = Object.values(s.scores).reduce((sum, sc) => sum + sc, 0);
            const percentage = (totalScore / maxPossibleScore) * 100;
            return [
                (idx + 1).toString(),
                s.name,
                totalScore.toString(),
                `%${percentage.toFixed(1)}`
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [[t.rank, t.studentName, t.totalScore, t.percentage]],
            body: studentRows,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                font: fontName,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                    if (val < 50) {
                        data.cell.styles.textColor = [220, 53, 69];
                        data.cell.styles.fillColor = [255, 245, 245];
                    } else if (val >= 85) {
                        data.cell.styles.textColor = [40, 167, 69];
                        data.cell.styles.fillColor = [245, 255, 245];
                    }
                }
            }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Recommendations Section
        if (exportOptions.includeRecommendations && currentY < pageHeight - 80) {
            doc.setFont(fontName, 'bold');
            doc.setFontSize(10);
            doc.setTextColor(41, 128, 185);
            doc.text(t.recommendations, 14, currentY);
            currentY += 8;

            // Weak Areas
            if (recs.weakAreas.length > 0) {
                doc.setFillColor(255, 245, 245);
                doc.roundedRect(14, currentY, pageWidth - 28, Math.min(recs.weakAreas.length * 8 + 10, 40), 2, 2, 'F');

                doc.setFont(fontName, 'bold');
                doc.setFontSize(8);
                doc.setTextColor(220, 53, 69);
                doc.text(`🔴 ${t.weakAreas} (${recs.weakAreas.length})`, 18, currentY + 6);

                doc.setFont(fontName, 'normal');
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                recs.weakAreas.slice(0, 3).forEach((area, idx) => {
                    const truncated = area.length > 80 ? area.substring(0, 80) + '...' : area;
                    doc.text(`• ${truncated}`, 20, currentY + 14 + (idx * 6));
                });

                currentY += Math.min(recs.weakAreas.length * 8 + 12, 45);
            }

            // Suggestions
            if (recs.suggestions.length > 0 && currentY < pageHeight - 40) {
                doc.setFillColor(245, 250, 255);
                doc.roundedRect(14, currentY, pageWidth - 28, Math.min(recs.suggestions.length * 10 + 10, 50), 2, 2, 'F');

                doc.setFont(fontName, 'bold');
                doc.setFontSize(8);
                doc.setTextColor(41, 128, 185);
                doc.text(`💡 ${t.suggestions}`, 18, currentY + 6);

                doc.setFont(fontName, 'normal');
                doc.setFontSize(7);
                doc.setTextColor(60, 60, 60);
                recs.suggestions.slice(0, 3).forEach((sugg, idx) => {
                    const lines = doc.splitTextToSize(sugg, pageWidth - 50);
                    doc.text(lines[0], 20, currentY + 14 + (idx * 8));
                });
            }
        }

        // Signature area
        currentY = pageHeight - 35;
        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`${t.preparedBy}: ${metadata.teacherName}`, 14, currentY);
        doc.text(`${t.reportDate}: ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`, 14, currentY + 6);

        // Signature line
        doc.text(t.signature, pageWidth - 50, currentY);
        doc.line(pageWidth - 50, currentY + 12, pageWidth - 14, currentY + 12);

        addProfessionalFooter(doc, fontName, t, true);
    }

    // Generate filename
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const filename = `${sanitize(metadata.schoolName)}_${sanitize(metadata.className)}_${sanitize(metadata.subject)}_${metadata.term}Donem_${metadata.examNumber}Sinav_${language.toUpperCase()}.pdf`;

    doc.save(filename);
};

/**
 * Quick Export - Single click exports with predefined scenarios
 */
export const quickExport = async (
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) => {
    const scenarioOptions: Record<ExportScenario, Partial<ExportOptions>> = {
        full_report: {
            includeCharts: true,
            includeRecommendations: true,
            includeStudentList: true,
            compactMode: false
        },
        executive_summary: {
            includeCharts: true,
            includeRecommendations: true,
            includeStudentList: false,
            compactMode: true
        },
        student_focused: {
            includeCharts: false,
            includeRecommendations: false,
            includeStudentList: true,
            compactMode: false
        },
        outcome_analysis: {
            includeCharts: true,
            includeRecommendations: true,
            includeStudentList: false,
            compactMode: false
        },
        parent_report: {
            includeCharts: false,
            includeRecommendations: true,
            includeStudentList: false,
            compactMode: true
        },
        meb_standard: {
            includeCharts: false,
            includeRecommendations: false,
            includeStudentList: true,
            compactMode: false
        }
    };

    await exportToPDFAdvanced(
        analysis,
        metadata,
        questions,
        students,
        chartImages,
        language,
        { ...scenarioOptions[scenario], scenario }
    );
};

/**
 * Export both Turkish and English reports
 */
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    // Turkish report
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');

    // English report with delay to prevent file conflicts
    setTimeout(async () => {
        await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'en');
    }, 500);
};

/**
 * Export Individual Student Reports (Bulk PDF)
 */
export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    const doc = new jsPDF();
    const t = translations[language];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load font
    const fontLoaded = await loadTurkishFont(doc);
    const fontName = fontLoaded ? 'Roboto' : 'times';

    const maxPossibleScore = questions.reduce((a, b) => a + b.maxScore, 0);
    const classAverage = analysis.classAverage;

    students.forEach((student, index) => {
        if (index > 0) doc.addPage();

        // Header with school branding
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFont(fontName, 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(t.studentReportCard, pageWidth / 2, 18, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(fontName, 'normal');
        doc.text(`${metadata.schoolName} | ${metadata.academicYear}`, pageWidth / 2, 30, { align: 'center' });

        // Student Info Card
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(14, 50, pageWidth - 28, 35, 3, 3, 'F');

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(11);

        let infoY = 62;
        doc.setFont(fontName, 'bold');
        doc.text(`${t.studentName}:`, 20, infoY);
        doc.setFont(fontName, 'normal');
        doc.text(student.name, 55, infoY);

        doc.setFont(fontName, 'bold');
        doc.text(`${t.class}:`, 120, infoY);
        doc.setFont(fontName, 'normal');
        doc.text(metadata.className, 140, infoY);

        infoY += 12;
        doc.setFont(fontName, 'bold');
        doc.text(`${t.subject}:`, 20, infoY);
        doc.setFont(fontName, 'normal');
        doc.text(metadata.subject, 45, infoY);

        doc.setFont(fontName, 'bold');
        doc.text(`${t.date}:`, 120, infoY);
        doc.setFont(fontName, 'normal');
        doc.text(metadata.date, 140, infoY);

        // Score Card
        const totalScore = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const percentage = (totalScore / maxPossibleScore) * 100;
        const isAboveAverage = percentage >= classAverage;

        const scoreCardY = 95;
        const scoreColor = percentage >= 85 ? [40, 167, 69] : percentage >= 50 ? [41, 128, 185] : [220, 53, 69];

        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.roundedRect(14, scoreCardY, pageWidth - 28, 45, 3, 3, 'F');

        // Score display
        doc.setFont(fontName, 'bold');
        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.text(`%${percentage.toFixed(1)}`, 40, scoreCardY + 28);

        doc.setFontSize(12);
        doc.text(`${totalScore}/${maxPossibleScore} ${t.totalScore}`, 40, scoreCardY + 40);

        // Comparison to class
        doc.setFont(fontName, 'normal');
        doc.setFontSize(10);
        doc.text(
            `${t.classAverage}: %${classAverage.toFixed(1)}`,
            pageWidth - 50,
            scoreCardY + 20
        );
        doc.text(
            isAboveAverage ? `▲ ${t.aboveAverage}` : `▼ ${t.belowAverage}`,
            pageWidth - 50,
            scoreCardY + 32
        );

        // Detailed Scores Table
        const tableY = 150;
        const studentRows = questions.map((q, idx) => {
            const score = student.scores[q.id] || 0;
            const qPercentage = (score / q.maxScore) * 100;
            return [
                (idx + 1).toString(),
                q.outcome.description.substring(0, 50) + (q.outcome.description.length > 50 ? '...' : ''),
                q.maxScore.toString(),
                score.toString(),
                `%${qPercentage.toFixed(0)}`
            ];
        });

        autoTable(doc, {
            startY: tableY,
            head: [[t.questionNo, t.outcomeDesc, 'Max', language === 'tr' ? 'Puan' : 'Score', '%']],
            body: studentRows,
            theme: 'grid',
            headStyles: {
                fillColor: [52, 73, 94],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
                font: fontName
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                font: fontName,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
                4: { cellWidth: 18, halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                    if (val < 50) {
                        data.cell.styles.textColor = [220, 53, 69];
                    } else if (val >= 85) {
                        data.cell.styles.textColor = [40, 167, 69];
                    }
                }
            },
            margin: { left: 14, right: 14 }
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(t.generatedBy, pageWidth / 2, pageHeight - 10, { align: 'center' });
    });

    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitize(metadata.className)}_Ogrenci_Karneleri_${language.toUpperCase()}.pdf`;
    doc.save(filename);
};

/**
 * Get available export scenarios with descriptions
 */
export const getExportScenarios = (language: Language = 'tr'): Array<{
    id: ExportScenario;
    name: string;
    description: string;
    icon: string;
}> => {
    if (language === 'tr') {
        return [
            { id: 'full_report', name: 'Tam Rapor', description: 'Tüm grafikler, tablolar ve öneriler dahil', icon: '📊' },
            { id: 'executive_summary', name: 'Yönetici Özeti', description: 'Sadece önemli istatistikler ve öneriler', icon: '📋' },
            { id: 'student_focused', name: 'Öğrenci Odaklı', description: 'Bireysel öğrenci performans listesi', icon: '👥' },
            { id: 'outcome_analysis', name: 'Kazanım Analizi', description: 'Detaylı kazanım bazlı rapor', icon: '🎯' },
            { id: 'parent_report', name: 'Veli Raporu', description: 'Veliler için sade ve anlaşılır format', icon: '👨‍👩‍👧' },
            { id: 'meb_standard', name: 'MEB Standardı', description: 'Resmi format, grafiksiz', icon: '🏫' }
        ];
    } else {
        return [
            { id: 'full_report', name: 'Full Report', description: 'All charts, tables and recommendations', icon: '📊' },
            { id: 'executive_summary', name: 'Executive Summary', description: 'Key statistics and recommendations only', icon: '📋' },
            { id: 'student_focused', name: 'Student Focused', description: 'Individual student performance list', icon: '👥' },
            { id: 'outcome_analysis', name: 'Outcome Analysis', description: 'Detailed learning outcome report', icon: '🎯' },
            { id: 'parent_report', name: 'Parent Report', description: 'Simple format for parents', icon: '👨‍👩‍👧' },
            { id: 'meb_standard', name: 'MEB Standard', description: 'Official format, no charts', icon: '🏫' }
        ];
    }
};
