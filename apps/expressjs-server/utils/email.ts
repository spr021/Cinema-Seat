import nodemailer, { Transporter } from "nodemailer"

interface EmailOptions {
  email: string
  subject: string
  html: string
  text?: string
}

let cachedEthereal: { user: string; pass: string } | null = null

/**
 * Returns an SMTP transporter. Uses the configured SMTP server when
 * EMAIL_HOST/USERNAME/PASSWORD are set; otherwise falls back to an auto
 * created Ethereal test account (mail never really arrives, but a preview
 * URL is produced). Returns null when email is disabled entirely.
 */
async function getTransporter(): Promise<Transporter | null> {
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USERNAME &&
    process.env.EMAIL_PASSWORD
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  if (process.env.EMAILS_DISABLED === "true") return null

  try {
    if (!cachedEthereal) {
      const account = await nodemailer.createTestAccount()
      cachedEthereal = { user: account.user, pass: account.pass }
    }
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: cachedEthereal,
    })
  } catch (error) {
    console.error("Could not create a test email account:", error)
    return null
  }
}

/**
 * Sends an email. Never throws: delivery problems are logged and returned,
 * so a broken SMTP server can't take down a booking flow.
 * Returns { previewUrl } for Ethereal/dev, or null when disabled/failed.
 */
const sendEmail = async (
  options: EmailOptions
): Promise<{ previewUrl?: string } | null> => {
  try {
    const transporter = await getTransporter()
    if (!transporter) return null

    const mail = await transporter.sendMail({
      from: "Cinema Seat <no-reply@cinemaseat.local>",
      to: options.email,
      subject: options.subject,
      text: options.text ?? options.html.replace(/<[^>]+>/g, " "),
      html: options.html,
    })

    const previewUrl = nodemailer.getTestMessageUrl(mail) || undefined
    if (previewUrl) {
      console.log(`📧 Email sent. Preview: ${previewUrl}`)
    }
    return { previewUrl: previewUrl ?? undefined }
  } catch (error) {
    console.error(`Failed to send email "${options.subject}":`, error)
    return null
  }
}

export default sendEmail
