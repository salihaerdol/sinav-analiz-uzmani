// =====================================================
// MODÜL: AI ASSISTANT - PRESET'LER VE ŞABLONLAR
// =====================================================

import { AIPromptPreset, AIFocusArea } from './types';

/**
 * Hazır AI Prompt Şablonları
 */
export const AI_PROMPT_PRESETS: AIPromptPreset[] = [
    // ═══════════════════════════════════════════════════════════════
    // ANALİZ KATEGORİSİ
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'general-analysis',
        name: 'Genel Sınav Analizi',
        description: 'Kapsamlı sınav değerlendirmesi ve öneriler',
        icon: '📊',
        category: 'analysis',
        tone: 'formal',
        outputFormat: 'detailed',
        promptTemplate: `Sınıf sınav sonuçlarını analiz et ve kapsamlı bir değerlendirme yap.

**Beklenen Çıktı:**
1. Genel Değerlendirme (sınıf ortalaması, dağılım)
2. Güçlü Yönler (başarılı kazanımlar)
3. Gelişim Alanları (düşük başarılı kazanımlar)
4. Öğretmen İçin Öneriler`,
        isDefault: true,
        usageCount: 0,
        tags: ['genel', 'analiz', 'rapor']
    },
    {
        id: 'quick-summary',
        name: 'Hızlı Özet',
        description: '2-3 cümlelik kısa değerlendirme',
        icon: '⚡',
        category: 'analysis',
        tone: 'brief',
        outputFormat: 'summary',
        promptTemplate: `Bu sınav sonuçlarını 2-3 cümleyle özetle. Sadece en kritik noktaları belirt.`,
        isDefault: true,
        usageCount: 0,
        tags: ['hızlı', 'özet', 'kısa']
    },
    {
        id: 'strength-weakness',
        name: 'Güçlü/Zayıf Yön Analizi',
        description: 'Detaylı SWOT benzeri analiz',
        icon: '⚖️',
        category: 'analysis',
        tone: 'analytical',
        outputFormat: 'bullet_points',
        promptTemplate: `Sınav sonuçlarına göre sınıfın güçlü ve zayıf yönlerini analiz et.

**Format:**
✅ GÜÇLÜ YÖNLER:
- [Madde madde listele]

⚠️ GELİŞİM ALANLARI:
- [Madde madde listele]

💡 ÖNCELİKLİ EYLEMLER:
- [En acil 3 öneri]`,
        isDefault: true,
        usageCount: 0,
        tags: ['swot', 'analiz', 'karşılaştırma']
    },

    // ═══════════════════════════════════════════════════════════════
    // ÖĞRENCİ ODAKLI
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'student-individual',
        name: 'Bireysel Öğrenci Analizi',
        description: 'Her öğrenci için kişiselleştirilmiş değerlendirme',
        icon: '👤',
        category: 'student',
        tone: 'friendly',
        outputFormat: 'detailed',
        promptTemplate: `Her öğrenci için kısa bireysel değerlendirme yap.

**Her öğrenci için:**
- Genel performans (ortalamanın üstü/altı)
- Güçlü olduğu kazanımlar
- Geliştirilmesi gereken alanlar
- Kişisel öneri (1 cümle)`,
        isDefault: true,
        usageCount: 0,
        tags: ['öğrenci', 'bireysel', 'kişisel']
    },
    {
        id: 'at-risk-students',
        name: 'Risk Altındaki Öğrenciler',
        description: 'Düşük performanslı öğrencilerin tespiti',
        icon: '🚨',
        category: 'student',
        tone: 'analytical',
        outputFormat: 'action_plan',
        promptTemplate: `Sınıf ortalamasının altında kalan öğrencileri tespit et.

**Analiz Et:**
1. Risk altındaki öğrenciler (isim ve yüzde)
2. Her öğrenci için spesifik zorluk alanları
3. Acil müdahale önerileri
4. Veli bilgilendirme gerekliliği`,
        isDefault: true,
        usageCount: 0,
        tags: ['risk', 'düşük', 'müdahale']
    },
    {
        id: 'top-performers',
        name: 'Başarılı Öğrenciler',
        description: 'Yüksek performanslı öğrenciler için zenginleştirme',
        icon: '🌟',
        category: 'student',
        tone: 'motivational',
        outputFormat: 'bullet_points',
        promptTemplate: `En başarılı öğrencileri değerlendir.

**Çıktı:**
- Başarılı öğrenci listesi
- Ortak güçlü yönleri
- Zenginleştirme aktivite önerileri
- İleri düzey çalışma materyali önerileri`,
        isDefault: true,
        usageCount: 0,
        tags: ['başarılı', 'zenginleştirme', 'ileri']
    },

    // ═══════════════════════════════════════════════════════════════
    // VELİ ODAKLI
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'parent-report',
        name: 'Veli Bilgilendirme Raporu',
        description: 'Velilere gönderilebilir format',
        icon: '👪',
        category: 'parent',
        tone: 'friendly',
        outputFormat: 'detailed',
        promptTemplate: `Velilere gönderilebilecek bir sınıf raporu hazırla.

**Üslup:** Anlaşılır, jargonsuz, yapıcı

**İçerik:**
1. Sınıfın genel durumu (basit dille)
2. Bu dönem işlenen konular ve başarı durumu
3. Evde desteklenebilecek alanlar
4. Bir sonraki dönem beklentileri`,
        isDefault: true,
        usageCount: 0,
        tags: ['veli', 'rapor', 'bilgilendirme']
    },
    {
        id: 'parent-meeting-prep',
        name: 'Veli Toplantısı Hazırlığı',
        description: 'Veli toplantısı için konuşma noktaları',
        icon: '🗣️',
        category: 'parent',
        tone: 'formal',
        outputFormat: 'bullet_points',
        promptTemplate: `Veli toplantısı için hazırlık notları oluştur.

**Hazırla:**
- Açılış konuşması (2-3 cümle)
- Paylaşılacak olumlu gelişmeler
- Dikkat çekilecek alanlar (yapıcı dille)
- Velilerden beklentiler
- Soru-cevap için olası sorular ve cevaplar`,
        isDefault: true,
        usageCount: 0,
        tags: ['toplantı', 'veli', 'hazırlık']
    },

    // ═══════════════════════════════════════════════════════════════
    // TELAFİ/İYİLEŞTİRME
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'remedial-plan',
        name: 'Telafi Eğitimi Planı',
        description: 'Eksik kazanımlar için ders planı',
        icon: '📚',
        category: 'remedial',
        tone: 'analytical',
        outputFormat: 'action_plan',
        promptTemplate: `Başarısız olunan kazanımlar için telafi planı oluştur.

**Her kazanım için:**
1. Kazanım kodu ve açıklaması
2. Önerilen telafi süresi (ders saati)
3. Kullanılacak yöntem/teknikler
4. Materyal önerileri
5. Değerlendirme yöntemi`,
        isDefault: true,
        usageCount: 0,
        tags: ['telafi', 'plan', 'kazanım']
    },
    {
        id: 'homework-suggestions',
        name: 'Ödev Önerileri',
        description: 'Eksik alanlara yönelik ödev fikirleri',
        icon: '📝',
        category: 'remedial',
        tone: 'friendly',
        outputFormat: 'bullet_points',
        promptTemplate: `Zayıf kazanımları güçlendirmek için ödev önerileri sun.

**Her zayıf kazanım için:**
- Kazanım adı
- 2-3 ödev fikri (kolay-orta-zor)
- Tahmini süre
- Evde yapılabilirlik durumu`,
        isDefault: true,
        usageCount: 0,
        tags: ['ödev', 'ev', 'çalışma']
    },
    {
        id: 'differentiated-activities',
        name: 'Farklılaştırılmış Etkinlikler',
        description: 'Seviyeye göre etkinlik önerileri',
        icon: '🎯',
        category: 'remedial',
        tone: 'analytical',
        outputFormat: 'table',
        promptTemplate: `Öğrenci seviyelerine göre farklılaştırılmış etkinlikler öner.

**Tablo Formatı:**
| Seviye | Kazanım | Etkinlik | Süre | Materyal |
|--------|---------|----------|------|----------|
| Düşük  | ...     | ...      | ...  | ...      |
| Orta   | ...     | ...      | ...  | ...      |
| Yüksek | ...     | ...      | ...  | ...      |`,
        isDefault: true,
        usageCount: 0,
        tags: ['farklılaştırma', 'etkinlik', 'seviye']
    },

    // ═══════════════════════════════════════════════════════════════
    // KARŞILAŞTIRMA
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'class-comparison',
        name: 'Şube Karşılaştırması',
        description: 'Farklı şubeleri karşılaştır (veri varsa)',
        icon: '📈',
        category: 'comparison',
        tone: 'analytical',
        outputFormat: 'table',
        promptTemplate: `Mevcut verilere göre performans karşılaştırması yap.

**Analiz Et:**
- Ortalama karşılaştırması
- Kazanım bazlı başarı farkları
- Öne çıkan/gerileyen alanlar
- Dengeleme önerileri`,
        isDefault: true,
        usageCount: 0,
        tags: ['karşılaştırma', 'şube', 'analiz']
    },
    {
        id: 'progress-tracking',
        name: 'Gelişim Takibi',
        description: 'Önceki sınavlarla karşılaştırma',
        icon: '📊',
        category: 'comparison',
        tone: 'motivational',
        outputFormat: 'detailed',
        promptTemplate: `Öğrencilerin gelişim durumunu değerlendir.

**Çıktı:**
- Genel ilerleme özeti
- En çok gelişen öğrenciler
- Dikkat gerektiren durumlar
- Motivasyon önerileri`,
        isDefault: true,
        usageCount: 0,
        tags: ['gelişim', 'takip', 'ilerleme']
    },

    // ═══════════════════════════════════════════════════════════════
    // TAHMİN/ÖNGÖRÜ
    // ═══════════════════════════════════════════════════════════════
    {
        id: 'year-end-prediction',
        name: 'Yıl Sonu Tahmini',
        description: 'Mevcut performansa göre projeksiyon',
        icon: '🔮',
        category: 'prediction',
        tone: 'analytical',
        outputFormat: 'detailed',
        promptTemplate: `Mevcut performansa göre yıl sonu tahmini yap.

**Değerlendir:**
- Beklenen sınıf ortalaması
- Risk altındaki öğrenci sayısı tahmini
- Kritik müdahale noktaları
- Hedeflere ulaşma olasılığı`,
        isDefault: true,
        usageCount: 0,
        tags: ['tahmin', 'projeksiyon', 'yıl sonu']
    },
    {
        id: 'lgs-readiness',
        name: 'LGS Hazırlık Durumu',
        description: '8. sınıflar için LGS odaklı analiz',
        icon: '🎓',
        category: 'prediction',
        tone: 'analytical',
        outputFormat: 'action_plan',
        promptTemplate: `8. sınıf öğrencilerinin LGS hazırlık durumunu değerlendir.

**Analiz Et:**
1. Mevcut durum özeti
2. LGS'de sık çıkan konulardaki başarı
3. Kritik eksikler ve önceliklendirme
4. Kalan sürede yapılması gerekenler
5. Öğrenci bazlı hedef puanlar`,
        isDefault: true,
        usageCount: 0,
        tags: ['lgs', 'sınav', '8. sınıf']
    }
];

