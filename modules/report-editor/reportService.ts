// =====================================================
// MODÜL 5: RAPOR EDİTÖRÜ - SUPABASE SERVİS
// =====================================================

import { supabase } from '../../services/supabase';
import { ReportTemplate } from './types';

const LOCAL_STORAGE_KEY = 'report_templates_local_v1';
const LOCAL_FALLBACK_FLAG = 'report_templates_use_local';

const canUseLocalStorage = () => {
    try {
        return typeof localStorage !== 'undefined';
    } catch {
        return false;
    }
};

const readLocalTemplates = (): ReportTemplate[] => {
    if (!canUseLocalStorage()) return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeLocalTemplates = (templates: ReportTemplate[]) => {
    if (!canUseLocalStorage()) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
};

const markLocalFallback = () => {
    if (!canUseLocalStorage()) return;
    localStorage.setItem(LOCAL_FALLBACK_FLAG, 'true');
};

const shouldUseLocalFallback = () => {
    if (!canUseLocalStorage()) return false;
    return localStorage.getItem(LOCAL_FALLBACK_FLAG) === 'true';
};

const createLocalId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const reportService = {
    async saveTemplate(template: ReportTemplate) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum açılmamış');

        const now = new Date().toISOString();
        const templateData = {
            ...template,
            user_id: user.id,
            updated_at: now
        };

        if (shouldUseLocalFallback()) {
            const existing = readLocalTemplates();
            let saved: ReportTemplate;
            if (template.id) {
                let found = false;
                saved = { ...templateData, updated_at: now };
                const next = existing.map((item) => {
                    if (item.id === template.id) {
                        found = true;
                        return saved;
                    }
                    return item;
                });
                if (!found) {
                    next.push(saved);
                }
                writeLocalTemplates(next);
            } else {
                saved = { ...templateData, id: createLocalId(), updated_at: now };
                writeLocalTemplates([saved, ...existing]);
            }
            return saved;
        }

        try {
            if (template.id) {
                const { data, error } = await supabase
                    .from('report_templates')
                    .update(templateData)
                    .eq('id', template.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }

            const { data, error } = await supabase
                .from('report_templates')
                .insert([templateData])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Rapor şablonu DB kaydı başarısız, local fallback kullanılıyor.', error);
            markLocalFallback();
            const existing = readLocalTemplates();
            let saved: ReportTemplate;
            if (template.id) {
                let found = false;
                saved = { ...templateData, updated_at: now };
                const next = existing.map((item) => {
                    if (item.id === template.id) {
                        found = true;
                        return saved;
                    }
                    return item;
                });
                if (!found) {
                    next.push(saved);
                }
                writeLocalTemplates(next);
            } else {
                saved = { ...templateData, id: createLocalId(), updated_at: now };
                writeLocalTemplates([saved, ...existing]);
            }
            return saved;
        }
    },

    async getTemplates() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        if (shouldUseLocalFallback()) {
            return readLocalTemplates()
                .filter((item) => item.user_id === user.id)
                .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
        }

        try {
            const { data, error } = await supabase
                .from('report_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            const hasLayoutData = (data || []).every((item: any) => Array.isArray(item.layout));
            if (!hasLayoutData && (data || []).length > 0) {
                markLocalFallback();
                return readLocalTemplates()
                    .filter((item) => item.user_id === user.id)
                    .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
            }
            return data as ReportTemplate[];
        } catch (error) {
            console.warn('Rapor şablonları DB okunamadı, local fallback kullanılıyor.', error);
            markLocalFallback();
            return readLocalTemplates()
                .filter((item) => item.user_id === user.id)
                .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
        }
    },

    async deleteTemplate(id: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum açılmamış');
            if (shouldUseLocalFallback()) {
                const existing = readLocalTemplates();
                writeLocalTemplates(existing.filter((item) => item.id !== id));
                return;
            }
            const { error } = await supabase
                .from('report_templates')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (error) {
            console.warn('Rapor şablonu silme DB başarısız, local fallback kullanılıyor.', error);
            markLocalFallback();
            const existing = readLocalTemplates();
            writeLocalTemplates(existing.filter((item) => item.id !== id));
        }
    },

    async setDefaultTemplate(id: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum açılmamış');

        if (shouldUseLocalFallback()) {
            const existing = readLocalTemplates();
            const next = existing.map((item) => {
                if (item.user_id !== user.id) return item;
                if (item.id === id) {
                    return { ...item, is_default: true, updated_at: new Date().toISOString() };
                }
                return { ...item, is_default: false };
            });
            writeLocalTemplates(next);
            return next.find((item) => item.id === id);
        }

        try {
            // Önce hepsini false yap
            await supabase
                .from('report_templates')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .neq('id', id);

            // Seçileni true yap
            const { data, error } = await supabase
                .from('report_templates')
                .update({ is_default: true })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Rapor şablonu varsayılan ayarı DB başarısız, local fallback kullanılıyor.', error);
            markLocalFallback();
            const existing = readLocalTemplates();
            const next = existing.map((item) => {
                if (item.user_id !== user.id) return item;
                if (item.id === id) {
                    return { ...item, is_default: true, updated_at: new Date().toISOString() };
                }
                return { ...item, is_default: false };
            });
            writeLocalTemplates(next);
            return next.find((item) => item.id === id);
        }
    }
};
