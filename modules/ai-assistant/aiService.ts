// =====================================================
// MODÜL: AI ASSISTANT - SERVİS
// =====================================================

import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ExamMetadata, Student, QuestionConfig } from '../../types';
import { userApiKeyService } from '../../services/userApiKeyService';
import { getApiKey } from '../../services/geminiService';
import {
    AIPromptPreset,
    AICustomRequest,
    AIAnalysisHistory,
    AITone,
    AIOutputFormat,
    DEFAULT_CUSTOM_REQUEST
} from './types';
import { AI_PROMPT_PRESETS, AI_FOCUS_AREAS, getPresetById } from './presets';

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Analiz verilerinden context oluştur
 */
const buildAnalysisContext = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    students: Student[],
    questions: QuestionConfig[],
    includeStudentNames: boolean
): string => {
    const failedOutcomes = analysis.outcomeStats
        .filter(o => o.isFailed)
        .map(o => `• ${o.code}: ${o.description} (Başarı: %${o.successRate.toFixed(1)})`);

    const successfulOutcomes = analysis.outcomeStats
        .filter(o => !o.isFailed && o.successRate > 70)
        .map(o => `• ${o.code}: ${o.description} (Başarı: %${o.successRate.toFixed(1)})`);

    const lowestQuestions = [...analysis.questionStats]
        .sort((a, b) => a.successRate - b.successRate)
        .slice(0, 3)
        .map(q => `• Soru ${q.questionId}: %${q.successRate.toFixed(1)} başarı - ${q.outcome.description}`);

    const highestQuestions = [...analysis.questionStats]
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 3)
        .map(q => `• Soru ${q.questionId}: %${q.successRate.toFixed(1)} başarı - ${q.outcome.description}`);

    // Öğrenci istatistikleri
    const sortedStudents = [...analysis.studentStats].sort((a, b) => b.percentage - a.percentage);
    const topStudents = sortedStudents.slice(0, 3);
    const bottomStudents = sortedStudents.slice(-3).reverse();

    let studentSection = '';
    if (includeStudentNames) {
        const getStudentName = (id: string) => students.find(s => s.id === id)?.name || `Öğrenci ${id}`;

        studentSection = `
EN BAŞARILI ÖĞRENCİLER:
${topStudents.map((s, i) => `${i + 1}. ${getStudentName(s.studentId)}: %${s.percentage.toFixed(1)}`).join('\n')}

EN DÜŞÜK PERFORMANSLI ÖĞRENCİLER:
${bottomStudents.map((s, i) => `${i + 1}. ${getStudentName(s.studentId)}: %${s.percentage.toFixed(1)}`).join('\n')}

TOPLAM ÖĞRENCİ SAYISI: ${students.length}
`;
    } else {
        studentSection = `
TOPLAM ÖĞRENCİ SAYISI: ${students.length}
EN YÜKSEK PUAN: %${sortedStudents[0]?.percentage.toFixed(1) || 0}
EN DÜŞÜK PUAN: %${sortedStudents[sortedStudents.length - 1]?.percentage.toFixed(1) || 0}
`;
    }

    return `
═══════════════════════════════════════════════════════════════
SINAV VERİLERİ
═══════════════════════════════════════════════════════════════

GENEL BİLGİLER:
• Ders: ${metadata.subject}
• Sınıf: ${metadata.className || metadata.grade + '. Sınıf'}
• Okul: ${metadata.schoolName || 'Belirtilmemiş'}
• Dönem: ${metadata.term}. Dönem, ${metadata.examNumber}. Sınav
• Sınav Türü: ${metadata.examType}
• Tarih: ${metadata.date || 'Belirtilmemiş'}

SINIF PERFORMANSI:
• Sınıf Ortalaması: %${analysis.classAverage.toFixed(2)}
• Toplam Soru Sayısı: ${questions.length}
• Değerlendirilen Kazanım Sayısı: ${analysis.outcomeStats.length}
${studentSection}

BAŞARISIZ KAZANIMLAR (<%50):
${failedOutcomes.length > 0 ? failedOutcomes.join('\n') : '• Tüm kazanımlarda yeterli başarı sağlanmış.'}

BAŞARILI KAZANIMLAR (>%70):
${successfulOutcomes.length > 0 ? successfulOutcomes.join('\n') : '• Henüz yüksek başarılı kazanım yok.'}

EN ZOR SORULAR:
${lowestQuestions.join('\n')}

EN KOLAY SORULAR:
${highestQuestions.join('\n')}

═══════════════════════════════════════════════════════════════
`;
};

