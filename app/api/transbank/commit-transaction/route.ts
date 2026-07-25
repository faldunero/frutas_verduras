import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const WebpayPlus = require('transbank-sdk').WebpayPlus

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenWs = searchParams.get('token_ws')
    const tBkToken = searchParams.get('TBK_TOKEN')

    if (!tokenWs && !tBkToken) {
      return NextResponse.redirect(
        new URL('/checkout?error=token_missing', request.url)
      )
    }

    const token = tokenWs || tBkToken

    // Configurar Transbank
    const tx = new WebpayPlus.Transaction({
      commerceCode: process.env.TRANSBANK_COMMERCE_CODE,
      apiKey: process.env.TRANSBANK_API_KEY,
      environment: process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION',
    })

    // Confirmar transacción
    const response = await tx.commit(token)

    if (response.response_code === 0) {
      // Pago exitoso
      const ordenId = response.buy_order
      const monto = response.amount
      const referencia = response.authorization_code

      // Actualizar el estado de la orden en Firebase
      const ordenRef = doc(db, 'ordenes', ordenId)
      const ordenDoc = await getDoc(ordenRef)

      if (ordenDoc.exists()) {
        await updateDoc(ordenRef, {
          estado: 'confirmada',
          referenciaPago: referencia,
          montoPagado: monto,
          fechaPago: new Date(),
          metodoPago: 'transbank',
        })
      }

      // Redirigir a página de éxito
      return NextResponse.redirect(
        new URL(`/orden-confirmada/${ordenId}`, request.url)
      )
    } else {
      // Pago rechazado
      return NextResponse.redirect(
        new URL(
          `/checkout?error=payment_rejected&code=${response.response_code}`,
          request.url
        )
      )
    }
  } catch (error) {
    console.error('Error en Transbank commit:', error)
    return NextResponse.redirect(
      new URL('/checkout?error=payment_error', request.url)
    )
  }
}
