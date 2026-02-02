import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateAdminPassword } from '@/lib/auth';
import { sendClientNoteNotification, sendClientStatusNotification } from '@/lib/ses';

interface UpdateData {
  status?: string;
  internalNotes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminPassword, status, internalNotes } = body;

    if (!adminPassword || !validateAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    const existingRequest = await prisma.supportRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Get client info for email notifications
    const clientToken = await prisma.clientToken.findFirst({
      where: { clientId: existingRequest.clientId },
    });

    const updateData: UpdateData = {};
    let statusChanged = false;
    let notesUpdated = false;
    let newStatusValue = existingRequest.status;
    const noteContent = internalNotes?.trim() || '';

    if (status !== undefined && status !== existingRequest.status) {
      updateData.status = status;
      statusChanged = true;
      newStatusValue = status;
    }

    if (noteContent) {
      // Store in internalNotes for legacy compatibility, but also create a message
      updateData.internalNotes = internalNotes;
      notesUpdated = true;

      // Auto-change status to in_progress when adding notes to a new request
      if (existingRequest.status === 'new') {
        updateData.status = 'in_progress';
        if (!statusChanged) {
          statusChanged = true;
          newStatusValue = 'in_progress';
        }
      }

      // Create a message record for the conversation thread
      await prisma.message.create({
        data: {
          requestId: id,
          content: noteContent,
          senderType: 'admin',
        },
      });
    }

    const updatedRequest = await prisma.supportRequest.update({
      where: { id },
      data: updateData,
    });

    // Build portal URL for client emails
    const baseUrl = process.env.BASE_URL || 'https://hypergen.ai';
    const portalUrl = clientToken
      ? `${baseUrl}/support?token=${clientToken.token}`
      : `${baseUrl}/support`;

    // Send email notifications to client
    if (clientToken?.clientEmail) {
      // Send note notification if notes were updated
      if (notesUpdated && internalNotes) {
        await sendClientNoteNotification(
          clientToken.clientEmail,
          clientToken.clientName,
          existingRequest.requestType,
          internalNotes,
          portalUrl
        );
      }

      // Send status change notification (only if status changed without notes,
      // since note notification already implies the update)
      if (statusChanged && !notesUpdated) {
        await sendClientStatusNotification(
          clientToken.clientEmail,
          clientToken.clientName,
          existingRequest.requestType,
          existingRequest.status,
          newStatusValue,
          portalUrl
        );
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
