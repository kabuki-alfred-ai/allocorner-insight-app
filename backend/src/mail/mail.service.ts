import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.fromEmail = this.config.get<string>('RESEND_FROM_EMAIL') || 'invitations@allocorner.com';
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Emails will be logged but not sent.');
    }
  }

  async sendInvitationEmail(params: {
    to: string;
    projectName: string;
    inviterName: string;
    invitationLink: string;
    expiresAt: Date;
  }): Promise<void> {
    const { to, projectName, inviterName, invitationLink, expiresAt } = params;

    const html = this.getInvitationTemplate({
      projectName,
      inviterName,
      invitationLink,
      expiresAt,
    });

    const subject = `Vous avez été invité à rejoindre le projet "${projectName}"`;

    if (!this.resend) {
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Link: ${invitationLink}`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: `Allo Corner <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error('Failed to send email:', result.error);
        throw new Error(`Email sending failed: ${result.error.message}`);
      }

      this.logger.log(`Invitation email sent to ${to}, id: ${result.data?.id}`);
    } catch (error) {
      this.logger.error('Error sending invitation email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(params: {
    to: string;
    resetLink: string;
    expiresAt: Date;
  }): Promise<void> {
    const { to, resetLink, expiresAt } = params;

    const html = this.getPasswordResetTemplate({ resetLink, expiresAt });

    const subject = 'Réinitialisation de votre mot de passe';

    if (!this.resend) {
      this.logger.log(`[EMAIL MOCK] To: ${to}`);
      this.logger.log(`[EMAIL MOCK] Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Reset Link: ${resetLink}`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: `Allo Corner <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error('Failed to send password reset email:', result.error);
        throw new Error(`Email sending failed: ${result.error.message}`);
      }

      this.logger.log(`Password reset email sent to ${to}, id: ${result.data?.id}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  private getPasswordResetTemplate(params: {
    resetLink: string;
    expiresAt: Date;
  }): string {
    const { resetLink, expiresAt } = params;
    const expiresDate = expiresAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const logoUrl = 'https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png';
    const primaryColor = '#FF884D';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1A1A1A;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #FAFAFA;
    }
    .wrapper { padding: 40px 20px; }
    .container {
      background-color: white;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.04);
      border: 1px solid #F0F0F0;
    }
    .logo { text-align: center; margin-bottom: 40px; }
    .logo img { height: 40px; width: auto; }
    .header { text-align: center; margin-bottom: 32px; }
    h1 {
      color: #1A1A1A;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .content { font-size: 16px; color: #4A4A4A; margin-bottom: 32px; }
    .button-container { text-align: center; margin: 40px 0; }
    .button {
      display: inline-block;
      background-color: ${primaryColor};
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 8px 24px rgba(255, 136, 77, 0.25);
    }
    .link-info { font-size: 12px; color: #999; text-align: center; margin-top: 16px; }
    .link { word-break: break-all; color: ${primaryColor}; opacity: 0.8; text-decoration: none; }
    .expires-box {
      margin-top: 40px;
      padding: 24px;
      background-color: #FFF9F5;
      border: 1px solid #FFE6D5;
      border-radius: 16px;
      text-align: center;
    }
    .expires-text { color: #D96D36; font-size: 13px; font-weight: 600; margin: 0; }
    .footer { text-align: center; margin-top: 40px; color: #B0B0B0; font-size: 12px; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <img src="${logoUrl}" alt="Allo Corner">
      </div>
      <div class="header">
        <h1>Réinitialisation de mot de passe</h1>
      </div>
      <div class="content">
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme Allo Corner Insight.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
      </div>
      <div class="button-container">
        <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
        <div class="link-info">
          Ou copiez ce lien : <br>
          <a href="${resetLink}" class="link">${resetLink}</a>
        </div>
      </div>
      <div class="expires-box">
        <p class="expires-text">
          ⚠️ Ce lien est valable jusqu'au ${expiresDate}
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Allo Corner. Tous droits réservés.</p>
        <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private getInvitationTemplate(params: {
    projectName: string;
    inviterName: string;
    invitationLink: string;
    expiresAt: Date;
  }): string {
    const { projectName, inviterName, invitationLink, expiresAt } = params;
    const expiresDate = expiresAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const logoUrl = 'https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png';
    const primaryColor = '#FF884D'; // Orange Allo Corner

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à rejoindre un projet</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1A1A1A;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #FAFAFA;
    }
    .wrapper {
      padding: 40px 20px;
    }
    .container {
      background-color: white;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.04);
      border: 1px solid #F0F0F0;
    }
    .logo {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo img {
      height: 40px;
      width: auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    h1 {
      color: #1A1A1A;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .content {
      font-size: 16px;
      color: #4A4A4A;
      margin-bottom: 32px;
    }
    .project-name {
      color: ${primaryColor};
      font-weight: 700;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .button {
      display: inline-block;
      background-color: ${primaryColor};
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 8px 24px rgba(255, 136, 77, 0.25);
    }
    .link-info {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-top: 16px;
    }
    .link {
      word-break: break-all;
      color: ${primaryColor};
      opacity: 0.8;
      text-decoration: none;
    }
    .expires-box {
      margin-top: 40px;
      padding: 24px;
      background-color: #FFF9F5;
      border: 1px solid #FFE6D5;
      border-radius: 16px;
      text-align: center;
    }
    .expires-text {
      color: #D96D36;
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #B0B0B0;
      font-size: 12px;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <img src="${logoUrl}" alt="Allo Corner">
      </div>
      
      <div class="header">
        <h1>Nouvelle Invitation</h1>
      </div>
      
      <div class="content">
        <p>Bonjour,</p>
        <p><strong>${inviterName}</strong> vous invite à rejoindre le projet <span class="project-name">"${projectName}"</span> sur la plateforme Allo Corner Insight.</p>
        <p>Cette plateforme vous permet de piloter vos projets d'analyse audio et de consulter vos verbatims avec une expérience premium.</p>
      </div>
      
      <div class="button-container">
        <a href="${invitationLink}" class="button">Accepter l'invitation</a>
        <div class="link-info">
          Ou copiez ce lien : <br>
          <a href="${invitationLink}" class="link">${invitationLink}</a>
        </div>
      </div>
      
      <div class="expires-box">
        <p class="expires-text">
          ⚠️ Cette invitation est valable jusqu'au ${expiresDate}
        </p>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Allo Corner. Tous droits réservés.</p>
        <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}
