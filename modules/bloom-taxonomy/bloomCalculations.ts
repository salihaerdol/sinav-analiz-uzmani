import { AnalysisResult, QuestionConfig } from '../../types';

export type BloomLevel =
  | 'Bilgi'
  | 'Kavrama'
  | 'Uygulama'
  | 'Analiz'
  | 'Sentez'
  | 'Değerlendirme';

export interface BloomLevelSummary {
  level: BloomLevel;
  count: number;
  percentage: number;
  averageSuccessRate: number;
}

export interface BloomSummary {
  totalQuestions: number;
  taggedQuestions: number;
  taggedRate: number;
  lowerLevelRate: number;
  upperLevelRate: number;
  averageSuccessRate: number;
  levels: BloomLevelSummary[];
  recommendations: string[];
}

export const BLOOM_LEVELS: BloomLevel[] = [
  'Bilgi',
  'Kavrama',
  'Uygulama',
  'Analiz',
  'Sentez',
  'Değerlendirme'
];

export const BLOOM_COLORS: Record<BloomLevel, string> = {
  Bilgi: '#94a3b8',
  Kavrama: '#38bdf8',
  Uygulama: '#22c55e',
  Analiz: '#f59e0b',
  Sentez: '#a855f7',
  Değerlendirme: '#ef4444'
};

const getQuestionSuccess = (analysis: AnalysisResult, questionId: number) => {
  const entry = analysis.questionStats.find(item => item.questionId === questionId);
  return entry ? entry.successRate : 0;
};

export const buildBloomSummary = (
  analysis: AnalysisResult,
  questions: QuestionConfig[]
): BloomSummary => {
  const totalQuestions = questions.length;
  const taggedQuestions = questions.filter(q => q.cognitiveLevel).length;
  const taggedRate = totalQuestions > 0 ? (taggedQuestions / totalQuestions) * 100 : 0;

  const levels = BLOOM_LEVELS.map(level => {
    const levelQuestions = questions.filter(q => q.cognitiveLevel === level);
    const count = levelQuestions.length;
    const percentage = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0;
    const successRates = levelQuestions.map(q => getQuestionSuccess(analysis, q.id));
    const averageSuccessRate = successRates.length > 0
      ? successRates.reduce((sum, value) => sum + value, 0) / successRates.length
      : 0;

    return {
      level,
      count,
      percentage,
      averageSuccessRate
    };
  });

  const lowerLevels = ['Bilgi', 'Kavrama'] as BloomLevel[];
  const upperLevels = ['Analiz', 'Sentez', 'Değerlendirme'] as BloomLevel[];
  const lowerCount = levels
    .filter(item => lowerLevels.includes(item.level))
    .reduce((sum, item) => sum + item.count, 0);
  const upperCount = levels
    .filter(item => upperLevels.includes(item.level))
    .reduce((sum, item) => sum + item.count, 0);

  const lowerLevelRate = totalQuestions > 0 ? (lowerCount / totalQuestions) * 100 : 0;
  const upperLevelRate = totalQuestions > 0 ? (upperCount / totalQuestions) * 100 : 0;

  const averageSuccessRate = levels.reduce((sum, item) => sum + (item.count > 0 ? item.averageSuccessRate : 0), 0)
    / (levels.filter(item => item.count > 0).length || 1);

  const recommendations: string[] = [];

  if (taggedRate < 60) {
    recommendations.push('Bilişsel düzey etiketleme oranı düşük. Soruları Bloom seviyelerine göre işaretlemek analizi iyileştirir.');
  }

  if (lowerLevelRate > 60) {
    recommendations.push('Alt düzey (Bilgi/Kavrama) soruların oranı yüksek. Üst düzey düşünmeyi ölçen soruları artırabilirsiniz.');
  }

  if (upperLevelRate < 20 && totalQuestions > 0) {
    recommendations.push('Üst düzey (Analiz/Sentez/Değerlendirme) sorular sınırlı. Daha derin düşünme becerilerini ölçen sorular ekleyin.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Bloom dağılımı dengeli görünüyor. Mevcut soru yapısı öğrenme hedeflerini destekliyor.');
  }

  return {
    totalQuestions,
    taggedQuestions,
    taggedRate,
    lowerLevelRate,
    upperLevelRate,
    averageSuccessRate,
    levels,
    recommendations
  };
};
