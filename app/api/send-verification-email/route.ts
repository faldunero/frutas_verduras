import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // TODO: Validación de reCAPTCHA desactivada temporalmente hasta crear proyecto de GCP válido
    // Cuando esté listo, descomentar la siguiente sección:
    /*
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
    if (!recaptchaSecret) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
    })
    const recaptchaData = await recaptchaResponse.json()
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json({ error: 'Verificación de reCAPTCHA fallida' }, { status: 403 })
    }
    */

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Generar token de verificación
    const verificationToken = uuidv4()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Guardar token en Firestore
    await setDoc(doc(db, 'emailVerifications', email), {
      token: verificationToken,
      email,
      createdAt: new Date(),
      expiresAt: tokenExpiry,
      verified: false,
    })

    // Enviar email de verificación
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    console.log('Sending verification email:', { fromEmail, to: email, verificationUrl })

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verifica tu email - Frutas & Verduras',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #16a34a, #15803d); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥬 Verifica tu email</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Gracias por registrarte en Frutas & Verduras. Para completar tu registro, verifica tu email haciendo clic en el botón de abajo.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar Email</a>
              </p>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 12px;">
                ${verificationUrl}
              </p>
              <p>Este enlace expira en 24 horas.</p>
              <p>Si no solicitaste este registro, puedes ignorar este email.</p>
            </div>
            <div class="footer">
              <p>© 2026 Frutas & Verduras. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('Resend response:', emailResponse)

    if (emailResponse.error) {
      console.error('Error sending verification email:', emailResponse.error)
      return NextResponse.json(
        { error: `Error al enviar email: ${JSON.stringify(emailResponse.error)}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Email de verificación enviado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in send-verification-email:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