/**
 * Odak Alanları - Prompt'a eklenebilecek ek yönergeler
 */
export const AI_FOCUS_AREAS: AIFocusArea[] = [
    {
        id: 'low-performers',
        label: 'Düşük Performanslı Öğrenciler',
        description: 'Sınıf ortalamasının altındaki öğrencilere odaklan',
        icon: '📉',
        promptAddition: 'Özellikle sınıf ortalamasının altında kalan öğrencilere odaklan ve onlar için spesifik öneriler sun.'
    },
    {
        id: 'specific-outcomes',
        label: 'Belirli Kazanımlar',
        description: 'Başarısız olunan kazanımlara derinlemesine odaklan',
        icon: '🎯',
        promptAddition: 'Başarı oranı %50\'nin altında kalan kazanımları derinlemesine analiz et ve her biri için ayrı öneriler sun.'
    },
    {
        id: 'motivation',
        label: 'Motivasyon Önerileri',
        description: 'Öğrenci motivasyonunu artıracak öneriler',
        icon: '💪',
        promptAddition: 'Öğrenci motivasyonunu artırmak için uygulanabilir stratejiler ve aktiviteler öner.'
    },
    {
        id: 'parent-communication',
        label: 'Veli İletişimi',
        description: 'Velilerle paylaşılabilecek içerik',
        icon: '👨‍👩‍👧',
        promptAddition: 'Velilerle paylaşılabilecek, anlaşılır ve yapıcı bir dilde öneriler hazırla.'
    },
    {
        id: 'classroom-activities',
        label: 'Sınıf İçi Etkinlikler',
        description: 'Derste uygulanabilecek aktiviteler',
        icon: '🏫',
        promptAddition: 'Sınıf ortamında uygulanabilecek, etkileşimli ve eğlenceli etkinlik önerileri sun.'
    },
    {
        id: 'digital-resources',
        label: 'Dijital Kaynaklar',
        description: 'Online araç ve materyal önerileri',
        icon: '💻',
        promptAddition: 'Konuyla ilgili kullanılabilecek dijital araçlar, web siteleri ve online kaynaklar öner.'
    },
    {
        id: 'assessment-ideas',
        label: 'Değerlendirme Fikirleri',
        description: 'Alternatif ölçme yöntemleri',
        icon: '📋',
        promptAddition: 'Geleneksel sınavlar dışında kullanılabilecek alternatif değerlendirme yöntemleri öner.'
    },
    {
        id: 'time-management',
        label: 'Zaman Planlaması',
        description: 'Kalan süre için planlama',
        icon: '⏰',
        promptAddition: 'Dönem sonuna kadar kalan süreyi en verimli kullanmak için haftalık/aylık plan öner.'
    }
];

