# 🔥 Migración de Supabase a Firebase

## ¿Por qué cambiar a Firebase?

✅ Plan pago ya disponible  
✅ Mejor rendimiento en autenticación  
✅ Firestore es flexible y escalable  
✅ Firebase Storage para imágenes  
✅ Real-time capabilities  

---

## 📋 Cambios Realizados

### 1. Dependencias
```bash
# Eliminadas
@supabase/supabase-js
@supabase/auth-helpers-nextjs

# Agregadas
firebase
```

### 2. Librerías
- **Antes:** `lib/supabase.ts` (Supabase client)
- **Ahora:** `lib/firebase.ts` (Firebase client + tipos)

### 3. Autenticación
- **Antes:** `supabase.auth.signInWithPassword()`
- **Ahora:** `signInWithEmailAndPassword()` (Firebase Auth)

### 4. Base de Datos
- **Antes:** PostgreSQL (tablas SQL)
- **Ahora:** Firestore (colecciones de documentos JSON)

---

## 🚀 Setup Firebase

### Paso 1: Crear Proyecto Firebase

1. Ve a https://console.firebase.google.com/
2. Click "Add project"
3. Nombre: `frutas-verduras`
4. Activa Google Analytics (opcional)
5. Click "Create project"

### Paso 2: Obtener Credenciales

1. En Firebase Console → Settings ⚙️ → Project Settings
2. Baja hasta "Your apps"
3. Click el ícono "</>" (Web)
4. Copia el `firebaseConfig` object

Debería verse así:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "frutas-verduras.firebaseapp.com",
  projectId: "frutas-verduras",
  storageBucket: "frutas-verduras.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  measurementId: "G-ABC123..."
}
```

### Paso 3: Configurar .env.local

```bash
cd /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=frutas-verduras.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=frutas-verduras
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=frutas-verduras.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### Paso 4: Habilitar Autenticación

1. Firebase Console → Build → Authentication
2. Click "Get started"
3. Habilita "Email/Password"
4. Guarda cambios

### Paso 5: Crear Firestore Database

1. Firebase Console → Build → Firestore Database
2. Click "Create database"
3. Ubicación: `nam5` (América del Norte - más cercano)
4. Modo de seguridad: "Start in test mode" (cambiar después)
5. Click "Enable"

### Paso 6: Crear Colecciones

En Firestore, crea estas colecciones (vacías por ahora):

1. **users** - Datos de usuarios
2. **productos** - Catálogo de productos
3. **ordenes** - Órdenes de compra
4. **faqs** - Preguntas frecuentes

---

## 📊 Estructura de Datos - Firestore

### Colección: `users`

```javascript
{
  id: "user_uid", // auto-generated por Firebase
  email: "cliente@test.com",
  nombre: "Juan",
  rol: "client", // "client" | "admin"
  direccion: "",
  telefono: "",
  createdAt: Timestamp
}
```

### Colección: `productos`

```javascript
{
  id: "auto_id",
  nombre: "Manzana",
  descripcion: "Manzanas frescas",
  precio: 2500,
  stock: 50,
  categoria: "frutas",
  imagenUrl: "gs://...", // Firebase Storage URL
  peso: "1kg",
  disponible: true,
  destacado: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección: `ordenes`

```javascript
{
  id: "auto_id",
  userId: "user_uid",
  estado: "pendiente", // "pendiente" | "pagada" | "enviada" | "entregada"
  total: 15000,
  subtotal: 12000,
  impuestos: 3000,
  envio: 0,
  direccionEntrega: "Calle Principal 123",
  metodoPago: "flow",
  referenciaPago: "",
  items: [
    {
      productoId: "producto_id",
      cantidad: 2,
      precioUnitario: 6000,
      subtotal: 12000
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Colección: `faqs`

```javascript
{
  id: "auto_id",
  pregunta: "¿Cuál es el horario de entrega?",
  respuesta: "Entregamos de 9am a 6pm",
  orden: 1,
  activo: true,
  createdAt: Timestamp
}
```

---

## 🔐 Reglas de Seguridad Firestore

En Firebase Console → Firestore → Rules, reemplaza con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios solo pueden leer su propio documento
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
    }
    
    // Productos públicos (cualquiera puede leer)
    match /productos/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Órdenes (usuario solo accede a las suyas)
    match /ordenes/{orderId} {
      allow read, create, update: if request.auth.uid == resource.data.userId;
      allow update: if request.auth.token.admin == true;
    }
    
    // FAQs públicas
    match /faqs/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📦 Actualizar Dependencias

```bash
npm install
# O si usas yarn:
yarn install
```

---

## ✅ Verificar que Todo Funciona

```bash
npm run dev
```

Prueba:
1. ✅ Home carga sin errores
2. ✅ Registro funciona (usuario creado en Firebase Auth)
3. ✅ Login funciona
4. ✅ Usuario aparece en Firestore → users

---

## 🚀 Cambios en Código Futuro

### Lectura de Productos (Fase 2+)

**Antes (Supabase):**
```javascript
const { data } = await supabase
  .from('productos')
  .select('*')
  .eq('disponible', true)
```

**Ahora (Firebase):**
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore'

const q = query(
  collection(db, 'productos'),
  where('disponible', '==', true)
)
const snapshot = await getDocs(q)
const productos = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}))
```

### Crear Producto (Fase 2+)

**Antes (Supabase):**
```javascript
await supabase.from('productos').insert([producto])
```

**Ahora (Firebase):**
```javascript
import { collection, addDoc } from 'firebase/firestore'

const docRef = await addDoc(collection(db, 'productos'), producto)
```

---

## 🎯 Checklist de Migración

- [ ] Crear proyecto Firebase
- [ ] Habilitar Authentication (Email/Password)
- [ ] Crear Firestore Database
- [ ] Crear colecciones (users, productos, ordenes, faqs)
- [ ] Copiar credenciales a `.env.local`
- [ ] Ejecutar `npm install`
- [ ] Probar login/registro
- [ ] Verificar que usuario aparece en Firestore

---

## 📚 Recursos

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)

---

**¡Listo para usar Firebase! 🔥**

Con el plan pago, tendrás:
- ✅ Almacenamiento ilimitado
- ✅ Más operaciones de lectura/escritura
- ✅ Mejor soporte
- ✅ Más funcionalidades

Próximo paso: Instala dependencias y prueba autenticación.
