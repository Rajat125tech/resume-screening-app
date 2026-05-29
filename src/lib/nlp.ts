import natural from 'natural';
import mammoth from 'mammoth';
const pdfParse = require('pdf-parse');

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Common stopwords to ignore
const stopWords = new Set([
  'and', 'the', 'to', 'a', 'of', 'in', 'for', 'is', 'with', 'on', 'that', 'by', 'this',
  'it', 'you', 'or', 'as', 'are', 'be', 'an', 'at', 'from', 'we', 'will', 'have',
  'your', 'all', 'our', 'can', 'not', 'if', 'has', 'but', 'more', 'about', 'other',
  'which', 'their', 'they', 'one', 'has', 'been', 'would', 'there', 'who', 'what'
]);

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return "";
  }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX Parsing Error:", error);
    return "";
  }
}

export function extractKeywords(text: string, numKeywords = 30): string[] {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  
  const keywords: { term: string, tfidf: number }[] = [];
  
  // tfidf.listTerms(0 /* doc index */) returns items
  tfidf.listTerms(0).forEach(item => {
    const term = item.term.toLowerCase();
    // Filter out numbers, short words, and stopwords
    if (term.length > 2 && !stopWords.has(term) && !/^\d+$/.test(term)) {
      keywords.push({ term, tfidf: item.tfidf });
    }
  });

  // Sort by tfidf descending and take top N
  keywords.sort((a, b) => b.tfidf - a.tfidf);
  return keywords.slice(0, numKeywords).map(k => k.term);
}

export function compareResumeToJD(resumeText: string, jdKeywords: string[]) {
  const resumeTokens = tokenizer.tokenize(resumeText.toLowerCase()) || [];
  const resumeTokenSet = new Set(resumeTokens);
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  let scoreCount = 0;
  
  for (const skill of jdKeywords) {
    if (resumeTokenSet.has(skill)) {
      matchedSkills.push(skill);
      scoreCount++;
    } else {
      missingSkills.push(skill);
    }
  }
  
  const score = jdKeywords.length > 0 ? (scoreCount / jdKeywords.length) * 100 : 0;
  
  return {
    score: Math.round(score),
    matchedSkills,
    missingSkills
  };
}
