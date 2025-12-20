import { AnalysisResult, QuestionConfig, Student, RiskLevel, StudentRisk, RiskSummary } from '../../types';

const riskCountsTemplate: Record<RiskLevel, number> = {
  'Düşük': 0,
  'Orta': 0,
  'Yüksek': 0,
  'Kritik': 0
};

export const riskLevelColors: Record<RiskLevel, { bg: string; text: string; fill: string }> = {
  'Düşük': { bg: 'bg-emerald-100', text: 'text-emerald-700', fill: '#10b981' },
  'Orta': { bg: 'bg-amber-100', text: 'text-amber-700', fill: '#f59e0b' },
  'Yüksek': { bg: 'bg-orange-100', text: 'text-orange-700', fill: '#f97316' },
  'Kritik': { bg: 'bg-red-100', text: 'text-red-700', fill: '#ef4444' }
};

export const getRiskLevel = (riskScore: number): RiskLevel => {
  if (riskScore >= 70) return 'Kritik';
  if (riskScore >= 55) return 'Yüksek';
  if (riskScore >= 35) return 'Orta';
  return 'Düşük';
};

export const calculateRiskScore = (percentage: number, classAverage: number): number => {
  let score = 100 - percentage;

  if (percentage < 50) score += 10;
  if (percentage < 30) score += 10;
  if (percentage < classAverage - 10) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const buildStudentRisks = (
  analysis: AnalysisResult,
  questions: QuestionConfig[],
  students: Student[]
): StudentRisk[] => {
  const totalMax = questions.reduce((sum, q) => sum + q.maxScore, 0);

  return students.map(student => {
    const score = Object.values(student.scores).reduce((sum: number, value: number) => sum + value, 0);
    const percentage = totalMax > 0 ? (score / totalMax) * 100 : 0;
    const riskScore = calculateRiskScore(percentage, analysis.classAverage);

    return {
      studentId: student.id,
      studentName: student.name,
      score,
      percentage,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      classAverage: analysis.classAverage
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
};

export const buildRiskSummary = (
  analysis: AnalysisResult,
  studentRisks: StudentRisk[]
): RiskSummary => {
  const riskCounts = { ...riskCountsTemplate };
  studentRisks.forEach(item => {
    riskCounts[item.riskLevel] += 1;
  });

  const averageRiskScore = studentRisks.length > 0
    ? studentRisks.reduce((sum, item) => sum + item.riskScore, 0) / studentRisks.length
    : 0;

  return {
    totalStudents: studentRisks.length,
    classAverage: analysis.classAverage,
    averageRiskScore,
    riskCounts,
    criticalStudents: studentRisks.filter(item => item.riskLevel === 'Kritik').slice(0, 5),
    highRiskStudents: studentRisks.filter(item => item.riskLevel === 'Yüksek').slice(0, 5)
  };
};

export const buildRiskRecommendations = (summary: RiskSummary): string[] => {
  const recommendations: string[] = [];
  const highTotal = summary.riskCounts['Kritik'] + summary.riskCounts['Yüksek'];

  if (summary.riskCounts['Kritik'] > 0) {
    recommendations.push('Kritik riskteki öğrenciler için bireysel destek planı oluşturun.');
  }

  if (highTotal >= Math.ceil(summary.totalStudents * 0.3)) {
    recommendations.push('Sınıfın en az %30’u riskli görünüyor. Konu tekrarları ve ek ölçme önerilir.');
  }

  if (summary.classAverage < 50) {
    recommendations.push('Sınıf ortalaması düşük. Öğretim stratejilerini ve soru dağılımını gözden geçirin.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Genel risk düzeyi düşük. Mevcut öğretim planı etkili görünüyor.');
  }

  return recommendations;
};
