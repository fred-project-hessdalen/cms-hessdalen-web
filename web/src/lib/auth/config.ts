import { NextAuthConfig } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { Resend } from "resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Important: allows NextAuth to work across different domains
  providers: [
    EmailProvider({
      server: {}, // Dummy server config (we use custom sendVerificationRequest with Resend)
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      // Customize the email that gets sent
      async sendVerificationRequest({ identifier: email, url }) {
        const { host } = new URL(url)

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject: `Sign in to ${host}`,
            html: html({ url, host, email }),
            text: text({ url, host }),
          })
        } catch (error) {
          console.error("Failed to send email:", error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Email HTML body
function html({ url, host, email }: { url: string; host: string; email: string }) {
  const escapedHost = host.replace(/\./g, "&#8203;.")
  const escapedEmail = email.replace(/\./g, "&#8203;.")

  const brandColor = "#2563eb"
  const buttonText = "#fff"
  const buttonBackground = brandColor

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${escapedHost}</title>
</head>
<body style="background: #f9fafb; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, ${brandColor} 0%, #1e40af 100%);">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0;">Sign in to ${escapedHost}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                Hello,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
                You requested to sign in to <strong>${escapedHost}</strong> with the email <strong>${escapedEmail}</strong>.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px;">
                Click the button below to sign in:
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; background: ${buttonBackground}; color: ${buttonText}; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Sign in
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 32px 0 0;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                This link will expire in 24 hours and can only be used once.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Email Text body (fallback for email clients that don't render HTML)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n\n${url}\n\n`
}
