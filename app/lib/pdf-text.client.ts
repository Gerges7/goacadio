import { MAX_PDF_BYTES, MAX_PDF_PAGES, MAX_QUIZ_SOURCE_CHARS } from './quiz';

export type PdfExtractResult = {
  text: string;
  pagesRead: number;
  totalPages: number;
  truncated: boolean;
  skippedPages: number;
};

type PdfFailureCode = 'PDF_READER_LOAD' | 'PDF_PASSWORD' | 'PDF_READ' | 'PDF_NO_TEXT';

/** No file content is included in diagnostics or error messages. */
export class PdfReadFailure extends Error {
  constructor(public readonly code: PdfFailureCode, public readonly diagnostic: string) {
    super(code);
    this.name = 'PdfReadFailure';
  }
}

function diagnosticFor(error: unknown): string {
  const value = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  // Only a short technical exception message (not any extracted lecture text).
  return value.replace(/[\r\n]+/g, ' ').slice(0, 250);
}

/**
 * Browser-only PDF extraction. The binary is read in memory and NEVER uploaded.
 * Primary worker is embedded by Vite to avoid a missing /assets/ PDF.js worker
 * after Cloudflare deployments. External worker URL remains a fallback for CSPs
 * that prevent blob: workers.
 */
export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') throw new Error('NOT_PDF');
  if (file.size < 5 || file.size > MAX_PDF_BYTES) throw new Error('PDF_SIZE');

  const original = await file.arrayBuffer();
  const header = new Uint8Array(original, 0, Math.min(5, original.byteLength));
  if (String.fromCharCode(...header) !== '%PDF-') throw new Error('NOT_PDF');

  let pdfjs: typeof import('pdfjs-dist/legacy/build/pdf.mjs');
  try {
    pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  } catch (error) {
    throw new PdfReadFailure('PDF_READER_LOAD', diagnosticFor(error));
  }

  async function read(mode: 'embedded' | 'asset'): Promise<PdfExtractResult> {
    let worker: Worker | null = null;
    let task: ReturnType<typeof pdfjs.getDocument> | null = null;
    let document: Awaited<ReturnType<typeof pdfjs.getDocument>['promise']> | null = null;
    try {
      pdfjs.GlobalWorkerOptions.workerPort = null;
      if (mode === 'embedded') {
        // Vite inlines the worker as a blob. This avoids asset URL resolution
        // issues caused by framework/client + Workers SSR builds.
        const { default: MakeWorker } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker&inline');
        worker = new MakeWorker();
        pdfjs.GlobalWorkerOptions.workerPort = worker;
      } else {
        const { default: workerUrl } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(workerUrl, window.location.href).href;
      }

      // PDF.js transfers the array buffer to its worker, so every attempt must
      // receive a fresh copy. Otherwise retrying may read a detached buffer.
      task = pdfjs.getDocument({
        data: new Uint8Array(original.slice(0)),
        isEvalSupported: false,
        useSystemFonts: true,
      });
      document = await task.promise;
      const totalPages = document.numPages;
      const limit = Math.min(totalPages, MAX_PDF_PAGES);
      let chars = 0;
      let pagesRead = 0;
      let skippedPages = 0;
      let truncated = totalPages > MAX_PDF_PAGES;
      const pages: string[] = [];
      for (let i = 1; i <= limit; i++) {
        try {
          const page = await document.getPage(i);
          const items = (await page.getTextContent()).items;
          const text = items.map(item => ('str' in item && typeof item.str === 'string') ? item.str : '')
            .join(' ').replace(/\s+/g, ' ').trim();
          pagesRead++;
          if (!text) continue;
          const part = `[Page ${i}] ${text}\n`;
          const available = MAX_QUIZ_SOURCE_CHARS - chars;
          if (available <= 0) { truncated = true; break; }
          pages.push(part.slice(0, available));
          chars += Math.min(part.length, available);
          if (part.length > available) { truncated = true; break; }
        } catch {
          // Text errors in a single page should not discard readable pages.
          skippedPages++;
        }
      }
      const text = pages.join('\n').trim();
      if (!text || text.length < 200) {
        // Distinguish a scanned PDF from a reader that failed on every page.
        if (skippedPages > 0) throw new PdfReadFailure('PDF_READ', `page extraction failed; skipped=${skippedPages}`);
        throw new PdfReadFailure('PDF_NO_TEXT', `pages=${pagesRead}; skipped=${skippedPages}`);
      }
      return { text, pagesRead, totalPages, truncated, skippedPages };
    } finally {
      try {
        if (document) await document.destroy();
        else if (task) await task.destroy();
      } catch {
        // A failed cleanup must not turn an already extracted document into an error.
      } finally {
        pdfjs.GlobalWorkerOptions.workerPort = null;
        worker?.terminate();
      }
    }
  }

  let firstFailure = '';
  try {
    return await read('embedded');
  } catch (error) {
    if (error instanceof PdfReadFailure && error.code === 'PDF_NO_TEXT') throw error;
    if (error instanceof Error && /password|PasswordException/i.test(`${error.name} ${error.message}`)) {
      throw new PdfReadFailure('PDF_PASSWORD', diagnosticFor(error));
    }
    firstFailure = diagnosticFor(error);
  }
  try {
    return await read('asset');
  } catch (error) {
    if (error instanceof PdfReadFailure && error.code === 'PDF_NO_TEXT') throw error;
    if (error instanceof Error && /password|PasswordException/i.test(`${error.name} ${error.message}`)) {
      throw new PdfReadFailure('PDF_PASSWORD', diagnosticFor(error));
    }
    throw new PdfReadFailure('PDF_READ', `embedded: ${firstFailure}; asset: ${diagnosticFor(error)}`.slice(0, 500));
  }
}
