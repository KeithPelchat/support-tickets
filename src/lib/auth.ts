import { prisma } from './db';

export interface ClientInfo {
  clientId: string;
  clientName: string;
}

export async function validateToken(token: string): Promise<ClientInfo | null> {
  if (!token) {
    return null;
  }

  try {
    const clientToken = await prisma.clientToken.findUnique({
      where: { token },
    });

    if (!clientToken) {
      return null;
    }

    return {
      clientId: clientToken.clientId,
      clientName: clientToken.clientName,
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

export function validateAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.warn('ADMIN_PASSWORD not configured');
    return false;
  }
  return password === adminPassword;
}
