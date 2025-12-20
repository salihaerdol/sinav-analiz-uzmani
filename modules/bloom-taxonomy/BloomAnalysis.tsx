import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { AnalysisResult, QuestionConfig, Student } from '../../types';
import { BLOOM_COLORS, buildBloomSummary } from './bloomCalculations';

interface Props {
  analysis: AnalysisResult;
  questions: QuestionConfig[];
  students: Student[];
}

export default function BloomAnalysis({ analysis, questions, students }: Props) {
  const summary = useMemo(
    () => buildBloomSummary(analysis, questions),
    [analysis, questions]
  );

  if (students.length === 0 || questions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
        <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Bloom Analizi</h3>
        <p className="text-slate-500 mt-2">
          Analiz için en az 1 soru ve 1 öğrenci gereklidir.
        </p>
      </div>
    );
  }

  const chartData = summary.levels.map(level => ({
    name: level.level,
    count: level.count,
    success: Number(level.averageSuccessRate.toFixed(1))
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-sky-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="w-7 h-7 mr-3" />
              Bloom Taksonomisi
            </h2>
            <p className="text-sky-100 mt-1">
              Bilişsel düzey dağılımı ve başarı analizi
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">%{summary.taggedRate.toFixed(0)}</div>
            <div className="text-sm text-sky-100">Etiketleme Oranı</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">Etiketli Soru</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-800">
            {summary.taggedQuestions}/{summary.totalQuestions}
          </div>
          <div className="text-xs text-slate-400 mt-1">Toplam soru</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">Alt Düzey</span>
            <Target className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-800">
            %{summary.lowerLevelRate.toFixed(0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Bilgi + Kavrama</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">Üst Düzey</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-800">
            %{summary.upperLevelRate.toFixed(0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Analiz ve üstü</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-sm">Ort. Başarı</span>
            <CheckCircle className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-slate-800">
            %{summary.averageSuccessRate.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Etiketli sorular</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Düzey Dağılımı</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: number, name: string) => name === 'success'
                ? [`%${value.toFixed(1)}`, 'Başarı']
                : [value, 'Soru Sayısı']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map(entry => (
                <Cell key={entry.name} fill={BLOOM_COLORS[entry.name as keyof typeof BLOOM_COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-2">
          Tooltip üzerinde her düzey için ortalama başarı oranı gösterilir.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Düzey Detayları</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Düzey</th>
                <th className="px-4 py-3 text-center font-bold">Soru Sayısı</th>
                <th className="px-4 py-3 text-center font-bold">Oran</th>
                <th className="px-4 py-3 text-center font-bold">Ortalama Başarı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.levels.map(level => (
                <tr key={level.level}>
                  <td className="px-4 py-3 font-medium text-slate-800">{level.level}</td>
                  <td className="px-4 py-3 text-center">{level.count}</td>
                  <td className="px-4 py-3 text-center">%{level.percentage.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center text-slate-600">%{level.averageSuccessRate.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`rounded-xl p-6 border ${summary.recommendations.length === 1 && summary.recommendations[0].includes('dengeli')
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-amber-50 border-amber-200'
        }`}>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Öneriler
        </h3>
        <ul className="space-y-2">
          {summary.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              {rec.includes('dengeli')
                ? <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
              }
              <span className="text-slate-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
