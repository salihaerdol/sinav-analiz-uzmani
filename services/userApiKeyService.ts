/**
 * USER API KEY SERVICE
 * Kullanıcıların kendi API anahtarlarını yönetmesi için servis
 */

import { supabase } from './supabase';

// =====================================================
// TİP TANIMLARI
// =====================================================

export interface UserApiKeys {
    id: string;
    user_id: string;
    gemini_api_key: string | null;
    gemini_api_key_valid: boolean;
    gemini_last_verified: string | null;
    openai_api_key: string | null;
    total_ai_requests: number;
    last_ai_request: string | null;
    created_at: string;
    updated_at: string;
}

// =====================================================
// API KEY SERVİSİ
// =====================================================

export const userApiKeyService = {
    /**
     * Kullanıcının API anahtarlarını getir
     */
    async getApiKeys(): Promise<UserApiKeys | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_api_keys')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('API anahtarları getirilemedi:', error);
            return null;
        }

        return data;
    },

    /**
     * Gemini API Key kaydet
     */
    async saveGeminiApiKey(apiKey: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // API Key'i doğrula
        const isValid = await this.validateGeminiApiKey(apiKey);

        const record = {
            user_id: user.id,
            gemini_api_key: apiKey,
            gemini_api_key_valid: isValid,
            gemini_last_verified: new Date().toISOString()
        };

        const { error } = await supabase
            .from('user_api_keys')
            .upsert(record, { onConflict: 'user_id' });

        if (error) {
            console.error('Gemini API key kaydedilemedi:', error);
            return false;
        }

        return true;
    },

    /**
     * Gemini API Key doğrula
     */
    async validateGeminiApiKey(apiKey: string): Promise<boolean> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
                { method: 'GET' }
            );
            return response.ok;
        } catch (error) {
            console.error('API key doğrulama hatası:', error);
            return false;
        }
    },

    /**
     * Gemini API Key'i al (varsa)
     */
    async getGeminiApiKey(): Promise<string | null> {
        const keys = await this.getApiKeys();
        return keys?.gemini_api_key || null;
    },

    /**
     * API kullanım sayısını artır
     */
    async incrementAiRequestCount(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const keys = await this.getApiKeys();
        if (!keys) return;

        await supabase
            .from('user_api_keys')
            .update({
                total_ai_requests: (keys.total_ai_requests || 0) + 1,
                last_ai_request: new Date().toISOString()
            })
            .eq('user_id', user.id);
    },

    /**
     * API Key'i sil
     */
    async deleteGeminiApiKey(): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('user_api_keys')
            .update({
                gemini_api_key: null,
                gemini_api_key_valid: false
            })
            .eq('user_id', user.id);

        if (error) {
            console.error('API key silinemedi:', error);
            return false;
        }

        return true;
    },

    /**
     * API Key var mı kontrol et
     */
    async hasValidApiKey(): Promise<boolean> {
        const keys = await this.getApiKeys();
        return !!(keys?.gemini_api_key && keys?.gemini_api_key_valid);
    }
};

export default userApiKeyService;
