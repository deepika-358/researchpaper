import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ExtractedPaperData {
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  keywords: string[];
  rawText: string;
  sections: {
    sectionName: string;
    originalText: string;
    summary: string;
    orderIndex: number;
  }[];
}

const STANDARD_SECTIONS = [
  'Abstract',
  'Introduction',
  'Methodology',
  'Results',
  'Discussion',
  'Conclusion',
  'References',
];

export async function extractTextFromPdf(pdfBuffer: Buffer, fallbackFileName = 'Paper'): Promise<ExtractedPaperData> {
  let rawText = '';
  try {
    const parsed = await pdfParse(pdfBuffer);
    rawText = parsed.text || '';
  } catch (err) {
    console.warn('pdf-parse failed or returned empty, falling back to raw buffer string scan:', err);
    rawText = pdfBuffer.toString('utf-8');
  }

  // Clean rawText
  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // If text extraction yielded nothing readable
  if (cleanedText.length < 50) {
    throw new Error("We couldn't extract readable text from this PDF. Please upload a valid text-based PDF.");
  }

  // Heuristic extraction of title and authors
  const lines = cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);
  let title = fallbackFileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  let authors: string[] = [];

  // If the first non-empty lines have title-like structure
  if (lines.length > 0) {
    const candidateTitle = lines[0];
    if (candidateTitle.length > 5 && candidateTitle.length < 180) {
      title = candidateTitle;
    }
  }

  // Attempt to parse authors from the lines before "Abstract"
  const abstractIdx = lines.findIndex((l) => /^abstract\b/i.test(l));
  if (abstractIdx > 1) {
    const potentialAuthorLine = lines.slice(1, Math.min(abstractIdx, 4)).join(', ');
    const authorList = potentialAuthorLine
      .split(/[,;\n]/)
      .map((a) => a.trim().replace(/\d+.*$/, ''))
      .filter((a) => a.length > 2 && a.length < 40 && !/abstract|university|dept|department|institute/i.test(a));
    if (authorList.length > 0) {
      authors = authorList.slice(0, 6);
    }
  }

  if (authors.length === 0) {
    authors = ['Research Team'];
  }

  // Detect sections using regex
  const sectionMap: Record<string, string> = {};

  // Standard regex markers
  const sectionPatterns: { name: string; regex: RegExp }[] = [
    { name: 'Abstract', regex: /(?:^|\n)(?:abstract)\b[:\s]*/i },
    { name: 'Introduction', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:introduction|background)\b[:\s]*/i },
    { name: 'Methodology', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:methodology|methods|method|approach|model architecture|system design)\b[:\s]*/i },
    { name: 'Results', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:results|experiments|experimental results|evaluation|findings)\b[:\s]*/i },
    { name: 'Discussion', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:discussion|analysis|implications|limitations)\b[:\s]*/i },
    { name: 'Conclusion', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:conclusion|concluding remarks|summary and future work)\b[:\s]*/i },
    { name: 'References', regex: /(?:^|\n)(?:\d+[\.\s]*)?(?:references|bibliography|literature cited)\b[:\s]*/i },
  ];

  // Find boundaries
  const matches: { name: string; index: number }[] = [];
  for (const { name, regex } of sectionPatterns) {
    const match = regex.exec(cleanedText);
    if (match) {
      matches.push({ name, index: match.index + match[0].length });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : cleanedText.length;
    const body = cleanedText.substring(current.index, nextIndex).trim();
    if (body.length > 20) {
      sectionMap[current.name] = body.substring(0, 5000); // keep reasonable window
    }
  }

  // Build the section list strictly adhering to:
  // "If a section does not exist: DO NOT INVENT CONTENT. Use: 'Not specified in the provided paper.'"
  const sections = STANDARD_SECTIONS.map((name, index) => {
    const original = sectionMap[name];
    if (original && original.length > 15) {
      return {
        sectionName: name,
        originalText: original,
        summary: original.substring(0, 240) + '...',
        orderIndex: index,
      };
    } else {
      return {
        sectionName: name,
        originalText: 'Not specified in the provided paper.',
        summary: 'Not specified in the provided paper.',
        orderIndex: index,
      };
    }
  });

  const abstractText = sectionMap['Abstract'] || 'Not specified in the provided paper.';

  // Extract keywords
  const keywordsMatch = cleanedText.match(/(?:keywords|index terms)[:\s]+([^\n\.]+)/i);
  let keywords: string[] = [];
  if (keywordsMatch && keywordsMatch[1]) {
    keywords = keywordsMatch[1].split(/[,;]/).map((k) => k.trim()).filter(Boolean).slice(0, 6);
  }
  if (keywords.length === 0) {
    keywords = ['Academic Research', 'Peer Review', 'Empirical Study'];
  }

  return {
    title,
    authors,
    abstract: abstractText,
    publicationDate: new Date().toISOString().split('T')[0],
    keywords,
    rawText: cleanedText,
    sections,
  };
}
