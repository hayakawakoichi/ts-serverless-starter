import { APP_NAME } from "./constants"

export interface EmailTemplate {
    subject: string
    text: string
    html: string
}

/**
 * Generate email verification template
 */
export function getVerificationEmailTemplate(url: string, userName: string): EmailTemplate {
    const subject = `Verify your email - ${APP_NAME}`

    const text = `Hi ${userName},

Please verify your email address by clicking the link below:

${url}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Thanks,
${APP_NAME} Team`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #e0e0e0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <h1 style="color: #00ffff; font-size: 24px; margin: 0 0 24px 0;">Verify your email</h1>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Please verify your email address by clicking the button below:</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                    <tr>
                        <td style="border-radius: 4px; background: linear-gradient(135deg, #00ffff 0%, #39ff14 100%);">
                            <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0a0a0f; text-decoration: none;">Verify Email</a>
                        </td>
                    </tr>
                </table>
                <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 16px 0;">This link will expire in 24 hours.</p>
                <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 16px 0;">If you didn't create an account, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
                <p style="font-size: 12px; color: #666; margin: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #00ffff; word-break: break-all; margin: 8px 0 0 0;">${url}</p>
            </td>
        </tr>
    </table>
</body>
</html>`

    return { subject, text, html }
}

/**
 * Generate password reset template
 */
export function getPasswordResetEmailTemplate(url: string, userName: string): EmailTemplate {
    const subject = `Reset your password - ${APP_NAME}`

    const text = `Hi ${userName},

We received a request to reset your password. Click the link below to set a new password:

${url}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Thanks,
${APP_NAME} Team`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #e0e0e0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <h1 style="color: #00ffff; font-size: 24px; margin: 0 0 24px 0;">Reset your password</h1>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">We received a request to reset your password. Click the button below to set a new password:</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                    <tr>
                        <td style="border-radius: 4px; background: linear-gradient(135deg, #00ffff 0%, #39ff14 100%);">
                            <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0a0a0f; text-decoration: none;">Reset Password</a>
                        </td>
                    </tr>
                </table>
                <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 16px 0;">This link will expire in 1 hour.</p>
                <p style="font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 16px 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
                <p style="font-size: 12px; color: #666; margin: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #00ffff; word-break: break-all; margin: 8px 0 0 0;">${url}</p>
            </td>
        </tr>
    </table>
</body>
</html>`

    return { subject, text, html }
}
