import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, List, AlertCircle, CheckCircle } from 'lucide-react';
import { classListService, ClassList } from '../services/supabase';

export function ClassListManager() {
    const [classLists, setClassLists] = useState<ClassList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [newClass, setNewClass] = useState<ClassList>({
        grade: '5',
        subject: 'İngilizce',
        className: '',
        schoolName: '',
        teacherName: '',
        academicYear: '2025-2026'
    });

    useEffect(() => {
        loadClassLists();
    }, []);

    const loadClassLists = async () => {
        try {
            setLoading(true);
            const data = await classListService.getAll();
            setClassLists(data);
        } catch (err) {
            setError('Sınıf listeleri yüklenirken hata oluştu.');
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClass = async () => {
        if (!newClass.className || !newClass.schoolName) {
            setError('Sınıf adı ve okul adı zorunludur.');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await classListService.create(newClass);
            setSuccess('Sınıf başarıyla kaydedildi!');

            // Reset form
            setNewClass({
                grade: '5',
                subject: 'İngilizce',
                className: '',
                schoolName: '',
                teacherName: '',
                academicYear: '2025-2026'
            });

            // Reload list
            loadClassLists();
        } catch (err) {
            setError('Sınıf kaydedilirken hata oluştu.');
            console.error('Save error:', err);
        }
    };

    const handleDeleteClass = async (id: number) => {
        if (!confirm('Bu sınıfı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await classListService.delete(id);
            setSuccess('Sınıf başarıyla silindi!');
            loadClassLists();
        } catch (err) {
            setError('Sınıf silinirken hata oluştu.');
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <List className="w-6 h-6 mr-2 text-indigo-600" />
                        Sınıf Listeleri
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Sınıflarınızı Supabase'e kaydedin ve yönetin
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {/* Add New Class Form */}
            <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Yeni Sınıf Ekle
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Okul Adı *</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.schoolName}
                            onChange={(e) => setNewClass({ ...newClass, schoolName: e.target.value })}
                            placeholder="Örn: Atatürk Ortaokulu"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Öğretmen Adı</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.teacherName}
                            onChange={(e) => setNewClass({ ...newClass, teacherName: e.target.value })}
                            placeholder="Örn: Ayşe Yılmaz"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Sınıf Kademesi</label>
                        <select
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.grade}
                            onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                        >
                            <option value="5">5. Sınıf</option>
                            <option value="6">6. Sınıf</option>
                            <option value="7">7. Sınıf</option>
                            <option value="8">8. Sınıf</option>
                            <option value="9">9. Sınıf</option>
                            <option value="10">10. Sınıf</option>
                            <option value="11">11. Sınıf</option>
                            <option value="12">12. Sınıf</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Ders</label>
                        <select
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.subject}
                            onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                        >
                            <option value="İngilizce">İngilizce</option>
                            <option value="Matematik">Matematik</option>
                            <option value="Türkçe">Türkçe</option>
                            <option value="Fen Bilimleri">Fen Bilimleri</option>
                            <option value="Coğrafya">Coğrafya</option>
                            <option value="Tarih">Tarih</option>
                            <option value="Felsefe">Felsefe</option>
                            <option value="Din Kültürü ve Ahlak Bilgisi">DKAB</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Şube *</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.className}
                            onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                            placeholder="Örn: 5/A"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Akademik Yıl</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-sm"
                            value={newClass.academicYear}
                            onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })}
                            placeholder="Örn: 2025-2026"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSaveClass}
                    className="mt-4 flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md hover:shadow-indigo-500/30 transition-all"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                </button>
            </div>

            {/* Class List Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b-2 border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">Okul</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">Sınıf</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">Ders</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">Öğretmen</th>
                            <th className="px-4 py-3 text-left font-bold text-slate-700">Yıl</th>
                            <th className="px-4 py-3 text-center font-bold text-slate-700">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : classLists.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                    Henüz kayıtlı sınıf bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            classLists.map((cls) => (
                                <tr key={cls.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-800">{cls.schoolName}</td>
                                    <td className="px-4 py-3 text-slate-800 font-medium">{cls.grade}/{cls.className}</td>
                                    <td className="px-4 py-3 text-slate-800">{cls.subject}</td>
                                    <td className="px-4 py-3 text-slate-800">{cls.teacherName}</td>
                                    <td className="px-4 py-3 text-slate-800">{cls.academicYear}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleDeleteClass(cls.id!)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
