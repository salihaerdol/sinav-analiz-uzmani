import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, ExamMetadata } from '../types';

export const generateAIAnalysis = async (
  analysis: AnalysisResult,
  metadata: ExamMetadata
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analiz oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Yapay zeka analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.";
  }
};