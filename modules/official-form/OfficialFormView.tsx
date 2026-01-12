import React from 'react';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, LabelList, ComposedChart, Line
} from 'recharts';

interface Props {
    analysis: AnalysisResult;
    metadata: ExamMetadata;
    questions: QuestionConfig[];
    students: Student[];
}

export const OfficialFormView: React.FC<Props> = ({ analysis, metadata, questions, students }) => {
    const maxQuestions = 20;

    // Not dağılımı verisi
    const gradeDistribution = [
        {
            range: '0-50 arası', label: '(Geçmez)', count: students.filter(s => {
                const score = (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                return score < 50;
            }).length
        },
        {
            range: '50-60 arası', label: '(Geçer)', count: students.filter(s => {
                const score = (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                return score >= 50 && score < 60;
            }).length
        },
        {
            range: '60-70 arası', label: '(Orta)', count: students.filter(s => {
                const score = (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                return score >= 60 && score < 70;
            }).length
        },
        {
            range: '70-85 arası', label: '(İyi)', count: students.filter(s => {
                const score = (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                return score >= 70 && score < 85;
            }).length
        },
        {
            range: '85-100 arası', label: '(Pekiyi)', count: students.filter(s => {
                const score = (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                return score >= 85;
            }).length
        },
    ];

    const studentScores = students.map(s => (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0));
    const minScore = studentScores.length > 0 ? Math.min(...studentScores) : 0;
    const maxScore = studentScores.length > 0 ? Math.max(...studentScores) : 0;
    const avgScore = analysis.classAverage;

    return (
        <div id="official-meb-form" className="bg-white p-8 text-[10px] font-serif leading-tight w-[297mm] mx-auto border border-slate-200 shadow-xl print:shadow-none print:m-0">
            {/* Header */}
            <div className="text-center mb-4 relative">
                <h1 className="text-sm font-bold uppercase underline">SINAV ANALİZİ VE SINIF DEĞERLENDİRMESİ</h1>
                <div className="grid grid-cols-3 mt-4 text-left">
                    <div className="space-y-1">
                        <p><strong>Okul:</strong> {metadata.schoolName || 'KALEKAYA ORTAOKULU'}</p>
                        <p><strong>Öğretim Yılı:</strong> {metadata.academicYear || '2025-2026'}</p>
                        <p><strong>Ders:</strong> {metadata.subject}</p>
                        <p><strong>Ders Öğretmeni:</strong> {metadata.teacherName}</p>
                    </div>
                    <div className="space-y-1">
                        <p><strong>Sınıf:</strong> {metadata.className}</p>
                        <p><strong>Sınav Dönemi:</strong> {metadata.term}. Dönem</p>
                        <p><strong>Sınav Numarası:</strong> {metadata.examNumber}. Yazılı</p>
                        {metadata.date && (
                            <p><strong>Sınav Tarihi:</strong> {metadata.date}</p>
                        )}
                    </div>
                    <div className="text-right font-bold">
                        <p>{metadata.className}</p>
                        <p>{metadata.academicYear || '2025-2026'} {metadata.term}. Dönem</p>
                        <p>{metadata.examNumber}. Yazılı</p>
                    </div>
                </div>
            </div>

            {/* Main Student Table */}
            <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-black text-center">
                    <thead>
                        <tr className="bg-slate-50">
                            <th rowSpan={2} className="border border-black px-1 py-1 w-6">SIRA NO</th>
                            <th rowSpan={2} className="border border-black px-1 py-1 w-10">OKUL</th>
                            <th rowSpan={2} className="border border-black px-1 py-1 w-24">ADI</th>
                            <th rowSpan={2} className="border border-black px-1 py-1 w-24">SOYADI</th>
                            <th colSpan={maxQuestions} className="border border-black py-0.5">SORULAR</th>
                            <th colSpan={3} className="border border-black py-0.5">SONUÇ</th>
                        </tr>
                        <tr className="bg-slate-50">
                            {Array.from({ length: maxQuestions }).map((_, i) => (
                                <th key={i} className="border border-black px-0.5 py-0.5 w-5">{i + 1}</th>
                            ))}
                            <th className="border border-black px-1 py-0.5 w-10">PUAN</th>
                            <th className="border border-black px-1 py-0.5 w-16">Sonuç</th>
                            <th className="border border-black px-1 py-0.5 w-12">Girmedi Kopya</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, idx) => {
                            const total = (Object.values(student.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
                            let result = 'Geçmez';
                            if (total >= 85) result = 'Pekiyi';
                            else if (total >= 70) result = 'İyi';
                            else if (total >= 60) result = 'Orta';
                            else if (total >= 50) result = 'Geçer';

                            return (
                                <tr key={student.id}>
                                    <td className="border border-black py-0.5">{idx + 1}</td>
                                    <td className="border border-black py-0.5">{student.student_number}</td>
                                    <td className="border border-black py-0.5 text-left px-1">{student.name.split(' ')[0]}</td>
                                    <td className="border border-black py-0.5 text-left px-1">{student.name.split(' ').slice(1).join(' ')}</td>
                                    {Array.from({ length: maxQuestions }).map((_, i) => {
                                        const q = questions[i];
                                        return (
                                            <td key={i} className="border border-black py-0.5">
                                                {q ? student.scores[q.id] || 0 : ''}
                                            </td>
                                        );
                                    })}
                                    <td className="border border-black py-0.5 font-bold">{total}</td>
                                    <td className="border border-black py-0.5">{result}</td>
                                    <td className="border border-black py-0.5"></td>
                                </tr>
                            );
                        })}
                        {/* Success Rate Row */}
                        <tr className="bg-slate-50 font-bold">
                            <td colSpan={4} className="border border-black py-1 text-right px-2 uppercase">SORULARA GÖRE BAŞARI (%)</td>
                            {Array.from({ length: maxQuestions }).map((_, i) => {
                                const q = questions[i];
                                const stat = q ? analysis.questionStats.find(qs => qs.questionId === q.id) : null;
                                return (
                                    <td key={i} className="border border-black py-1">
                                        {stat ? stat.successRate.toFixed(0) : ''}
                                    </td>
                                );
                            })}
                            <td colSpan={3} className="border border-black"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Bottom Section: Topics, Charts, Stats */}
            <div className="grid grid-cols-12 gap-4">
                {/* Left: Topics Table */}
                <div className="col-span-3">
                    <table className="w-full border-collapse border border-black text-center">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="border border-black py-1 w-6"></th>
                                <th className="border border-black py-1">Konular</th>
                                <th className="border border-black py-1 w-10">Puan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q, i) => (
                                <tr key={q.id}>
                                    <td className="border border-black py-1">{i + 1}</td>
                                    <td className="border border-black py-1 text-left px-1 truncate max-w-[120px]">{q.outcome.code}</td>
                                    <td className="border border-black py-1">{q.maxScore}</td>
                                </tr>
                            ))}
                            {Array.from({ length: Math.max(0, 20 - questions.length) }).map((_, i) => (
                                <tr key={i + 100}>
                                    <td className="border border-black py-1 h-5"></td>
                                    <td className="border border-black py-1"></td>
                                    <td className="border border-black py-1"></td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 font-bold">
                                <td colSpan={2} className="border border-black py-1 text-right px-2">TOPLAM</td>
                                <td className="border border-black py-1">{questions.reduce((a, b) => a + b.maxScore, 0)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Not Dağılım Grafiği (Horizontal) */}
                    <div className="mt-4 border border-black p-2 h-40">
                        <p className="font-bold text-center mb-1">NOT DAĞILIM GRAFİĞİ</p>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={gradeDistribution} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="range" type="category" width={60} fontSize={8} />
                                <Bar dataKey="count" fill="#6366f1" barSize={15}>
                                    <LabelList dataKey="count" position="right" fontSize={8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Middle: Success Charts */}
                <div className="col-span-6 space-y-4">
                    <div className="border border-black p-2 h-44">
                        <p className="font-bold text-center mb-1 uppercase">SORULARA GÖRE BAŞARI YÜZDESİ GRAFİĞİ</p>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={analysis.questionStats.map((q, i) => ({ name: i + 1, rate: q.successRate }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={8} />
                                <YAxis fontSize={8} domain={[0, 100]} />
                                <Bar dataKey="rate" fill="#1e293b">
                                    <LabelList dataKey="rate" position="top" fontSize={7} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border border-black p-2 h-44">
                        <p className="font-bold text-center mb-1 uppercase">ÖĞRENCİLERE GÖRE BAŞARI GRAFİĞİ</p>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={students.map(s => ({ name: s.name.split(' ')[0], score: (Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0) }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={7} interval={0} angle={-45} textAnchor="end" height={40} />
                                <YAxis fontSize={8} domain={[0, 100]} />
                                <Bar dataKey="score" fill="#475569">
                                    <LabelList dataKey="score" position="top" fontSize={7} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Summary Tables */}
                <div className="col-span-3 space-y-4">
                    <div className="border border-black">
                        <p className="font-bold text-center bg-slate-50 py-1 border-b border-black">SINIF DEĞERLENDİRMESİ</p>
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-black">
                                <tr><td className="px-2 py-1">EN DÜŞÜK NOT:</td><td className="px-2 py-1 font-bold text-right">{minScore}</td></tr>
                                <tr><td className="px-2 py-1">EN YÜKSEK NOT:</td><td className="px-2 py-1 font-bold text-right">{maxScore}</td></tr>
                                <tr><td className="px-2 py-1">SINIF ORTALAMASI:</td><td className="px-2 py-1 font-bold text-right">{avgScore.toFixed(1)}</td></tr>
                                <tr><td className="px-2 py-1">BAŞARISIZ ÖĞRENCİ SAYISI:</td><td className="px-2 py-1 font-bold text-right">{students.filter(s => ((Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0)) < 50).length}</td></tr>
                                <tr><td className="px-2 py-1">BAŞARILI ÖĞRENCİ SAYISI:</td><td className="px-2 py-1 font-bold text-right">{students.filter(s => ((Object.values(s.scores) as any[]).reduce((a: number, b: any) => a + (Number(b) || 0), 0)) >= 50).length}</td></tr>
                                <tr><td className="px-2 py-1 uppercase">SINIFIN BAŞARI ORTALAMASI:</td><td className="px-2 py-1 font-bold text-right">%{analysis.averageSuccess.toFixed(0)}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border border-black">
                        <p className="font-bold text-center bg-slate-50 py-1 border-b border-black">NOT DAĞILIM ÇİZELGESİ</p>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-2 py-0.5 border-b border-black">Aralık</th>
                                    <th className="px-2 py-0.5 border-b border-black">Derece</th>
                                    <th className="px-2 py-0.5 border-b border-black text-right">Sayı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                {gradeDistribution.map((d, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-1">{d.range}</td>
                                        <td className="px-2 py-1">{d.label}</td>
                                        <td className="px-2 py-1 font-bold text-right">{d.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Evaluation Box */}
            <div className="mt-4 border border-black p-4 min-h-[100px]">
                <h3 className="font-bold text-center underline mb-2 uppercase">SINAV DEĞERLENDİRMESİ</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p>Sınıf genelinde <strong>%{analysis.averageSuccess.toFixed(1)}</strong> başarıya ulaşılmıştır.</p>
                        <p className="mt-2">Sınav, Ölçme Değerlendirme kriterleri bakımından başarılı kabul edilmektedir.</p>
                    </div>
                    <div className="text-slate-600 italic text-[9px]">
                        <p>Başarı oranı düşük kazanımlar: {analysis.outcomeStats.filter(o => o.successRate < 50).map(o => o.code).join(', ') || 'Yok'}</p>
                        <p className="mt-2">Başarının diğer konulara göre düşük olduğu konular sınıfta ilan edildi. Sınav soruları sınıfta çözüldü. Özellikle bu konular üzerinde ayrıntılı olarak açıklama yapıldı. Yapılan hatalar vurgulandı.</p>
                    </div>
                </div>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-8 grid grid-cols-2 text-center">
                <div>
                    <p className="font-bold">{metadata.teacherName}</p>
                    <p>Ders Öğretmeni</p>
                    <div className="mt-8 h-12 flex items-center justify-center">
                        <span className="text-slate-300 italic text-[8px]">[İmza]</span>
                    </div>
                </div>
                <div>
                    <p className="font-bold">SÜLEYMAN ALİ DALKIRAN</p>
                    <p>Okul Müdürü</p>
                    <div className="mt-8 h-12 flex items-center justify-center">
                        <span className="text-slate-300 italic text-[8px]">[Mühür / İmza]</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
