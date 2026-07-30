'use client'

export default function ObservabilidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Observabilidad - En Mantenimiento</h1>
          <p className="text-gray-600 mb-6">
            Estamos arreglando un problema técnico. Por favor, intenta más tarde.
          </p>
          <a
            href="/admin/dashboard"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
