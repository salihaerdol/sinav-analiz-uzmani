// =====================================================
// MODÜL 5: RAPOR EDİTÖRÜ - TYPE TANIMLARI
// =====================================================

export type ReportComponentType =
    | 'header'
    | 'summary_stats'
    | 'bar_chart'
    | 'pie_chart'
    | 'radar_chart'
    | 'student_table'
    | 'outcome_table'
    | 'psychometric_table'
    | 'risk_card'
    | 'ai_comment'
    | 'free_text'
    | 'signature'
    | 'page_break';

export interface ReportComponent {
    id: string;
    type: ReportComponentType;
    title?: string;
    settings: Record<string, any>;
    order: number;
}

/**
 * Rapor bileşen seçim opsiyonları
 * Kullanıcı hangi bileşenlerin rapora dahil edileceğini seçebilir
 */
export interface ReportOptions {
    // Grafikler
    includeBarChart: boolean;
    includePieChart: boolean;
    includeRadarChart: boolean;

    // Tablolar
    includeStudentTable: boolean;
    includeOutcomeTable: boolean;

    // Analizler
    includeBloomAnalysis: boolean;
    includePsychometric: boolean;
    includeRiskAnalysis: boolean;

    // Diğer
    includeSummaryStats: boolean;
    includeAIRecommendations: boolean;
    includeHeader: boolean;
    includeSignature: boolean;
}

/**
 * Varsayılan rapor opsiyonları
 */
export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
    // Grafikler - varsayılan açık
    includeBarChart: true,
    includePieChart: true,
    includeRadarChart: false,

    // Tablolar - varsayılan açık
    includeStudentTable: true,
    includeOutcomeTable: true,

    // Analizler - Bloom ve Risk varsayılan açık
    includeBloomAnalysis: true,
    includePsychometric: false,
    includeRiskAnalysis: true,

    // Diğer
    includeSummaryStats: true,
    includeAIRecommendations: true,
    includeHeader: true,
    includeSignature: false
};

export interface ReportTemplate {
    id?: string;
    user_id?: string;
    name: string;
    description?: string;
    is_default: boolean;
    layout: ReportComponent[];
    settings: {
        paperSize: 'A4' | 'Letter';
        orientation: 'portrait' | 'landscape';
        margins: { top: number; bottom: number; left: number; right: number };
        fontFamily: string;
        primaryColor: string;
    };
    // Yeni: Bileşen seçim opsiyonları
    componentOptions?: ReportOptions;
    created_at?: string;
    updated_at?: string;
}

export const DRAGGABLE_ITEM_TYPE = 'REPORT_COMPONENT';

export const AVAILABLE_COMPONENTS: { type: ReportComponentType; label: string; icon: string }[] = [
    { type: 'header', label: 'Başlık Bloğu', icon: 'Heading' },
    { type: 'summary_stats', label: 'Özet İstatistikler', icon: 'LayoutGrid' },
    { type: 'bar_chart', label: 'Sütun Grafik', icon: 'BarChart3' },
    { type: 'pie_chart', label: 'Pasta Grafik', icon: 'PieChart' },
    { type: 'radar_chart', label: 'Radar Grafik', icon: 'Activity' },
    { type: 'student_table', label: 'Öğrenci Listesi', icon: 'Users' },
    { type: 'outcome_table', label: 'Kazanım Tablosu', icon: 'Target' },
    { type: 'psychometric_table', label: 'Psikometrik Tablo', icon: 'Gauge' },
    { type: 'risk_card', label: 'Risk Analizi', icon: 'AlertTriangle' },
    { type: 'ai_comment', label: 'AI Yorumu', icon: 'Bot' },
    { type: 'free_text', label: 'Serbest Metin', icon: 'Type' },
    { type: 'signature', label: 'İmza Alanı', icon: 'PenTool' },
    { type: 'page_break', label: 'Sayfa Sonu', icon: 'Scissors' },
];
