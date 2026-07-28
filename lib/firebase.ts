import { initializeApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth: Auth = getAuth(app)

// Initialize Cloud Firestore
export const db: Firestore = getFirestore(app)

// Initialize Cloud Storage
export const storage: FirebaseStorage = getStorage(app)

export default app

// Tipos para Firestore
export interface User {
  id: string
  email: string
  nombre: string
  rol: 'client' | 'admin'
  direccion?: string
  telefono?: string
  createdAt: Date
}

export interface Competencia {
  empresa: string
  precio: number
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  unidades: number
  categoria: string
  imagenUrl?: string
  peso: string
  disponible: boolean
  destacado: boolean
  conIVA?: boolean
  unidadVenta?: 'unidad' | 'kilo'
  costo?: number
  competencia?: Competencia[]
  createdAt: Date
  updatedAt: Date
}

export interface Orden {
  id: string
  userId: string
  estado: 'pendiente' | 'pagada' | 'enviada' | 'entregada'
  total: number
  subtotal: number
  impuestos: number
  envio: number
  direccionEntrega: string
  metodoPago: string
  referenciaPago?: string
  items: OrdenItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrdenItem {
  productoId: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface FAQ {
  id: string
  pregunta: string
  respuesta: string
  orden: number
  activo: boolean
  createdAt: Date
}

export interface AnalisisHistorico {
  id: string
  productoId: string
  nombre: string
  unidadVenta: 'unidad' | 'kilo'
  precioAnterior: number
  precioSugerido: number
  costo: number
  competencia: Competencia[]
  promedioCompetencia: number
  margenGlobal: number
  timestamp: Date
  createdAt: Date
}

export interface SolicitudARCOP {
  id: string
  userId?: string
  nombre: string
  email: string
  tipo: 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion' | 'portabilidad'
  descripcion: string
  estado: 'pendiente' | 'procesada' | 'rechazada'
  createdAt: Date
  respondidoAt?: Date
}
