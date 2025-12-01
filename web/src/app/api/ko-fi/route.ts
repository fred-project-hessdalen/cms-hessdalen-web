import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/live";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface KofiPayload {
    verification_token: string;
    message_id: string;
    timestamp: string;
    type: "Donation" | "Subscription" | "Commission" | "Shop Order";
    is_public: boolean;
    from_name: string;
    message: string | null;
    amount: string;
    url: string;
    email: string;
    currency: string;
    is_subscription_payment: boolean;
    is_first_subscription_payment: boolean;
    kofi_transaction_id: string;
    shop_items: Array<{
        direct_link_code: string;
        variation_name?: string;
        quantity?: number;
    }> | null;
    tier_name: string | null;
    shipping: {
        full_name: string;
        street_address: string;
        city: string;
        state_or_province: string;
        postal_code: string;
        country: string;
        country_code: string;
        telephone: string;
    } | null;
    discord_username?: string | null;
    discord_userid?: string | null;
}

export async function POST(request: NextRequest) {
    try {
        // Parse form data (Ko-fi sends application/x-www-form-urlencoded)
        const formData = await request.formData();
        const dataString = formData.get("data") as string;

        if (!dataString) {
            return NextResponse.json(
                { error: "No data field in request" },
                { status: 400 }
            );
        }

        // Parse the JSON data
        const kofiData: KofiPayload = JSON.parse(dataString);

        // Fetch site settings to get verification token and contact email
        const siteSettings = await client.fetch(
            `*[_type == "siteSettings"][0]{
                kofiVerificationToken,
                contact {
                    email
                }
            }`
        );

        if (!siteSettings?.kofiVerificationToken) {
            console.error("Ko-fi verification token not configured in site settings");
            return NextResponse.json(
                { error: "Webhook not configured" },
                { status: 500 }
            );
        }

        // Verify the webhook is legitimate
        if (kofiData.verification_token !== siteSettings.kofiVerificationToken) {
            console.error("Invalid Ko-fi verification token");
            return NextResponse.json(
                { error: "Invalid verification token" },
                { status: 401 }
            );
        }

        // Get contact email from site settings
        const contactEmail = siteSettings.contact?.email || process.env.EMAIL_FROM;

        if (!contactEmail) {
            console.error("No contact email configured");
            return NextResponse.json(
                { error: "No contact email configured" },
                { status: 500 }
            );
        }

        // Build email content based on payment type
        const emailSubject = `Ko-fi ${kofiData.type}: ${kofiData.amount} ${kofiData.currency} from ${kofiData.from_name}`;

        let emailBody = `
            <h2>New Ko-fi ${kofiData.type}</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">From:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.from_name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Amount:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.amount} ${kofiData.currency}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.type}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction ID:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.kofi_transaction_id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timestamp:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.timestamp}</td>
                </tr>
        `;

        // Add message if present
        if (kofiData.message) {
            emailBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.message}</td>
                </tr>
            `;
        }

        // Add subscription details if applicable
        if (kofiData.is_subscription_payment) {
            emailBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subscription:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.is_first_subscription_payment ? "First Payment" : "Recurring Payment"}</td>
                </tr>
            `;
            if (kofiData.tier_name) {
                emailBody += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tier:</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.tier_name}</td>
                    </tr>
                `;
            }
        }

        // Add shop items if present
        if (kofiData.shop_items && kofiData.shop_items.length > 0) {
            emailBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shop Items:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <ul style="margin: 0; padding-left: 20px;">
            `;
            kofiData.shop_items.forEach(item => {
                emailBody += `<li>${item.variation_name || "Item"} (x${item.quantity || 1}) - Code: ${item.direct_link_code}</li>`;
            });
            emailBody += `
                        </ul>
                    </td>
                </tr>
            `;
        }

        // Add shipping if present
        if (kofiData.shipping) {
            emailBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Shipping To:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        ${kofiData.shipping.full_name}<br>
                        ${kofiData.shipping.street_address}<br>
                        ${kofiData.shipping.city}, ${kofiData.shipping.state_or_province} ${kofiData.shipping.postal_code}<br>
                        ${kofiData.shipping.country}<br>
                        Tel: ${kofiData.shipping.telephone}
                    </td>
                </tr>
            `;
        }

        // Add Discord info if present
        if (kofiData.discord_username) {
            emailBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Discord:</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${kofiData.discord_username}</td>
                </tr>
            `;
        }

        emailBody += `
            </table>
            <p style="margin-top: 20px;">
                <strong>Suggested Thank You Email:</strong>
            </p>
        `;

        // Generate suggested thank you email based on payment type
        let suggestedEmail = `
            <div style="border: 2px solid #4CAF50; padding: 20px; margin-top: 10px; background-color: #f9f9f9; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;">Dear ${kofiData.from_name},</p>
        `;

        if (kofiData.type === "Shop Order" && kofiData.shop_items) {
            // Shop order email
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">Thank you so much for your order! We're thrilled to have you as a customer.</p>
                <p style="margin: 0 0 10px 0;">Your order has been received and will be processed shortly. Here's what you ordered:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
            `;
            kofiData.shop_items.forEach(item => {
                suggestedEmail += `<li>${item.variation_name || "Item"} (Quantity: ${item.quantity || 1})</li>`;
            });
            suggestedEmail += `
                </ul>
                <p style="margin: 0 0 10px 0;"><strong>Order Total:</strong> ${kofiData.amount} ${kofiData.currency}</p>
                <p style="margin: 0 0 10px 0;"><strong>Transaction ID:</strong> ${kofiData.kofi_transaction_id}</p>
            `;
            if (kofiData.shipping) {
                suggestedEmail += `
                    <p style="margin: 0 0 10px 0;">We'll ship your order to:</p>
                    <p style="margin: 0 0 10px 0; padding-left: 20px;">
                        ${kofiData.shipping.full_name}<br>
                        ${kofiData.shipping.street_address}<br>
                        ${kofiData.shipping.city}, ${kofiData.shipping.state_or_province} ${kofiData.shipping.postal_code}<br>
                        ${kofiData.shipping.country}
                    </p>
                `;
            }
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">You'll receive a shipping confirmation with tracking information once your order is dispatched.</p>
            `;
        } else if (kofiData.is_subscription_payment && kofiData.is_first_subscription_payment) {
            // First subscription payment
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">Welcome to our community! 🎉</p>
                <p style="margin: 0 0 10px 0;">Thank you for becoming a supporter through Ko-fi. Your ${kofiData.tier_name ? `<strong>${kofiData.tier_name}</strong> ` : ''}subscription means the world to us!</p>
                <p style="margin: 0 0 10px 0;"><strong>Subscription Details:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Amount: ${kofiData.amount} ${kofiData.currency}</li>
                    ${kofiData.tier_name ? `<li>Tier: ${kofiData.tier_name}</li>` : ''}
                    <li>Transaction ID: ${kofiData.kofi_transaction_id}</li>
                </ul>
                <p style="margin: 0 0 10px 0;">Your support helps us continue our work at Project Hessdalen. As a subscriber, you'll have access to exclusive content and updates.</p>
                <p style="margin: 0 0 10px 0;">Your subscription will automatically renew each month. You can manage or cancel your subscription anytime through your Ko-fi account.</p>
            `;
        } else if (kofiData.is_subscription_payment) {
            // Recurring subscription payment
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">Thank you for your continued support! 🙏</p>
                <p style="margin: 0 0 10px 0;">Your ${kofiData.tier_name ? `<strong>${kofiData.tier_name}</strong> ` : ''}subscription payment has been processed successfully.</p>
                <p style="margin: 0 0 10px 0;"><strong>Payment Details:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Amount: ${kofiData.amount} ${kofiData.currency}</li>
                    ${kofiData.tier_name ? `<li>Tier: ${kofiData.tier_name}</li>` : ''}
                    <li>Transaction ID: ${kofiData.kofi_transaction_id}</li>
                </ul>
                <p style="margin: 0 0 10px 0;">Your ongoing support makes a real difference in our research and community at Project Hessdalen. We truly appreciate your commitment!</p>
            `;
        } else {
            // One-time donation
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">Thank you so much for your generous donation! 💚</p>
                <p style="margin: 0 0 10px 0;">Your support of ${kofiData.amount} ${kofiData.currency} means a lot to us and helps keep Project Hessdalen running.</p>
                <p style="margin: 0 0 10px 0;"><strong>Transaction ID:</strong> ${kofiData.kofi_transaction_id}</p>
            `;
            if (kofiData.message) {
                suggestedEmail += `
                    <p style="margin: 0 0 10px 0;"><em>Your message: "${kofiData.message}"</em></p>
                `;
            }
            suggestedEmail += `
                <p style="margin: 0 0 10px 0;">Your contribution directly supports our ongoing research into the Hessdalen phenomenon and helps us maintain this valuable resource for the community.</p>
            `;
        }

        suggestedEmail += `
                <p style="margin: 0 0 10px 0;">If you have any questions or concerns, please don't hesitate to reach out to us.</p>
                <p style="margin: 10px 0 0 0;">With gratitude,<br>The Project Hessdalen Team</p>
            </div>
        `;

        emailBody += suggestedEmail;

        // Send email notification
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: [contactEmail],
            subject: emailSubject,
            html: emailBody,
        });

        // TODO: Uncomment this section when ready to send automatic thank you emails to supporters
        // await resend.emails.send({
        //     from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        //     to: [kofiData.email],
        //     subject: kofiData.type === "Shop Order" 
        //         ? `Thank you for your order!`
        //         : kofiData.is_first_subscription_payment
        //             ? `Welcome to Project Hessdalen!`
        //             : kofiData.is_subscription_payment
        //                 ? `Thank you for your continued support`
        //                 : `Thank you for your donation!`,
        //     html: suggestedEmail,
        // });

        // Log the transaction
        console.log(`Ko-fi ${kofiData.type} processed:`, {
            messageId: kofiData.message_id,
            from: kofiData.from_name,
            amount: `${kofiData.amount} ${kofiData.currency}`,
            type: kofiData.type,
        });

        // Return 200 status to acknowledge receipt
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error processing Ko-fi webhook:", error);
        return NextResponse.json(
            { error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
