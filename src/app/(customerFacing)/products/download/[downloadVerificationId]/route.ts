import db from '@/db/db';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

// Route handlers to create custom request handlers
export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  // Select the download verification based on given id from the url params and return non-expiry data
  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  });

  // Redirect to download link expired page if invalid download verification found
  if (data == null) {
    return NextResponse.redirect(
      new URL('/products/download/expired', req.url)
    );
  }

  // Build download link
  const { size } = await fs.stat(data.product.filePath);
  const file = await fs.readFile(data.product.filePath);
  const extension = data.product.filePath.split('.').pop();

  return new NextResponse(file, {
    headers: {
      'Content-Disposition': `attachment; filename="${data.product.name}.${extension}"`,
      'Content-Length': size.toString(),
    },
  });
}
