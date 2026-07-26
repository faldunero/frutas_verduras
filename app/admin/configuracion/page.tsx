'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Config {
  categorias: string[]
  estados: string[]
  roles: string[]
  comunas: string[]
  metodosPago: string[]
  tiposVenta: string[]
}

const DEFAULT_CONFIG: Config = {
  categorias: ['frutas', 'verduras', 'organico', 'carnes', 'embutidos', 'otro'],
  estados: ['pendiente', 'confirmada', 'entregada', 'cancelada'],
  roles: ['user', 'admin'],
  comunas: ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia', 'La Reina', 'Ñuñoa'],
  metodosPago: ['transferencia', 'transbank'],
  tiposVenta: ['unidad', 'kilo'],
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<keyof Config | null>(null)
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'config', 'general'))
      if (docSnap.exists()) {
        setConfig(docSnap.data() as Config)
      }
    } catch (error) {
      console.error('Error loading config:', error)
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'config', 'general'), {
        ...config,
        updatedAt: serverTimestamp(),
      })
      toast.success('Configuración guardada')
      setEditingSection(null)
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = (section: keyof Config) => {
    if (!tempValue.trim()) {
      toast.error('El valor no puede estar vacío')
      return
    }

    const items = config[section] as string[]
    if (items.includes(tempValue)) {
      toast.error('Este valor ya existe')
      return
    }

    setConfig({
      ...config,
      [section]: [...items, tempValue],
    })
    setTempValue('')
  }

  const handleRemoveItem = (section: keyof Config, index: number) => {
    const items = config[section] as string[]
    setConfig({
      ...config,
      [section]: items.filter((_, i) => i !== index),
    })
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setEditingSection(null)
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                Volver
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorías */}
            <ConfigSection
              title="📦 Categorías"
              section="categorias"
              items={config.categorias}
              isEditing={editingSection === 'categorias'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('categorias')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('categorias')}
              onRemove={(i) => handleRemoveItem('categorias', i)}
              onTempChange={setTempValue}
            />

            {/* Estados */}
            <ConfigSection
              title="📋 Estados de Órdenes"
              section="estados"
              items={config.estados}
              isEditing={editingSection === 'estados'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('estados')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('estados')}
              onRemove={(i) => handleRemoveItem('estados', i)}
              onTempChange={setTempValue}
            />

            {/* Roles */}
            <ConfigSection
              title="👥 Roles de Usuarios"
              section="roles"
              items={config.roles}
              isEditing={editingSection === 'roles'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('roles')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('roles')}
              onRemove={(i) => handleRemoveItem('roles', i)}
              onTempChange={setTempValue}
            />

            {/* Comunas */}
            <ConfigSection
              title="📍 Comunas de Entrega"
              section="comunas"
              items={config.comunas}
              isEditing={editingSection === 'comunas'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('comunas')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('comunas')}
              onRemove={(i) => handleRemoveItem('comunas', i)}
              onTempChange={setTempValue}
            />

            {/* Métodos de Pago */}
            <ConfigSection
              title="💳 Métodos de Pago"
              section="metodosPago"
              items={config.metodosPago}
              isEditing={editingSection === 'metodosPago'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('metodosPago')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('metodosPago')}
              onRemove={(i) => handleRemoveItem('metodosPago', i)}
              onTempChange={setTempValue}
            />

            {/* Tipos de Venta */}
            <ConfigSection
              title="🏷️ Tipos de Venta"
              section="tiposVenta"
              items={config.tiposVenta}
              isEditing={editingSection === 'tiposVenta'}
              tempValue={tempValue}
              onEdit={() => {
                setEditingSection('tiposVenta')
                setTempValue('')
              }}
              onAdd={() => handleAddItem('tiposVenta')}
              onRemove={(i) => handleRemoveItem('tiposVenta', i)}
              onTempChange={setTempValue}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              {saving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              🔄 Restaurar Valores Iniciales
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

interface ConfigSectionProps {
  title: string
  section: string
  items: string[]
  isEditing: boolean
  tempValue: string
  onEdit: () => void
  onAdd: () => void
  onRemove: (index: number) => void
  onTempChange: (value: string) => void
}

function ConfigSection({
  title,
  items,
  isEditing,
  tempValue,
  onEdit,
  onAdd,
  onRemove,
  onTempChange,
}: ConfigSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span className="text-gray-900">{item}</span>
            {isEditing && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => onTempChange(e.target.value)}
              placeholder="Agregar nuevo valor..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              onKeyPress={(e) => {
                if (e.key === 'Enter') onAdd()
              }}
            />
            <button
              onClick={onAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              +
            </button>
          </div>
          <button
            onClick={() => {
              onEdit()
            }}
            className="w-full text-gray-600 hover:text-gray-900 font-semibold text-sm py-2"
          >
            Listo
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-2 rounded-lg transition"
        >
          Editar
        </button>
      )}
    </div>
  )
}
