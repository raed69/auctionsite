/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.get<string>('MAIL_FROM') ?? 'onboarding@resend.dev';
    this.appUrl = config.get<string>('APP_URL') ?? 'http://localhost:3001';
  }

  // ─── Verification email ───────────────────────────────────────────────────

  async sendVerificationEmail(to: string, token: string, firstName: string) {
    const link = `${this.appUrl}/auth/verify-email?token=${token}`;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Verify your Curator account',
      html: this.verificationTemplate(firstName, link),
    });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to send verification email: ${error.message}`,
      );
    }
  }

  // ─── Password reset email (ready for later) ───────────────────────────────

  async sendPasswordResetEmail(to: string, token: string, firstName: string) {
    const link = `${this.appUrl}/auth/reset-password?token=${token}`;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Reset your Curator password',
      html: this.passwordResetTemplate(firstName, link),
    });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to send password reset email: ${error.message}`,
      );
    }
  }

  // ─── HTML templates ───────────────────────────────────────────────────────

  private verificationTemplate(firstName: string, link: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#3525cd,#4f46e5);padding:40px 48px;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                        The Curator
                      </h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                        Exclusive auction marketplace
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:48px;">
                      <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:700;">
                        Welcome, ${firstName}!
                      </h2>
                      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
                        Thanks for joining The Curator. Please verify your email address
                        to activate your account and start bidding on exclusive lots.
                      </p>

                      <!-- CTA button -->
                      <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                        <tr>
                          <td style="background:linear-gradient(135deg,#3525cd,#4f46e5);border-radius:50px;padding:16px 36px;">
                            <a href="${link}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:block;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;color:#71717a;font-size:13px;line-height:1.6;">
                        Or paste this link into your browser:
                      </p>
                      <p style="margin:0 0 32px;font-size:12px;word-break:break-all;">
                        <a href="${link}" style="color:#3525cd;">${link}</a>
                      </p>

                      <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.6;">
                        This link expires in <strong>24 hours</strong>.
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f4f4f5;padding:24px 48px;border-top:1px solid #e4e4e7;">
                      <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} The Curator · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private passwordResetTemplate(firstName: string, link: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#3525cd,#4f46e5);padding:40px 48px;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                        The Curator
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:48px;">
                      <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:700;">
                        Reset your password, ${firstName}
                      </h2>
                      <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
                        We received a request to reset your password.
                        Click the button below to choose a new one.
                      </p>

                      <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                        <tr>
                          <td style="background:linear-gradient(135deg,#3525cd,#4f46e5);border-radius:50px;padding:16px 36px;">
                            <a href="${link}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:block;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.6;">
                        This link expires in <strong>1 hour</strong>.
                        If you didn't request a password reset, ignore this email — your password won't change.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f4f4f5;padding:24px 48px;border-top:1px solid #e4e4e7;">
                      <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
                        © ${new Date().getFullYear()} The Curator · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
