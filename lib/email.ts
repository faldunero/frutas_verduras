export const sendEmail = async (
  to: string,
  asunto: string,
  html: string
) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, asunto, html }),
    })
    return response.json()
  } catch (error) {
    console.error('Error enviando email:', error)
    throw error
  }
}

export const emailConfirmacionPedido = (
  nombre: string,
  numeroOrden: string,
  total: number,
  items: any[],
  direccion: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #10b981; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; border-radius: 5px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥬 Frutas & Verduras</h1>
            <h2>¡Tu pedido fue confirmado!</h2>
          </div>

          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>

            <p>Tu pedido ha sido confirmado exitosamente. Aquí están los detalles:</p>

            <p><strong>Número de Orden:</strong> #${numeroOrden}</p>
            <p><strong>Estado:</strong> Pendiente de despacho</p>

            <div class="items">
              <h3>Productos:</h3>
              ${items.map((item) => `
                <div class="item">
                  <span>${item.nombre} x${item.cantidad}</span>
                  <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>

            <div class="total">
              Total: $${total.toLocaleString()}
            </div>

            <p><strong>Dirección de Entrega:</strong><br/>${direccion}</p>

            <p><strong>Próximos pasos:</strong></p>
            <ul>
              <li>Recibiremos tu pedido mañana</li>
              <li>Lo despacharemos al día siguiente</li>
              <li>Recibirás un email con el estado de tu pedido</li>
            </ul>

            <p>¿Preguntas? Contáctanos a <strong>soporte@frutasverduras.cl</strong></p>
          </div>

          <div class="footer">
            <p>© 2026 Frutas & Verduras. Todos los derechos reservados.</p>
            <p>Este email fue enviado a ${to}</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export const emailCambioEstado = (
  nombre: string,
  numeroOrden: string,
  nuevoEstado: string
) => {
  const estadoTexto = {
    pendiente: 'Tu pedido está pendiente de despacho',
    completado: 'Tu pedido ha sido entregado exitosamente',
    cancelado: 'Tu pedido ha sido cancelado',
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { padding: 20px; }
          .status { font-size: 16px; font-weight: bold; padding: 15px; border-radius: 5px; ${
            nuevoEstado === 'completado'
              ? 'background-color: #d1fae5; color: #065f46;'
              : nuevoEstado === 'cancelado'
              ? 'background-color: #fee2e2; color: #7f1d1d;'
              : 'background-color: #fef3c7; color: #92400e;'
          } }
          .footer { background-color: #f3f4f6; padding: 20px; border-radius: 5px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥬 Frutas & Verduras</h1>
            <h2>Actualización de tu pedido</h2>
          </div>

          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>

            <div class="status">
              ${estadoTexto[nuevoEstado as keyof typeof estadoTexto] || 'Tu pedido ha sido actualizado'}
            </div>

            <p><strong>Número de Orden:</strong> #${numeroOrden}</p>
            <p><strong>Nuevo Estado:</strong> ${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)}</p>

            <p>¿Preguntas? Contáctanos a <strong>soporte@frutasverduras.cl</strong></p>
          </div>

          <div class="footer">
            <p>© 2026 Frutas & Verduras. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
