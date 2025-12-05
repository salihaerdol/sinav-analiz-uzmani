/**
 * GEMINI AI SERVICE
 * Kullanıcıların kendi API anahtarlarını kullanarak AI analizi yapmasını sağlar
 */

import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ExamMetadata } from '../types';
import { userApiKeyService } from './userApiKeyService';

// Geçici API key cache (session bazlı)
let cachedApiKey: string | null = null;

/**
 * API Key'i ayarla (session bazlı cache)
 */
export const setApiKey = (apiKey: string) => {
  cachedApiKey = apiKey;
};

/**
 * Mevcut API Key'i al
 */
export const getApiKey = async (): Promise<string | null> => {
  // Önce cache kontrol et
  if (cachedApiKey) return cachedApiKey;

  // Supabase'den kullanıcının API key'ini al
  const userKey = await userApiKeyService.getGeminiApiKey();
  if (userKey) {
    cachedApiKey = userKey;
    return userKey;
  }

  // En son .env'den kontrol et (fallback)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;

  return null;
};

/**
 * API Key'in geçerli olup olmadığını kontrol et
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
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
};

/**
 * AI analizi oluştur
 */
export const generateAIAnalysis = async (
  analysis: AnalysisResult,
  metadata: ExamMetadata,
  customApiKey?: string
): Promise<string> => {
  // API Key'i belirle
  const apiKey = customApiKey || await getApiKey();

  if (!apiKey) {
    return "⚠️ API Anahtarı bulunamadı. Lütfen Ayarlar bölümünden Gemini API anahtarınızı girin.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Identify lowest performing questions
  const lowestQuestions = [...analysis.questionStats]
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 3)
    .map(q => `Soru ${q.questionId} (%${q.successRate.toFixed(1)} başarı) - Konu: ${q.outcome.description}`);

  const promptData = {
    class: metadata.className,
    subject: metadata.subject,
    average: analysis.classAverage,
    failedOutcomes: analysis.outcomeStats
      .filter(o => o.isFailed)
      .map(o => `• ${o.code} (${o.description}) -> Başarı: %${o.successRate.toFixed(1)}`),
    successfulOutcomes: analysis.outcomeStats
      .filter(o => !o.isFailed && o.successRate > 75)
      .map(o => `• ${o.code} -> Başarı: %${o.successRate.toFixed(1)}`),
    lowestQuestions
  };

  const prompt = `
    Sen uzman bir eğitim koçu ve ölçme değerlendirme uzmanısın. Öğretmen için sınıfın sınav sonuçlarına dayalı resmi, yapıcı ve profesyonel bir analiz raporu yaz.
    
    Veriler:
    - Ders: ${promptData.subject}
    - Sınıf: ${promptData.class}
    - Sınıf Genel Ortalaması: %${promptData.average.toFixed(2)}
    
    KRİTİK BAŞARISIZ KAZANIMLAR (Geliştirilmesi Şart):
    ${promptData.failedOutcomes.length > 0 ? promptData.failedOutcomes.join('\n') : 'Yok, genel başarı yüksek.'}
    
    EN ÇOK ZORLANILAN SORULAR:
    ${promptData.lowestQuestions.join('\n')}
    
    BAŞARILI ALANLAR:
    ${promptData.successfulOutcomes.join('\n')}
    
    Lütfen şu formatta yanıt ver:
    
    **1. Genel Değerlendirme**
    (Sınıfın genel durumu hakkında kısa özet)
    
    **2. Başarı Analizi ve Güçlü Yönler**
    (Öğrencilerin iyi olduğu konular)
    
    **3. Geliştirilmesi Gereken Alanlar (Kritik)**
    (Başarısız olunan kazanımları ve zorlanılan soruları nedenleriyle irdele)
    
    **4. Öğretmen İçin Eylem Planı Önerileri**
    (Bu eksikleri gidermek için derste ne yapılmalı? Hangi telafi eğitimleri verilmeli? Somut öneriler sun.)
    
    Üslup: Resmi, pedagojik, çözüm odaklı.
  `;

  try {
    // API kullanımını kaydet
    await userApiKeyService.incrementAiRequestCount();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || "Analiz oluşturulamadı.";
  } catch (error: any) {
    console.error("Gemini Error:", error);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return "❌ API anahtarınız geçersiz. Lütfen Ayarlar bölümünden geçerli bir Gemini API anahtarı girin.";
    }

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return "⚠️ API kullanım kotanız dolmuş. Lütfen daha sonra tekrar deneyin veya başka bir API anahtarı kullanın.";
    }

    return "Yapay zeka analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

/**
 * Hızlı soru-cevap için AI kullan
 */
export const askAI = async (
  question: string,
  context?: string,
  customApiKey?: string
): Promise<string> => {
  const apiKey = customApiKey || await getApiKey();

  if (!apiKey) {
    return "⚠️ API Anahtarı bulunamadı.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = context
    ? `Bağlam: ${context}\n\nSoru: ${question}`
    : question;

  try {
    await userApiKeyService.incrementAiRequestCount();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || "Yanıt oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Bir hata oluştu.";
  }
};

/**
 * API Key durumunu kontrol et
 */
export const checkApiKeyStatus = async (): Promise<{
  hasKey: boolean;
  isValid: boolean;
  source: 'user' | 'env' | 'none';
}> => {
  // Kullanıcının kendi key'i var mı?
  const hasUserKey = await userApiKeyService.hasValidApiKey();
  if (hasUserKey) {
    return { hasKey: true, isValid: true, source: 'user' };
  }

  // .env'den key var mı?
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) {
    const isValid = await validateApiKey(envKey);
    return { hasKey: true, isValid, source: 'env' };
  }

  return { hasKey: false, isValid: false, source: 'none' };
};