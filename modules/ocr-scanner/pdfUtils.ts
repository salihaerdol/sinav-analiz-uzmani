import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

let workerReady = false;

const ensureWorker = () => {
  if (workerReady) return;
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  workerReady = true;
};

export const getPdfPageCount = async (file: File): Promise<number> => {
  ensureWorker();
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const pageCount = pdf.numPages;
  pdf.cleanup();
  pdf.destroy();
  return pageCount;
};

export const renderPdfPageToBase64 = async (
  file: File,
  pageNumber = 1
): Promise<{ base64: string; mimeType: string }> => {
  if (typeof document === 'undefined') {
    throw new Error('PDF render icin tarayici ortami gereklidir.');
  }

  ensureWorker();
  const data = await file.arrayBuffer();
  const pdf = await getDocument({ data }).promise;
  const safePage = Math.max(1, Math.min(pageNumber, pdf.numPages));
  const page = await pdf.getPage(safePage);

  const baseViewport = page.getViewport({ scale: 1 });
  const maxWidth = 1600;
  const scale = Math.min(2, Math.max(0.8, maxWidth / baseViewport.width));
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas context olusturulamadi.');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';

  page.cleanup();
  pdf.cleanup();
  pdf.destroy();

  return { base64, mimeType: 'image/png' };
};
