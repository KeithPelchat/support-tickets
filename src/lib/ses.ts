import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<boolean> {
  if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) {
    console.log('SES not configured, skipping email send');
    console.log('Would have sent:', { to, subject, body });
    return false;
  }

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
      Source: to,
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
