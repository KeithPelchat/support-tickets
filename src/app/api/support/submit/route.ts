import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateToken } from '@/lib/auth';
import { sendNewRequestNotification } from '@/lib/ses';
import { uploadToS3, isUploadError, UploadResult } from '@/lib/s3';

const MAX_FILES = 5;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let token: string;
    let requestType: string;
    let description: string;
    let files: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      token = formData.get('token') as string;
      requestType = formData.get('requestType') as string;
      description = formData.get('description') as string;

      const fileEntries = formData.getAll('files');
      files = fileEntries.filter((entry): entry is File => entry instanceof File);

      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_FILES} files allowed per submission` },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      token = body.token;
      requestType = body.requestType;
      description = body.description;
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 401 });
    }

    const clientInfo = await validateToken(token);
    if (!clientInfo) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!requestType || !description) {
      return NextResponse.json(
        { error: 'Request type and description are required' },
        { status: 400 }
      );
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        clientId: clientInfo.clientId,
        requestType,
        description,
        status: 'new',
      },
    });

    const uploadedImages: UploadResult[] = [];
    const uploadErrors: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToS3(buffer, file.name, file.type, supportRequest.id);

      if (isUploadError(result)) {
        uploadErrors.push(`${file.name}: ${result.error}`);
      } else {
        uploadedImages.push(result);
      }
    }

    if (uploadedImages.length > 0) {
      await prisma.supportRequestImage.createMany({
        data: uploadedImages.map((img) => ({
          requestId: supportRequest.id,
          imageUrl: img.url,
          filename: img.filename,
          size: img.size,
        })),
      });
    }

    const requestWithImages = await prisma.supportRequest.findUnique({
      where: { id: supportRequest.id },
      include: { images: true },
    });

    sendNewRequestNotification(
      clientInfo.clientName,
      requestType,
      description,
      uploadedImages.length
    ).catch((err) => console.error('Failed to send notification:', err));

    const response: {
      success: boolean;
      request: typeof requestWithImages;
      uploadErrors?: string[];
    } = {
      success: true,
      request: requestWithImages,
    };

    if (uploadErrors.length > 0) {
      response.uploadErrors = uploadErrors;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating support request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