/**
 * Ton direktifini oluştur
 */
const getToneDirective = (tone: AITone): string => {
    const directives: Record<AITone, string> = {
        formal: 'Resmi, profesyonel ve kurumsal bir dil kullan. Akademik terminoloji kullanabilirsin.',
        friendly: 'Samimi, sıcak ve anlaşılır bir dil kullan. Karmaşık terimleri basitleştir.',
        motivational: 'Pozitif, teşvik edici ve motive edici bir dil kullan. Başarıları ön plana çıkar.',
        analytical: 'Objektif, veri odaklı ve analitik bir dil kullan. Sayısal verilere atıfta bulun.',
        brief: 'Kısa, öz ve doğrudan bir dil kullan. Gereksiz detaylardan kaçın.'
    };
    return directives[tone];
};

/**
 * Format direktifini oluştur
 */
const getFormatDirective = (format: AIOutputFormat): string => {
    const directives: Record<AIOutputFormat, string> = {
        detailed: 'Detaylı bir rapor formatında yaz. Her bölümü açıkla ve gerekçelendir.',
        bullet_points: 'Madde işaretli liste formatında yaz. Her madde kısa ve net olsun.',
        table: 'Mümkün olduğunca tablo formatı kullan. Karşılaştırmaları tablolarla göster.',
        action_plan: 'Eylem planı formatında yaz. Her adımı numaralandır ve somut görevler belirt.',
        summary: 'Maksimum 3-4 paragraf olacak şekilde özet yaz. Sadece en kritik noktaları belirt.'
    };
    return directives[format];
};

/**
 * Hedef kitle direktifini oluştur
 */
const getAudienceDirective = (audience: AICustomRequest['targetAudience']): string => {
    const directives: Record<AICustomRequest['targetAudience'], string> = {
        teacher: 'Bu rapor öğretmenler içindir. Pedagojik terminoloji kullanabilir, sınıf yönetimi ve öğretim stratejilerine değinebilirsin.',
        admin: 'Bu rapor okul yöneticileri içindir. Genel başarı trendleri, karşılaştırmalar ve kurumsal öneriler sun.',
        parent: 'Bu rapor veliler içindir. Eğitim jargonundan kaçın, anlaşılır ve yapıcı bir dil kullan. Evde nasıl destek olabileceklerini açıkla.',
        student: 'Bu rapor öğrenciler içindir. Motive edici, anlaşılır ve yaşa uygun bir dil kullan. Somut çalışma önerileri sun.'
    };
    return directives[audience];
};

/**
 * Ana prompt'u oluştur
 */
export const buildPrompt = (
    preset: AIPromptPreset | null,
    customRequest: AICustomRequest,
    analysisContext: string
): string => {
    const parts: string[] = [];

    // Sistem rolü
    parts.push(`Sen uzman bir eğitim danışmanı ve ölçme değerlendirme uzmanısın. Türkiye Milli Eğitim Bakanlığı müfredatına hakimsin.`);

    // Hedef kitle
    parts.push(getAudienceDirective(customRequest.targetAudience));

    // Ton
    parts.push(getToneDirective(customRequest.tone));

    // Format
    parts.push(getFormatDirective(customRequest.outputFormat));

    // Veri bağlamı
    parts.push('\n' + analysisContext);

    // Preset şablonu veya özel istek
    if (preset) {
        parts.push(`\nGÖREV:\n${preset.promptTemplate}`);
    }

    // Özel prompt varsa ekle
    if (customRequest.customPrompt.trim()) {
        parts.push(`\nEK İSTEKLER:\n${customRequest.customPrompt}`);
    }

    // Odak alanları
    if (customRequest.focusAreas.length > 0) {
        const focusDirectives = customRequest.focusAreas
            .map(areaId => AI_FOCUS_AREAS.find(f => f.id === areaId)?.promptAddition)
            .filter(Boolean);

        if (focusDirectives.length > 0) {
            parts.push(`\nÖZEL ODAK ALANLARI:\n${focusDirectives.map(d => `• ${d}`).join('\n')}`);
        }
    }

    // Eylem planı eklenmesi istendiyse
    if (customRequest.includeActionPlan && customRequest.outputFormat !== 'action_plan') {
        parts.push('\nRaporun sonunda mutlaka somut bir "Eylem Planı" bölümü ekle.');
    }

    // Ek bağlam
    if (customRequest.additionalContext?.trim()) {
        parts.push(`\nEK BAĞLAM BİLGİSİ:\n${customRequest.additionalContext}`);
    }

    return parts.join('\n\n');
};

