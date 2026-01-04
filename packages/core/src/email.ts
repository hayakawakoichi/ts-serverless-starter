import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { createLogger } from "./logger"

const logger = createLogger({ name: "email" })

export interface EmailOptions {
    to: string
    subject: string
    text: string
    html?: string
}

/**
 * Send an email using AWS SES.
 * In development, if SES_FROM_EMAIL is not set, logs the email to console instead.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    const fromEmail = process.env.SES_FROM_EMAIL

    // Development fallback: log email content if SES not configured
    if (!fromEmail) {
        logger.info(
            {
                mode: "dev",
                to: options.to,
                subject: options.subject,
                text: options.text,
            },
            "SES_FROM_EMAIL not set - email logged instead of sent"
        )
        return
    }

    const client = new SESClient({
        region: process.env.AWS_REGION || "ap-northeast-1",
    })

    try {
        const result = await client.send(
            new SendEmailCommand({
                Source: fromEmail,
                Destination: {
                    ToAddresses: [options.to],
                },
                Message: {
                    Subject: { Data: options.subject, Charset: "UTF-8" },
                    Body: {
                        Text: { Data: options.text, Charset: "UTF-8" },
                        ...(options.html && {
                            Html: { Data: options.html, Charset: "UTF-8" },
                        }),
                    },
                },
            })
        )
        logger.info(
            {
                to: options.to,
                subject: options.subject,
                messageId: result.MessageId,
            },
            "Email accepted by SES"
        )
    } catch (error) {
        // Log error details for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        const errorName = error instanceof Error ? error.name : "UnknownError"
        logger.error(
            {
                to: options.to,
                subject: options.subject,
                errorName,
                errorMessage,
            },
            "Failed to send email via SES"
        )
        // Re-throw so caller can handle if needed
        throw error
    }
}
