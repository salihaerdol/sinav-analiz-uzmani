/**
 * Font Loader Service
 * Loads fonts dynamically for PDF generation to support Turkish characters
 */

import { jsPDF } from 'jspdf';

// Font URLs (Google Fonts CDN)
const FONTS = {
    regular: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf'
};

/**
 * Loads a font from a URL and returns it as a Base64 string
 */
const loadFontAsBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // remove data:font/ttf;base64, prefix
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Font loading failed for ${url}:`, error);
        throw error;
    }
};

/**
 * Adds Turkish-supporting fonts to the jsPDF document
 */
export const addTurkishFontsToPDF = async (doc: jsPDF): Promise<void> => {
    try {
        // Load fonts in parallel
        const [regularBase64, boldBase64] = await Promise.all([
            loadFontAsBase64(FONTS.regular),
            loadFontAsBase64(FONTS.bold)
        ]);

        // Add fonts to VFS (Virtual File System of jsPDF)
        doc.addFileToVFS('Roboto-Regular.ttf', regularBase64);
        doc.addFileToVFS('Roboto-Bold.ttf', boldBase64);

        // Register fonts
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

        // Set default font
        doc.setFont('Roboto', 'normal');

        console.log('Turkish fonts loaded successfully');
    } catch (error) {
        console.error('Failed to load Turkish fonts, falling back to standard fonts', error);
        // Fallback is automatic (Helvetica), but Turkish chars might be broken
    }
};
