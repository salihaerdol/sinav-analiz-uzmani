// =====================================================
// MODÜL 5: RAPOR EDİTÖRÜ - SUPABASE SERVİS
// =====================================================

import { supabase } from '../../services/supabase';
import { ReportTemplate } from './types';

export const reportService = {
    async saveTemplate(template: ReportTemplate) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum açılmamış');

        const templateData = {
            ...template,
            user_id: user.id,
            updated_at: new Date().toISOString()
        };

        if (template.id) {
            const { data, error } = await supabase
                .from('report_templates')
                .update(templateData)
                .eq('id', template.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from('report_templates')
                .insert([templateData])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    async getTemplates() {
        const { data, error } = await supabase
            .from('report_templates')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as ReportTemplate[];
    },

    async deleteTemplate(id: string) {
        const { error } = await supabase
            .from('report_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async setDefaultTemplate(id: string) {
        // Önce hepsini false yap
        await supabase
            .from('report_templates')
            .update({ is_default: false })
            .neq('id', id);

        // Seçileni true yap
        const { data, error } = await supabase
            .from('report_templates')
            .update({ is_default: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
