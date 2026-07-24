import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { to, asunto, html, tipo } = await request.json()

    if (!to || !asunto || !html) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const mailOptions = {
      from: `Frutas & Verduras <${process.env.GMAIL_USER}>`,
      to,
      subject: asunto,
      html,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, mensaje: 'Email enviado correctamente' })
  } catch (error: any) {
    console.error('Error enviando email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
