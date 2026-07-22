# 🥬 Guía de Setup - Ecommerce Frutas & Verduras

## Fase 1: Autenticación & Estructura Base ✅

Este es el código funcional de la **Fase 1**. Incluye:
- ✅ Sistema de autenticación (login/registro)
- ✅ Estructura base del proyecto
- ✅ Componentes principales (Header, Footer)
- ✅ Protección de rutas
- ✅ Integración Supabase

---

## Requisitos Previos

1. **Node.js** 18+ instalado
2. **Cuenta Supabase** (gratis en https://supabase.com)
3. **Git** instalado

---

## Paso 1: Crear Proyecto Next.js

```bash
npx create-next-app@latest frutas-verduras-ecommerce --typescript
cd frutas-verduras-ecommerce
```

Opciones recomendadas:
- ✅ Use TypeScript
- ✅ Use Tailwind CSS
- ✅ Use src/ directory: No
- ✅ App Router: Yes

---

## Paso 2: Instalar Dependencias

Reemplaza el contenido de `package.json` con el archivo proporcionado y ejecuta:

```bash
npm install
```

---

## Paso 3: Copiar Archivos Fase 1

Copia los siguientes archivos a tu proyecto:

**Estructura de carpetas:**
```
frutas-verduras-ecommerce/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          (copiar: app_auth_login_page.tsx)
│   │   └── register/
│   │       └── page.tsx          (copiar: app_auth_register_page.tsx)
│   ├── layout.tsx                (copiar: app_layout.tsx)
│   ├── page.tsx                  (copiar: app_page.tsx)
│   └── globals.css               (copiar: app_globals.css)
├── components/
│   ├── AuthGuard.tsx             (copiar: components_AuthGuard.tsx)
│   ├── Footer.tsx                (copiar: components_Footer.tsx)
│   └── Header.tsx                (copiar: components_Header.tsx)
├── hooks/
│   └── useAuth.ts                (copiar: hooks_useAuth.ts)
├── lib/
│   └── supabase.ts               (copiar: lib_supabase.ts)
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
└── package.json
```

---

## Paso 4: Configurar Supabase

### 4.1 Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea cuenta
2. Crea un nuevo proyecto
3. Obtén las claves:
   - URL: `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key: `SUPABASE_SERVICE_ROLE_KEY`

### 4.2 Crear Tablas en Supabase

En la consola de Supabase, copia y ejecuta este SQL:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR NOT NULL,
  rol VARCHAR DEFAULT 'client',
  direccion TEXT,
  telefono VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos (para Fase 2)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  categoria VARCHAR,
  imagen_url VARCHAR,
  peso VARCHAR,
  disponible BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de órdenes (para Fase 4)
CREATE TABLE ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  estado VARCHAR DEFAULT 'pendiente',
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2),
  impuestos DECIMAL(10, 2),
  envio DECIMAL(10, 2),
  direccion_entrega TEXT NOT NULL,
  metodo_pago VARCHAR,
  referencia_pago VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de FAQs (para Fase 6)
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Habilitar Autenticación

1. Ve a **Authentication** > **Providers**
2. Habilita **Email/Password**
3. Ve a **Auth** > **Policies** y habilita Row Level Security (RLS)

---

## Paso 5: Crear Archivo .env.local

Crea `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Paso 6: Crear Usuarios Demo

En Supabase, ve a **Authentication** > **Users** > **Create user**:

**Usuario Demo - Cliente:**
- Email: `cliente@test.com`
- Password: `password123`

**Usuario Demo - Admin (opcional para Fase 2):**
- Email: `admin@test.com`
- Password: `password123`

Luego, en la tabla `users` agrega manualmente:
```sql
INSERT INTO users (id, email, nombre, rol)
SELECT id, email, 'Cliente Test', 'client'
FROM auth.users
WHERE email = 'cliente@test.com';
```

---

## Paso 7: Ejecutar el Proyecto

```bash
npm run dev
```

Abre http://localhost:3000

---

## ✅ Verificación Fase 1

Prueba estos flujos:

1. **Home** - ✅ Página de inicio con hero, features, productos destacados
2. **Register** - ✅ Crear nueva cuenta
3. **Login** - ✅ Iniciar sesión con `cliente@test.com` / `password123`
4. **Header Dinámico** - ✅ Cambiar entre vista anónimo y autenticado
5. **Logout** - ✅ Cerrar sesión
6. **Protección de Rutas** - ✅ Intenta acceder a `/perfil` sin autenticación (redirige a login)

---

## Próximas Fases

### Fase 2: Gestión de Productos (Admin)
- CRUD de productos
- Upload de imágenes
- Dashboard admin

### Fase 3: Catálogo & Vistas Cliente
- Página de catálogo completa
- Fichas de producto
- Búsqueda y filtros

### Fase 4: Carrito & Checkout
- Context del carrito
- Página de carrito
- Checkout

### Fase 5: Sistema de Pagos
- Integración Flow
- Webhook de pagos

### Fase 6: Órdenes & FAQs
- Historial de órdenes
- Sistema de FAQs

---

## Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "Supabase URL not set"
Verifica que `.env.local` exista y tenga las claves correctas

### Toast notifications no funcionan
Asegúrate de haber copiado correctamente el `layout.tsx` con `<Toaster />`

### Auth no funciona
1. Verifica que las claves de Supabase sean correctas
2. Comprueba que la tabla `users` esté creada
3. Revisa la consola de navegador para errores

---

## Archivos de Referencia

- **ARQUITECTURA_ECOMMERCE.md** - Diseño completo del sistema
- **SETUP_GUIA.md** - Esta guía
- Archivos de código de Fase 1 - Listos para copiar

¡Listo para comenzar! 🚀
