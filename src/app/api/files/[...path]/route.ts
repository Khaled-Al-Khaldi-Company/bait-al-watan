import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Reconstruct path from segments
    const filePathSegments = params.path;
    // Map to our stable storage outside public
    // Map to our storage
    let fullPath;
    if (filePathSegments[0] === 'tmp') {
       // Handle Vercel /tmp directory
       fullPath = path.join('/tmp', ...filePathSegments.slice(1));
    } else {
       fullPath = path.join(process.cwd(), 'storage', ...filePathSegments);
    }

    if (!fs.existsSync(fullPath)) {
      return new NextResponse('File not found: ' + fullPath, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
