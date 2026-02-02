import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateToken } from '@/lib/auth';
import { sendNewRequestNotification } from '@/lib/ses';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, requestType, description } = body;

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

    sendNewRequestNotification(clientInfo.clientName, requestType, description).catch((err) =>
      console.error('Failed to send notification:', err)
    );

    return NextResponse.json({
      success: true,
      request: supportRequest,
    });
  } catch (error) {
    console.error('Error creating support request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