/**
 * Kategori bilgileri
 */
export const AI_CATEGORIES = {
    analysis: { label: 'Genel Analiz', icon: '📊', color: 'indigo' },
    student: { label: 'Öğrenci Odaklı', icon: '👤', color: 'blue' },
    parent: { label: 'Veli Odaklı', icon: '👪', color: 'green' },
    remedial: { label: 'Telafi/İyileştirme', icon: '📚', color: 'amber' },
    comparison: { label: 'Karşılaştırma', icon: '📈', color: 'purple' },
    prediction: { label: 'Tahmin/Öngörü', icon: '🔮', color: 'rose' },
    custom: { label: 'Özel İstek', icon: '✨', color: 'slate' }
};

/**
 * Preset'i ID'ye göre bul
 */
export const getPresetById = (id: string): AIPromptPreset | undefined => {
    return AI_PROMPT_PRESETS.find(preset => preset.id === id);
};

/**
 * Kategoriye göre preset'leri filtrele
 */
export const getPresetsByCategory = (category: string): AIPromptPreset[] => {
    return AI_PROMPT_PRESETS.filter(preset => preset.category === category);
};

/**
 * Varsayılan preset'leri getir
 */
export const getDefaultPresets = (): AIPromptPreset[] => {
    return AI_PROMPT_PRESETS.filter(preset => preset.isDefault);
};
