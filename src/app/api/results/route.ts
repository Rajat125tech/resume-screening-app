import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jdId = searchParams.get('jdId');

  if (!jdId) {
    return NextResponse.json({ error: 'Missing jdId parameter' }, { status: 400 });
  }

  try {
    const jd = await prisma.jobDescription.findUnique({
      where: { id: jdId },
      include: {
        resumes: {
          orderBy: {
            matchScore: 'desc'
          }
        }
      }
    });

    if (!jd) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: jd });

  } catch (error) {
    console.error("API Results Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
