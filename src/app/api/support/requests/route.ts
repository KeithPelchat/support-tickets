import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateToken, validateAdminPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const adminPassword = searchParams.get('adminPassword');

    if (adminPassword) {
      if (!validateAdminPassword(adminPassword)) {
        return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
      }

      const clientFilter = searchParams.get('clientId');
      const typeFilter = searchParams.get('requestType');
      const statusFilter = searchParams.get('status');

      const where: Record<string, string> = {};
      if (clientFilter) where.clientId = clientFilter;
      if (typeFilter) where.requestType = typeFilter;
      if (statusFilter) where.status = statusFilter;

      const requests = await prisma.supportRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const clients = await prisma.clientToken.findMany({
        select: { clientId: true, clientName: true },
      });

      const counts = {
        new: await prisma.supportRequest.count({ where: { status: 'new' } }),
        in_progress: await prisma.supportRequest.count({ where: { status: 'in_progress' } }),
      };

      return NextResponse.json({
        requests,
        clients,
        counts,
      });
    }

    if (token) {
      const clientInfo = await validateToken(token);
      if (!clientInfo) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const requests = await prisma.supportRequest.findMany({
        where: { clientId: clientInfo.clientId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestType: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        requests,
        clientName: clientInfo.clientName,
      });
    }

    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
