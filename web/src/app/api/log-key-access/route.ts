import { NextResponse } from "next/server";
import { Resend } from "resend";
import { publicClient } from "@/sanity/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { key, pagePath, pageTitle } = await request.json();

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        // Fetch access key details
        const accessKey = await publicClient.fetch(
            `*[_type == "accessKey" && key == $key && isActive == true][0]{
                key,
                name,
                email,
                expiresAt,
                isActive
            }`,
            { key }
        );

        if (!accessKey) {
            return NextResponse.json({ error: "Invalid key" }, { status: 404 });
        }

        // Fetch site settings for contact email
        const siteSettings = await publicClient.fetch(
            `*[_type == "siteSettings"][0]{
                contact
            }`
        );

        const contactEmail = siteSettings?.contact?.email;

        if (!contactEmail) {
            console.error("No contact email configured in site settings");
            return NextResponse.json({ error: "Contact email not configured" }, { status: 500 });
        }

        // Send email to both the key holder and site admin
        const recipients = [accessKey.email, contactEmail];
        const uniqueRecipients = [...new Set(recipients)]; // Remove duplicates if they're the same

        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'UTC',
            dateStyle: 'full',
            timeStyle: 'long'
        });

        await resend.emails.send({
            from: "Hessdalen <no-reply@hessdalen.org>",
            to: uniqueRecipients,
            subject: `Access Key Used: ${accessKey.name}`,
            html: `
                <h2>Access Key Usage Notification</h2>
                <p>An access key was used to view restricted content.</p>
                
                <h3>Access Details:</h3>
                <ul>
                    <li><strong>Key Holder:</strong> ${accessKey.name} (${accessKey.email})</li>
                    <li><strong>Access Key:</strong> ${accessKey.key}</li>
                    <li><strong>Page:</strong> ${pageTitle || pagePath}</li>
                    <li><strong>Page URL:</strong> /${pagePath}</li>
                    <li><strong>Time:</strong> ${timestamp}</li>
                    <li><strong>Expires:</strong> ${new Date(accessKey.expiresAt).toLocaleString()}</li>
                </ul>
                
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    This is an automated notification from Hessdalen website access tracking system.
                </p>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging key access:", error);
        return NextResponse.json(
            { error: "Failed to log access" },
            { status: 500 }
        );
    }
}
