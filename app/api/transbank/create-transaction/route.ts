import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let WebpayPlus: any
try {
  WebpayPlus = require('transbank-sdk').WebpayPlus
  console.log('WebpayPlus loaded successfully')
} catch (e) {
  console.error('Failed to load WebpayPlus:', e)
}

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

    console.log('DEBUG Transbank:', {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      baseUrl,
      returnUrl,
      TRANSBANK_COMMERCE_CODE: process.env.TRANSBANK_COMMERCE_CODE,
      TRANSBANK_ENVIRONMENT: process.env.TRANSBANK_ENVIRONMENT,
    })

    // Crear transacción con propiedades nombradas
    console.log('Calling tx.create with params:', {
      buy_order: ordenId.toString(),
      session_id: ordenId.toString(),
      amount: Math.round(monto),
      return_url: returnUrl,
    })

    const response = await tx.create(
      ordenId.toString(),
      ordenId.toString(),
      Math.round(monto),
      returnUrl
    )

    console.log('tx.create response:', response)

    return NextResponse.json({
      token: response.token,
      url: response.url,
      ordenId,
    })
  } catch (error: any) {
    console.error('Error en Transbank create:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    })
    return NextResponse.json(
      {
        error: 'Error al crear transacción con Transbank',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