// ═══════════════════════════════════════════════════════════════
// AI SERVİS FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════

/**
 * AI analizi oluştur (gelişmiş versiyon)
 */
export const generateAdvancedAIAnalysis = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    students: Student[],
    questions: QuestionConfig[],
    options: {
        presetId?: string;
        customRequest?: Partial<AICustomRequest>;
    } = {}
): Promise<{ response: string; prompt: string; success: boolean }> => {
    const apiKey = await getApiKey();

    if (!apiKey) {
        return {
            response: "⚠️ API Anahtarı bulunamadı. Lütfen Ayarlar bölümünden Gemini API anahtarınızı girin.",
            prompt: '',
            success: false
        };
    }

    // Preset ve custom request'i birleştir
    const preset = options.presetId ? getPresetById(options.presetId) : null;
    const customRequest: AICustomRequest = {
        ...DEFAULT_CUSTOM_REQUEST,
        ...(preset ? {
            tone: preset.tone,
            outputFormat: preset.outputFormat
        } : {}),
        ...options.customRequest
    };

    // Context oluştur
    const analysisContext = buildAnalysisContext(
        analysis,
        metadata,
        students,
        questions,
        customRequest.includeStudentNames
    );

    // Prompt oluştur
    const prompt = buildPrompt(preset || null, customRequest, analysisContext);

    try {
        const ai = new GoogleGenAI({ apiKey });

        // API kullanımını kaydet
        await userApiKeyService.incrementAiRequestCount();

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        return {
            response: response.text || "Analiz oluşturulamadı.",
            prompt,
            success: true
        };
    } catch (error: any) {
        console.error("Gemini Error:", error);

        let errorMessage = "Yapay zeka analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.";

        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
            errorMessage = "❌ API anahtarınız geçersiz. Lütfen Ayarlar bölümünden geçerli bir Gemini API anahtarı girin.";
        } else if (error.message?.includes('quota') || error.message?.includes('429')) {
            errorMessage = "⚠️ API kullanım kotanız dolmuş. Lütfen daha sonra tekrar deneyin.";
        }

        return {
            response: errorMessage,
            prompt,
            success: false
        };
    }
};

/**
 * Preset ile hızlı analiz
 */
export const generateQuickAnalysis = async (
    presetId: string,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    students: Student[],
    questions: QuestionConfig[]
): Promise<string> => {
    const result = await generateAdvancedAIAnalysis(
        analysis,
        metadata,
        students,
        questions,
        { presetId }
    );
    return result.response;
};

/**
 * Özel prompt ile analiz
 */
export const generateCustomAnalysis = async (
    customPrompt: string,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    students: Student[],
    questions: QuestionConfig[],
    options: Partial<AICustomRequest> = {}
): Promise<string> => {
    const result = await generateAdvancedAIAnalysis(
        analysis,
        metadata,
        students,
        questions,
        {
            customRequest: {
                ...options,
                customPrompt
            }
        }
    );
    return result.response;
};

/**
 * Tüm preset'leri getir
 */
export const getAllPresets = (): AIPromptPreset[] => {
    return AI_PROMPT_PRESETS;
};

/**
 * Kategoriye göre preset'leri getir
 */
export const getPresetsByCategory = (category: string): AIPromptPreset[] => {
    return AI_PROMPT_PRESETS.filter(p => p.category === category);
};

/**
 * Odak alanlarını getir
 */
export const getFocusAreas = () => {
    return AI_FOCUS_AREAS;
};
