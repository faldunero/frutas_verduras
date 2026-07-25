import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ordenId,
      email,
      nombre,
      items,
      subtotal,
      envio,
      total,
      metodoPago,
      estado,
    } = body

    if (!ordenId || !email || !nombre || !items || !total) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const itemsHtml = items
      .map(
        (item: OrderItem) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nombre}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.precioUnitario.toLocaleString('es-CL')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toLocaleString('es-CL')}</td>
      </tr>
    `
      )
      .join('')

    const paymentInfo =
      metodoPago === 'transfer'
        ? `
      <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin: 0 0 10px 0;">💳 Instrucciones de Pago por Transferencia</h3>
        <p style="margin: 5px 0;">Por favor realiza una transferencia a nuestra cuenta bancaria con referencia: <strong>${ordenId}</strong></p>
        <p style="margin: 5px 0;">Monto: <strong>$${total.toLocaleString('es-CL')}</strong></p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">Te contactaremos cuando recibamos el pago para confirmar tu orden.</p>
      </div>
    `
        : `
      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin: 0 0 10px 0;">✅ Pago Confirmado</h3>
        <p style="margin: 5px 0;">Tu pago ha sido procesado exitosamente.</p>
      </div>
    `

    const emailHtml = `
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
          .order-number { font-size: 18px; font-weight: bold; color: #16a34a; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary { background: white; padding: 15px; border-radius: 4px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .summary-row.total { font-weight: bold; font-size: 16px; border-bottom: none; color: #16a34a; }
          .footer { text-align: center; padding-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥬 Confirmación de Orden</h1>
          </div>
          <div class="content">
            <p>Hola ${nombre},</p>
            <p>¡Gracias por tu compra en Frutas & Verduras!</p>

            <div class="order-number">
              Número de Orden: ${ordenId}
            </div>

            <h3>Productos Ordenados</h3>
            <table>
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; font-weight: bold;">Producto</th>
                  <th style="padding: 8px; text-align: center; font-weight: bold;">Cantidad</th>
                  <th style="padding: 8px; text-align: right; font-weight: bold;">Precio</th>
                  <th style="padding: 8px; text-align: right; font-weight: bold;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div class="summary-row">
                <span>Envío:</span>
                <span>$${envio.toLocaleString('es-CL')}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>$${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            ${paymentInfo}

            <div style="background: #fef3c7; padding: 12px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Estado:</strong> ${estado === 'confirmada' ? '✅ Confirmada' : '⏳ Pendiente de pago'}</p>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 4px;">
              <h3>Próximos Pasos</h3>
              <ol>
                <li>Recibirás un email cuando tu orden sea preparada</li>
                <li>Te notificaremos cuando sea despachada con datos de seguimiento</li>
                <li>Puedes revisar el estado en tu perfil en cualquier momento</li>
              </ol>
            </div>

            <div class="footer">
              <p>¿Preguntas? <a href="mailto:info@frutasverduras.cl" style="color: #16a34a;">Contáctanos aquí</a></p>
              <p>© 2026 Frutas & Verduras. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const response = await resend.emails.send({
      from: 'ordenes@frutasverduras.cl',
      to: email,
      subject: `Confirmación de Orden #${ordenId} - Frutas & Verduras`,
      html: emailHtml,
    })

    if (response.error) {
      console.error('Error sending order confirmation:', response.error)
      return NextResponse.json(
        { error: 'Error al enviar confirmación' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Confirmación enviada' },
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
