import { NextRequest, NextResponse } from 'next/server'

const WebpayPlus = require('transbank-sdk').WebpayPlus

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ordenId, monto, email } = body

    if (!ordenId || !monto || !email) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Configurar Transbank
    const tx = new WebpayPlus.Transaction({
      commerceCode: process.env.TRANSBANK_COMMERCE_CODE,
      apiKey: process.env.TRANSBANK_API_KEY,
      environment: process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION',
    })

    // URL de retorno (debe ser absoluta)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/api/transbank/commit-transaction`

    // Crear transacción
    const response = await tx.create(
      ordenId.toString(), // sessionId
      email, // email
      Math.round(monto), // amount en pesos
      returnUrl // returnUrl
    )

    return NextResponse.json({
      token: response.token,
      url: response.url,
      ordenId,
    })
  } catch (error) {
    console.error('Error en Transbank create:', error)
    return NextResponse.json(
      { error: 'Error al crear transacción con Transbank' },
      { status: 500 }
    )
  }
}
