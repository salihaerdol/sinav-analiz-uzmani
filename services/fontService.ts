/**
 * ═══════════════════════════════════════════════════════════════
 * FONT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Türkçe karakter desteği için font yükleme servisi
 */

import { jsPDF } from 'jspdf';

const FONTS = {
    regular: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf'
};

async function loadFontAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Font yükleme hatası:', error);
        throw error;
    }
}

export async function addTurkishFontsToPDF(doc: jsPDF): Promise<void> {
    try {
        const [regularBase64, boldBase64] = await Promise.all([
            loadFontAsBase64(FONTS.regular),
            loadFontAsBase64(FONTS.bold)
        ]);

        doc.addFileToVFS('Roboto-Regular.ttf', regularBase64);
        doc.addFileToVFS('Roboto-Bold.ttf', boldBase64);

        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto', 'normal');
    } catch (error) {
        console.warn('Türkçe fontlar yüklenemedi, varsayılan font kullanılacak');
    }
}
