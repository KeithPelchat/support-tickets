import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateAdminPassword } from '@/lib/auth';
import crypto from 'crypto';

function generateToken(clientId: string): string {
  const randomPart = crypto.randomBytes(8).toString('hex');
  return `${clientId}_${randomPart}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get('adminPassword');

    if (!adminPassword || !validateAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    const tokens = await prisma.clientToken.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Get request counts for each client
    const tokenStats = await Promise.all(
      tokens.map(async (token) => {
        const requestCount = await prisma.supportRequest.count({
          where: { clientId: token.clientId },
        });
        return {
          ...token,
          requestCount,
        };
      })
    );

    return NextResponse.json({ tokens: tokenStats });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword, clientId, clientName } = body;

    if (!adminPassword || !validateAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    if (!clientId || !clientName) {
      return NextResponse.json(
        { error: 'Client ID and name are required' },
        { status: 400 }
      );
    }

    // Validate clientId format (alphanumeric, lowercase, no spaces)
    if (!/^[a-z0-9_-]+$/.test(clientId)) {
      return NextResponse.json(
        { error: 'Client ID must be lowercase alphanumeric (with optional underscores/hyphens)' },
        { status: 400 }
      );
    }

    // Check if clientId already exists
    const existing = await prisma.clientToken.findFirst({
      where: { clientId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A token for this client ID already exists' },
        { status: 400 }
      );
    }

    const token = generateToken(clientId);

    const newToken = await prisma.clientToken.create({
      data: {
        token,
        clientId,
        clientName,
      },
    });

    return NextResponse.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get('adminPassword');
    const token = searchParams.get('token');

    if (!adminPassword || !validateAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Check if token exists
    const existing = await prisma.clientToken.findUnique({
      where: { token },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Check if there are any requests associated with this client
    const requestCount = await prisma.supportRequest.count({
      where: { clientId: existing.clientId },
    });

    if (requestCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${requestCount} support request(s) are associated with this client` },
        { status: 400 }
      );
    }

    await prisma.clientToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
