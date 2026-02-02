import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<boolean> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('SES not configured, skipping email send');
    console.log('Would have sent:', { to, subject, body });
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || process.env.NOTIFICATION_EMAIL || to;

  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: fromEmail,
    });

    await sesClient.send(command);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendNewRequestNotification(
  clientName: string,
  requestType: string,
  description: string,
  imageCount: number = 0
): Promise<boolean> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) {
    console.log('NOTIFICATION_EMAIL not configured');
    return false;
  }

  const imageInfo = imageCount > 0
    ? `\nAttachments: ${imageCount} image${imageCount > 1 ? 's' : ''} attached - view in admin dashboard\n`
    : '';

  return sendEmail({
    to: notificationEmail,
    subject: `New Support Request from ${clientName}`,
    body: `
A new support request has been submitted.

Client: ${clientName}
Type: ${requestType}
${imageInfo}
Description:
${description}

---
View all requests in the admin dashboard.
    `.trim(),
  });
}

export async function sendClientNoteNotification(
  clientEmail: string,
  clientName: string,
  requestType: string,
  note: string,
  portalUrl: string
): Promise<boolean> {
  if (!clientEmail) {
    console.log('No client email provided, skipping notification');
    return false;
  }

  return sendEmail({
    to: clientEmail,
    subject: `Update on Your Support Request - ${requestType}`,
    body: `
Hello ${clientName},

We have an update on your support request:

---
${note}
---

You can view your full request history at:
${portalUrl}

Thank you,
Support Team
    `.trim(),
  });
}

export async function sendClientStatusNotification(
  clientEmail: string,
  clientName: string,
  requestType: string,
  oldStatus: string,
  newStatus: string,
  portalUrl: string
): Promise<boolean> {
  if (!clientEmail) {
    console.log('No client email provided, skipping notification');
    return false;
  }

  const statusLabels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return sendEmail({
    to: clientEmail,
    subject: `Your Support Request Status Changed to ${statusLabels[newStatus] || newStatus}`,
    body: `
Hello ${clientName},

The status of your support request (${requestType}) has been updated.

Previous Status: ${statusLabels[oldStatus] || oldStatus}
New Status: ${statusLabels[newStatus] || newStatus}

You can view your request details at:
${portalUrl}

Thank you,
Support Team
    `.trim(),
  });
}
