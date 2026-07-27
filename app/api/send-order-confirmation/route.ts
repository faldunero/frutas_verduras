import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ordenId, email, nombre, items, subtotal, envio, total, metodoPago, estado } = body

    if (!email || !ordenId) {
      return NextResponse.json(
        { error: 'Email y orderID son requeridos' },
        { status: 400 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    // Generar HTML de items
    const itemsHTML = items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
          ${item.nombre}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.cantidad}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${item.precioUnitario.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${item.subtotal.toLocaleString()}
        </td>
      </tr>
    `
      )
      .join('')

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Confirmación de tu Orden #${ordenId} - Frutas & Verduras`,
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
            .order-info { background: white; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #16a34a; }
            .order-info p { margin: 8px 0; }
            .order-id { font-weight: bold; color: #16a34a; font-size: 16px; }
            .status { background: #dbeafe; color: #1e40af; padding: 8px 12px; border-radius: 4px; display: inline-block; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #16a34a; }
            .totals { background: white; padding: 15px; border-radius: 4px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total-row.final { border: none; border-top: 2px solid #16a34a; font-weight: bold; font-size: 18px; color: #16a34a; margin-top: 10px; padding-top: 15px; }
            .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; margin-top: 20px; }
            .cta-button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥬 Tu orden ha sido confirmada</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>¡Gracias por tu compra! Tu orden ha sido recibida y estamos procesándola.</p>

              <div class="order-info">
                <p><strong>Número de Orden:</strong> <span class="order-id">#${ordenId}</span></p>
                <p><strong>Estado:</strong> <span class="status">${estado.toUpperCase()}</span></p>
                <p><strong>Método de Pago:</strong> ${metodoPago === 'transfer' ? 'Transferencia Bancaria' : metodoPago === 'transbank' ? 'Transbank' : metodoPago}</p>
              </div>

              <h3 style="margin-top: 20px; color: #16a34a;">Detalles de tu Compra</h3>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toLocaleString()}</span>
                </div>
                <div class="total-row final">
                  <span>TOTAL:</span>
                  <span>$${total.toLocaleString()}</span>
                </div>
              </div>

              <p style="text-align: center;">
                <a href="https://frutas-verduras.onrender.com/ordenes" class="cta-button">Ver tu orden</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Frutas & Verduras. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailResponse.error) {
      console.error('Error sending order confirmation email:', emailResponse.error)
      return NextResponse.json(
        { error: 'Error al enviar email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Email de confirmación enviado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in send-order-confirmation:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
