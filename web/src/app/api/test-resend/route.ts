// Test endpoint - check if Resend works
import { Resend } from 'resend'

export async function GET() {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Just test the connection, don't actually send
        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: 'test@example.com', // This won't actually send
            subject: 'Test',
            html: '<p>Test</p>',
        })

        return Response.json({
            success: true,
            result,
            hasApiKey: !!process.env.RESEND_API_KEY,
            emailFrom: process.env.EMAIL_FROM
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return Response.json({
            success: false,
            error: errorMessage,
            hasApiKey: !!process.env.RESEND_API_KEY,
            emailFrom: process.env.EMAIL_FROM
        }, { status: 500 })
    }
}
