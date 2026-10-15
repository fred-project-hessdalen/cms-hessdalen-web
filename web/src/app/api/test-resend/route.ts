import { Resend } from "resend"
import { auth } from "@/lib/auth"
import { isCoreTeamMember } from "@/lib/auth/core-team"

export async function POST(request: Request) {
    if (request.headers.get("origin") !== new URL(request.url).origin) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 })
    }

    try {
        const session = await auth()
        if (!session?.user?.id || !session.user.email) {
            return Response.json({ error: "Not authenticated." }, { status: 401 })
        }

        if (!await isCoreTeamMember(session.user.email)) {
            return Response.json({ error: "Core Team membership required." }, { status: 403 })
        }

        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
            return Response.json({ error: "Email service is not configured." }, { status: 503 })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: session.user.email,
            subject: "Hessdalen test email",
            text: "Your Hessdalen dashboard test email was sent through Resend.",
        }, {
            idempotencyKey: `dashboard-test/${session.user.id}/${Math.floor(Date.now() / 60000)}`,
        })

        if (error || !data?.id) {
            console.error("Resend test email rejected:", error)
            return Response.json({ error: "Resend could not send the test email." }, { status: 502 })
        }

        return Response.json({ success: true, id: data.id })
    } catch (error) {
        console.error("Resend test email failed:", error)
        return Response.json({ error: "Unable to send the test email. Please try again later." }, { status: 500 })
    }
}
