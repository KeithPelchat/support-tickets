import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateAdminPassword } from '@/lib/auth';

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

    const updateData: Record<string, string> = {};
    if (status !== undefined) updateData.status = status;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updatedRequest = await prisma.supportRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
