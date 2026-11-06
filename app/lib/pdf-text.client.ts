import { MAX_PDF_BYTES, MAX_PDF_PAGES, MAX_QUIZ_SOURCE_CHARS } from './quiz';

export type PdfExtractResult = {text:string; pagesRead:number; totalPages:number; truncated:boolean};

/** Browser-only: binary PDF stays on the student's device. No OCR or PDF upload. */
export async function extractPdfText(file:File):Promise<PdfExtractResult>{
  if(!file.name.toLowerCase().endsWith('.pdf') && file.type!=='application/pdf') throw new Error('NOT_PDF');
  if(file.size<5 || file.size>MAX_PDF_BYTES) throw new Error('PDF_SIZE');
  const data=new Uint8Array(await file.arrayBuffer());
  if(String.fromCharCode(...data.slice(0,5))!=='%PDF-') throw new Error('NOT_PDF');
  // Dynamic imports prevent the heavy PDF parser from running during SSR or on other pages.
  const [pdfjs,workerModule]=await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc=workerModule.default;
  const task=pdfjs.getDocument({data,isEvalSupported:false,useSystemFonts:true});
  let document:Awaited<typeof task.promise>|null=null;
  try{
    document=await task.promise;
    const totalPages=document.numPages;
    const limit=Math.min(totalPages,MAX_PDF_PAGES);
    const paragraphs:string[]=[];
    let chars=0,pagesRead=0;
    let truncated=totalPages>MAX_PDF_PAGES;
    for(let i=1;i<=limit;i++){
      const page=await document.getPage(i);
      const content=await page.getTextContent();
      const line=content.items.map(item=>('str' in item && typeof item.str==='string')?item.str:'').join(' ').replace(/\s+/g,' ').trim();
      pagesRead++;
      if(line){
        const next=`[Page ${i}] ${line}\n`;
        const available=MAX_QUIZ_SOURCE_CHARS-chars;
        if(available<=0){truncated=true;break;}
        paragraphs.push(next.slice(0,available));
        chars+=Math.min(available,next.length);
        if(next.length>available){truncated=true;break;}
      }
    }
    return {text:paragraphs.join('\n').trim(),pagesRead,totalPages,truncated};
  }finally{
    if(document)await document.destroy();
    else await task.destroy();
  }
}
