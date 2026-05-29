import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractKeywords, parseDocx, parsePdf, compareResumeToJD } from '@/lib/nlp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jdText = formData.get('jobDescription') as string;
    
    if (!jdText) {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
    }

    const jdKeywords = extractKeywords(jdText, 30); // Top 30 keywords/skills

    // Save JD
    const jdRecord = await prisma.jobDescription.create({
      data: {
        text: jdText,
        extractedSkills: JSON.stringify(jdKeywords),
      }
    });

    const resumes = formData.getAll('resumes') as File[];
    
    if (resumes.length === 0) {
      return NextResponse.json({ error: 'At least one resume is required.' }, { status: 400 });
    }

    const processedResumes = [];

    for (const file of resumes) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = file.name;
      const fileFormat = fileName.split('.').pop()?.toLowerCase() || '';

      let rawText = '';
      
      if (fileFormat === 'pdf') {
        rawText = await parsePdf(buffer);
      } else if (fileFormat === 'docx') {
        rawText = await parseDocx(buffer);
      } else if (fileFormat === 'doc') {
         // mammoth mostly handles docx, doc is trickier in node without extra heavy libs. 
         // We'll fallback to a basic text conversion or just skip/warn.
         // For this prototype, we'll try mammoth but it might fail for legacy .doc
         try {
           rawText = await parseDocx(buffer);
         } catch {
           rawText = "Unsupported or corrupted legacy .doc format. Please use PDF or DOCX.";
         }
      } else if (fileFormat === 'txt') {
        rawText = buffer.toString('utf-8');
      } else {
        continue; // Skip unsupported
      }

      // Basic candidate name extraction (just using filename for simplicity in this task)
      const candidateName = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ');

      const { score, matchedSkills, missingSkills } = compareResumeToJD(rawText, jdKeywords);

      const resumeRecord = await prisma.resume.create({
        data: {
          candidateName,
          fileName,
          fileFormat,
          rawText,
          matchScore: score,
          matchedSkills: JSON.stringify(matchedSkills),
          missingSkills: JSON.stringify(missingSkills),
          jobDescriptionId: jdRecord.id
        }
      });

      processedResumes.push(resumeRecord);
    }

    return NextResponse.json({ success: true, jdId: jdRecord.id });

  } catch (error) {
    console.error("API Analyze Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
