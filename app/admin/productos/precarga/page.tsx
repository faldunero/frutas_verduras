'use client'
import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { FiTrash2, FiUpload } from 'react-icons/fi'
import Link from 'next/link'

interface Producto {
  id?: string
  nombre: string
  categoria: 'frutas' | 'verduras' | 'organico' | 'otro'
  peso: string
  precio: number
  descripcion: string
  disponible: boolean
  destacado: boolean
  unidades: number
}

const productosIniciales: Producto[] = [
  // Frutas básicas
  { nombre: 'Manzana Roja', categoria: 'frutas', peso: '1 kg', precio: 3500, descripcion: 'Manzanas rojas frescas y crujientes', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Manzana Verde', categoria: 'frutas', peso: '1 kg', precio: 3500, descripcion: 'Manzanas verdes ácidas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Manzana Royal Gala', categoria: 'frutas', peso: '1 kg', precio: 4000, descripcion: 'Manzana Royal Gala premium', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Manzana Fuji', categoria: 'frutas', peso: '1 kg', precio: 3800, descripcion: 'Manzana Fuji dulce', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Manzana Pink Lady', categoria: 'frutas', peso: '1 kg', precio: 4200, descripcion: 'Manzana Pink Lady rosada', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Plátano', categoria: 'frutas', peso: '1 kg', precio: 2800, descripcion: 'Plátanos maduros', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Naranja Valencia', categoria: 'frutas', peso: '1 kg', precio: 3200, descripcion: 'Naranjas jugosas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Limón', categoria: 'frutas', peso: '500 g', precio: 2000, descripcion: 'Limones frescos', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Fresa', categoria: 'frutas', peso: '250 g', precio: 4500, descripcion: 'Fresas rojas dulces', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Arándano', categoria: 'frutas', peso: '200 g', precio: 5500, descripcion: 'Arándanos frescos', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Pera', categoria: 'frutas', peso: '1 kg', precio: 4000, descripcion: 'Peras dulces', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Sandía', categoria: 'frutas', peso: '4 kg', precio: 8000, descripcion: 'Sandía refrescante', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Melón', categoria: 'frutas', peso: '2 kg', precio: 6500, descripcion: 'Melón aromático', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Melón Calampeño', categoria: 'frutas', peso: '2 kg', precio: 7000, descripcion: 'Melón Calampeño', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Melón Tuna', categoria: 'frutas', peso: '2 kg', precio: 6800, descripcion: 'Melón Tuna', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Uva Verde', categoria: 'frutas', peso: '500 g', precio: 5000, descripcion: 'Uvas verdes', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Uva Roja', categoria: 'frutas', peso: '500 g', precio: 5200, descripcion: 'Uvas rojas', disponible: false, destacado: false, stock: 0 },

  // Verduras
  { nombre: 'Lechuga', categoria: 'verduras', peso: '300 g', precio: 2000, descripcion: 'Lechuga fresca', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Tomate', categoria: 'verduras', peso: '1 kg', precio: 3500, descripcion: 'Tomates rojos', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Zanahoria', categoria: 'verduras', peso: '1 kg', precio: 2500, descripcion: 'Zanahorias dulces', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Brócoli', categoria: 'verduras', peso: '400 g', precio: 3800, descripcion: 'Brócoli fresco', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Coliflor', categoria: 'verduras', peso: '400 g', precio: 3500, descripcion: 'Coliflor blanca', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Cebolla Blanca', categoria: 'verduras', peso: '1 kg', precio: 2200, descripcion: 'Cebollas blancas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Cebolla Morada', categoria: 'verduras', peso: '1 kg', precio: 2500, descripcion: 'Cebollas moradas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Ajo', categoria: 'verduras', peso: '500 g', precio: 3500, descripcion: 'Ajo fresco', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Pimiento Rojo', categoria: 'verduras', peso: '500 g', precio: 4500, descripcion: 'Pimientos rojos', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Pimiento Verde', categoria: 'verduras', peso: '500 g', precio: 3800, descripcion: 'Pimientos verdes', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Espinaca', categoria: 'verduras', peso: '200 g', precio: 2800, descripcion: 'Espinaca fresca', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Acelga', categoria: 'verduras', peso: '300 g', precio: 2500, descripcion: 'Acelga fresca', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Papas', categoria: 'verduras', peso: '2 kg', precio: 2800, descripcion: 'Papas blancas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Choclo', categoria: 'verduras', peso: '500 g', precio: 3200, descripcion: 'Choclo fresco', disponible: false, destacado: false, stock: 0 },

  // Paltas
  { nombre: 'Palta Hass', categoria: 'otro', peso: '300 g', precio: 4500, descripcion: 'Palta Hass cremosa', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Palta Negra de la Cruz', categoria: 'otro', peso: '350 g', precio: 4800, descripcion: 'Palta Negra de la Cruz', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Palta Fuerte', categoria: 'otro', peso: '300 g', precio: 4200, descripcion: 'Palta Fuerte', disponible: false, destacado: false, stock: 0 },

  // Orgánico
  { nombre: 'Tomate Orgánico', categoria: 'organico', peso: '500 g', precio: 5500, descripcion: 'Tomate orgánico', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Lechuga Orgánica', categoria: 'organico', peso: '250 g', precio: 4000, descripcion: 'Lechuga orgánica', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Zanahoria Orgánica', categoria: 'organico', peso: '500 g', precio: 4200, descripcion: 'Zanahoria orgánica', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Brócoli Orgánico', categoria: 'organico', peso: '300 g', precio: 5000, descripcion: 'Brócoli orgánico', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Espinaca Orgánica', categoria: 'organico', peso: '200 g', precio: 4500, descripcion: 'Espinaca orgánica', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Manzana Orgánica', categoria: 'organico', peso: '1 kg', precio: 6500, descripcion: 'Manzana orgánica', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Plátano Orgánico', categoria: 'organico', peso: '1 kg', precio: 5500, descripcion: 'Plátano orgánico', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Fresas Orgánicas', categoria: 'organico', peso: '250 g', precio: 7000, descripcion: 'Fresas orgánicas', disponible: false, destacado: false, stock: 0 },

  // Otros
  { nombre: 'Huevos Camperos', categoria: 'otro', peso: '6 unidades', precio: 5500, descripcion: 'Huevos camperos', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Queso Fresco', categoria: 'otro', peso: '250 g', precio: 6500, descripcion: 'Queso fresco', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Queso Cheddar', categoria: 'otro', peso: '200 g', precio: 7500, descripcion: 'Queso cheddar', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Almendras', categoria: 'otro', peso: '200 g', precio: 8000, descripcion: 'Almendras naturales', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Nueces', categoria: 'otro', peso: '200 g', precio: 7500, descripcion: 'Nueces frescas', disponible: false, destacado: false, stock: 0 },
  { nombre: 'Avellanas', categoria: 'otro', peso: '150 g', precio: 6500, descripcion: 'Avellanas selectas', disponible: false, destacado: false, stock: 0 },
]

export default function PrecargaPage() {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales)
  const [guardando, setGuardando] = useState(false)
  const [precargaCompletada, setPrecargaCompletada] = useState(false)
  const [verificando, setVerificando] = useState(true)

  // Verificar si ya hay productos en la BD
  useEffect(() => {
    const verificarPrecarga = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        if (querySnapshot.docs.length > 0) {
          setPrecargaCompletada(true)
        }
      } catch (error) {
        console.error('Error verificando precarga:', error)
      } finally {
        setVerificando(false)
      }
    }
    verificarPrecarga()
  }, [])

  const handleCambio = (index: number, campo: keyof Producto, valor: any) => {
    const nuevos = [...productos]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setProductos(nuevos)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      let count = 0
      let duplicados = 0

      for (const producto of productos) {
        if (producto.disponible) {
          // Verificar si el producto ya existe
          const q = query(collection(db, 'productos'), where('nombre', '==', producto.nombre))
          const querySnapshot = await getDocs(q)

          if (querySnapshot.docs.length === 0) {
            // Solo agregar si no existe
            await addDoc(collection(db, 'productos'), {
              ...producto,
              imagenUrl: '',
              disponible: true,
            })
            count++
          } else {
            duplicados++
          }
        }
      }

      if (count > 0) {
        toast.success(`✓ ${count} productos agregados${duplicados > 0 ? ` (${duplicados} ya existían)` : ''}`)
        setPrecargaCompletada(true)
      } else if (duplicados > 0) {
        toast.success(`✓ Todos los productos ya existen en la BD`)
        setPrecargaCompletada(true)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index))
  }

  const disponibles = productos.filter(p => p.disponible).length

  if (verificando) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando estado de precarga...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (precargaCompletada) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 py-20">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold mb-4">Precarga Completada</h1>
              <p className="text-gray-600 mb-8">
                Los productos ya han sido cargados en la base de datos.
                Ahora puedes administrar los productos desde el panel admin.
              </p>
              <div className="space-y-3">
                <Link
                  href="/admin"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                >
                  ← Volver al Panel Admin
                </Link>
                <p className="text-xs text-gray-500 mt-4">
                  Esta página ya no es necesaria. Los productos se administran desde el panel admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Precarga de Productos</h1>
                <p className="text-gray-600 mt-2">Disponibles: {disponibles} | Total: {productos.length}</p>
              </div>
              <button
                onClick={handleGuardar}
                disabled={guardando || disponibles === 0}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
              >
                <FiUpload /> Guardar ({disponibles})
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Categoría</th>
                  <th className="px-4 py-2 text-left">Peso</th>
                  <th className="px-4 py-2 text-left">Precio</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-center">✓ Prod</th>
                  <th className="px-4 py-2 text-center">⭐ Des</th>
                  <th className="px-4 py-2 text-center">Del</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={producto.nombre}
                        onChange={(e) => handleCambio(index, 'nombre', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={producto.categoria}
                        onChange={(e) => handleCambio(index, 'categoria', e.target.value as any)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="frutas">Frutas</option>
                        <option value="verduras">Verduras</option>
                        <option value="organico">Orgánico</option>
                        <option value="otro">Otro</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={producto.peso}
                        onChange={(e) => handleCambio(index, 'peso', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={producto.precio}
                        onChange={(e) => handleCambio(index, 'precio', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={producto.unidades}
                        onChange={(e) => handleCambio(index, 'stock', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={producto.disponible}
                        onChange={(e) => handleCambio(index, 'disponible', e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={producto.destacado}
                        onChange={(e) => handleCambio(index, 'destacado', e.target.checked)}
                        disabled={!producto.disponible}
                        className="w-4 h-4 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleEliminar(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
