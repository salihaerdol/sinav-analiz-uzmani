import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { AnalysisResult, QuestionConfig, Student } from '../../types';

interface Props {
  analysis: AnalysisResult;
  questions: QuestionConfig[];
  students: Student[];
}

export const RiskDashboard: React.FC<Props> = ({ analysis, questions, students }) => {
  // Basit bir risk hesaplama mantığı (placeholder)
  const riskStudents = students.map(student => {
    const totalScore: number = (Object.values(student.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
    const maxPossible: number = questions.reduce((a: number, b: QuestionConfig) => a + (b.maxScore || 0), 0);
    const percentage = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

    let riskLevel: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik' = 'Düşük';
    if (percentage < 45) riskLevel = 'Kritik';
    else if (percentage < 60) riskLevel = 'Yüksek';
    else if (percentage < 75) riskLevel = 'Orta';

    return {
      ...student,
      percentage,
      riskLevel
    };
  }).sort((a, b) => a.percentage - b.percentage);

  const stats = {
    kritik: riskStudents.filter(s => s.riskLevel === 'Kritik').length,
    yuksek: riskStudents.filter(s => s.riskLevel === 'Yüksek').length,
    orta: riskStudents.filter(s => s.riskLevel === 'Orta').length,
    dusuk: riskStudents.filter(s => s.riskLevel === 'Düşük').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600 font-bold text-sm">Kritik Risk</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-700">{stats.kritik}</div>
          <div className="text-xs text-red-500 mt-1">Acil müdahale gerekli</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-600 font-bold text-sm">Yüksek Risk</span>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-700">{stats.yuksek}</div>
          <div className="text-xs text-orange-500 mt-1">Yakın takip gerekli</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-600 font-bold text-sm">Orta Risk</span>
            <Info className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-yellow-700">{stats.orta}</div>
          <div className="text-xs text-yellow-500 mt-1">Desteklenebilir</div>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-600 font-bold text-sm">Düşük Risk</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-700">{stats.dusuk}</div>
          <div className="text-xs text-green-500 mt-1">Başarılı</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
          Risk Altındaki Öğrenciler
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 text-left">Öğrenci</th>
                <th className="px-4 py-3 text-center">Başarı %</th>
                <th className="px-4 py-3 text-center">Risk Durumu</th>
                <th className="px-4 py-3 text-left">Öneri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riskStudents.filter(s => s.riskLevel !== 'Düşük').map(student => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${student.percentage < 50 ? 'text-red-600' : 'text-orange-600'}`}>
                      %{student.percentage.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.riskLevel === 'Kritik' ? 'bg-red-100 text-red-700' :
                      student.riskLevel === 'Yüksek' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {student.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {student.riskLevel === 'Kritik' ? 'Birebir etüt ve veli görüşmesi.' :
                      student.riskLevel === 'Yüksek' ? 'Ek ödev ve konu tekrarı.' :
                        'Soru çözüm saatlerine katılım.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
