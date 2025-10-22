// Temporary test endpoint - DELETE AFTER TESTING
export async function GET() {
    return Response.json({
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5),
        emailFrom: process.env.EMAIL_FROM,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
    })
}
