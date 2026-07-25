import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, asunto, mensaje } = body

    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Enviar email al admin
    const adminResponse = await resend.emails.send({
      from: 'noreply@frutasverduras.cl',
      to: 'info@frutasverduras.cl',
      subject: `Nuevo contacto: ${asunto}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
    })

    if (adminResponse.error) {
      console.error('Error sending admin email:', adminResponse.error)
      return NextResponse.json(
        { error: 'Error al enviar el mensaje' },
        { status: 500 }
      )
    }

    // Enviar confirmación al usuario
    await resend.emails.send({
      from: 'noreply@frutasverduras.cl',
      to: email,
      subject: 'Hemos recibido tu mensaje - Frutas & Verduras',
      html: `
        <h2>Gracias por contactarnos</h2>
        <p>Hola ${nombre},</p>
        <p>Recibimos tu mensaje y nos pondremos en contacto pronto.</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p>Te responderemos dentro de 24 horas hábiles.</p>
        <br>
        <p>Saludos,<br>Equipo Frutas & Verduras</p>
      `,
    })

    return NextResponse.json(
      { success: true, message: 'Mensaje enviado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in contacto API:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
