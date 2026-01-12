// =====================================================
// MODÜL: AI ASSISTANT - TİPLER
// =====================================================

export type AIPromptCategory =
    | 'analysis'        // Genel analiz
    | 'student'         // Öğrenci odaklı
    | 'parent'          // Veli odaklı
    | 'remedial'        // Telafi/iyileştirme
    | 'comparison'      // Karşılaştırma
    | 'prediction'      // Tahmin/öngörü
    | 'custom';         // Özel istek

export type AITone =
    | 'formal'          // Resmi
    | 'friendly'        // Samimi
    | 'motivational'    // Motive edici
    | 'analytical'      // Analitik
    | 'brief';          // Kısa/özet

export type AIOutputFormat =
    | 'detailed'        // Detaylı rapor
    | 'bullet_points'   // Madde işaretli
    | 'table'           // Tablo formatı
    | 'action_plan'     // Eylem planı
    | 'summary';        // Özet

export interface AIPromptPreset {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AIPromptCategory;
    tone: AITone;
    outputFormat: AIOutputFormat;
    promptTemplate: string;
    isDefault: boolean;
    usageCount: number;
    tags: string[];
}

export interface AICustomRequest {
    basePresetId?: string;
    customPrompt: string;
    focusAreas: string[];
    includeStudentNames: boolean;
    includeActionPlan: boolean;
    tone: AITone;
    outputFormat: AIOutputFormat;
    additionalContext?: string;
    targetAudience: 'teacher' | 'admin' | 'parent' | 'student';
}

export interface AIAnalysisHistory {
    id: string;
    userId: string;
    analysisId: string;
    presetId?: string;
    customRequest?: AICustomRequest;
    prompt: string;
    response: string;
    createdAt: string;
    isFavorite: boolean;
    rating?: 1 | 2 | 3 | 4 | 5;
    tags: string[];
}

export interface AIAssistantState {
    selectedPreset: AIPromptPreset | null;
    customRequest: AICustomRequest;
    isLoading: boolean;
    currentResponse: string | null;
    error: string | null;
    history: AIAnalysisHistory[];
}

export interface AIFocusArea {
    id: string;
    label: string;
    description: string;
    icon: string;
    promptAddition: string;
}

// Varsayılan değerler
export const DEFAULT_CUSTOM_REQUEST: AICustomRequest = {
    customPrompt: '',
    focusAreas: [],
    includeStudentNames: false,
    includeActionPlan: true,
    tone: 'formal',
    outputFormat: 'detailed',
    targetAudience: 'teacher'
};

export const AI_TONES: { value: AITone; label: string; description: string }[] = [
    { value: 'formal', label: 'Resmi', description: 'Profesyonel ve kurumsal dil' },
    { value: 'friendly', label: 'Samimi', description: 'Sıcak ve anlaşılır dil' },
    { value: 'motivational', label: 'Motive Edici', description: 'Teşvik edici ve pozitif' },
    { value: 'analytical', label: 'Analitik', description: 'Veri odaklı ve objektif' },
    { value: 'brief', label: 'Özet', description: 'Kısa ve öz' }
];

export const AI_OUTPUT_FORMATS: { value: AIOutputFormat; label: string; icon: string }[] = [
    { value: 'detailed', label: 'Detaylı Rapor', icon: '📄' },
    { value: 'bullet_points', label: 'Madde İşaretli', icon: '📋' },
    { value: 'table', label: 'Tablo Formatı', icon: '📊' },
    { value: 'action_plan', label: 'Eylem Planı', icon: '🎯' },
    { value: 'summary', label: 'Özet', icon: '📝' }
];

export const AI_TARGET_AUDIENCES: { value: AICustomRequest['targetAudience']; label: string; icon: string }[] = [
    { value: 'teacher', label: 'Öğretmen', icon: '👨‍🏫' },
    { value: 'admin', label: 'Yönetici', icon: '👔' },
    { value: 'parent', label: 'Veli', icon: '👪' },
    { value: 'student', label: 'Öğrenci', icon: '🎓' }
];
