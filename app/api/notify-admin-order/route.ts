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
      nombre,
      email,
      telefono,
      comuna,
      items,
      total,
      metodoPago,
      estado,
    } = body

    if (!ordenId || !nombre || !items || !total) {
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

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-number { font-size: 18px; font-weight: bold; color: #dc2626; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary { background: white; padding: 15px; border-radius: 4px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .summary-row.total { font-weight: bold; font-size: 16px; border-bottom: none; color: #dc2626; }
          .customer-info { background: #eff6ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 NUEVA ORDEN RECIBIDA</h1>
          </div>
          <div class="content">
            <div class="order-number">
              Orden #${ordenId}
              <span class="status-badge ${estado === 'confirmada' ? 'status-confirmed' : 'status-pending'}">
                ${estado === 'confirmada' ? '✅ Pagada' : '⏳ Pendiente Pago'}
              </span>
            </div>

            <div class="customer-info">
              <h3 style="margin-top: 0;">📋 Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${telefono}</p>
              <p><strong>Comuna:</strong> ${comuna}</p>
              <p><strong>Método de Pago:</strong> ${metodoPago === 'transbank' ? 'Transbank' : 'Transferencia Bancaria'}</p>
            </div>

            <h3>📦 Productos</h3>
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
              <div class="summary-row total">
                <span>TOTAL A COBRAR:</span>
                <span>$${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div style="background: #fef2f2; padding: 12px; border-radius: 4px; margin-top: 20px; border-left: 4px solid #dc2626;">
              <p style="margin: 0;"><strong>⚠️ Acción requerida:</strong>
              ${estado === 'confirmada'
                ? 'Pago confirmado. Proceder a preparar orden.'
                : 'Esperando confirmación de pago por transferencia. Verifica el comprobante.'}</p>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                📊 <strong>Acceso a dashboard:</strong> <a href="https://frutas-verduras.onrender.com/admin/pedidos" style="color: #dc2626;">Ver en Admin Panel</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'info@frutasverduras.cl',
      subject: `🚨 NUEVA ORDEN #${ordenId} - $${total.toLocaleString('es-CL')}`,
      html: adminEmailHtml,
    })

    if (response.error) {
      console.error('Error sending admin notification:', response.error)
      return NextResponse.json(
        { error: 'Error al notificar al admin' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Admin notificado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in notify-admin-order:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
