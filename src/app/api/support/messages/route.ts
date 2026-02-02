import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateToken } from '@/lib/auth';
import { sendEmail } from '@/lib/ses';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, requestId, content } = body;

    if (!token || !requestId || !content) {
      return NextResponse.json(
        { error: 'Token, request ID, and content are required' },
        { status: 400 }
      );
    }

    const clientToken = await validateToken(token);
    if (!clientToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify the request belongs to this client
    const supportRequest = await prisma.supportRequest.findUnique({
      where: { id: requestId },
    });

    if (!supportRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (supportRequest.clientId !== clientToken.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        requestId,
        content: content.trim(),
        senderType: 'client',
      },
    });

    // Update the request's updatedAt timestamp
    await prisma.supportRequest.update({
      where: { id: requestId },
      data: { updatedAt: new Date() },
    });

    // Send email notification to admin
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    if (notificationEmail) {
      await sendEmail({
        to: notificationEmail,
        subject: `Client Reply: ${supportRequest.requestType} - ${clientToken.clientName}`,
        body: `
${clientToken.clientName} has replied to their support request.

Request Type: ${supportRequest.requestType}
Status: ${supportRequest.status}

Client's Message:
---
${content.trim()}
---

View in admin dashboard to respond.
        `.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
