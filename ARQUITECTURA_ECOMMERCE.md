# Arquitectura - Ecommerce Frutas & Verduras

## Stack Tecnológico

**Frontend**: Next.js 14 + TypeScript + Tailwind CSS  
**Backend**: API Routes de Next.js  
**BD**: Supabase (PostgreSQL)  
**Autenticación**: Supabase Auth  
**Pagos**: Flow (procesador chileno, más económico)  
**Almacenamiento**: Supabase Storage (imágenes de productos)

---

## Base de Datos - Schema Supabase

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR NOT NULL,
  rol VARCHAR DEFAULT 'client' -- 'client' | 'admin'
  direccion TEXT,
  telefono VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  categoria VARCHAR, -- 'frutas' | 'verduras' | etc
  imagen_url VARCHAR,
  peso VARCHAR, -- ej: "1kg", "500g"
  disponible BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  estado VARCHAR DEFAULT 'pendiente', -- 'pendiente' | 'pagada' | 'enviada' | 'entregada'
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

-- Tabla de items en órdenes
CREATE TABLE orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de FAQs
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para carritos (opcional, para persistencia)
CREATE TABLE carritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);
```

---

## Estructura del Proyecto

```
frutas-verduras-ecommerce/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Home
│   ├── (cliente)/
│   │   ├── catalogo/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Ficha de producto
│   │   ├── carrito/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── ordenes/
│   │   │   └── page.tsx        # Mis órdenes
│   │   └── perfil/
│   │       └── page.tsx
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── productos/
│   │   │   ├── page.tsx        # Lista productos
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Editar producto
│   │   ├── ordenes/
│   │   │   └── page.tsx
│   │   ├── faqs/
│   │   │   └── page.tsx
│   │   └── usuarios/
│   │       └── page.tsx
│   ├── api/
│   │   ├── productos/
│   │   │   ├── route.ts        # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET, PUT, DELETE
│   │   ├── ordenes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── carrito/
│   │   │   └── route.ts
│   │   ├── pago/
│   │   │   └── flow/
│   │   │       ├── route.ts    # Iniciar pago
│   │   │       └── webhook.ts  # Confirmación pago
│   │   ├── faqs/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts        # Upload imágenes
│   └── auth/
│       ├── login/
│       │   └── page.tsx
│       ├── registro/
│       │   └── page.tsx
│       └── callback/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CarritoWidget.tsx
│   ├── Navbar.tsx
│   ├── AuthGuard.tsx
│   └── AdminGuard.tsx
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── flow.ts                 # Integración Flow
│   └── utils.ts
├── context/
│   └── CarritoContext.tsx      # Context del carrito
├── hooks/
│   ├── useCarrito.ts
│   ├── useProductos.ts
│   └── useAuth.ts
├── public/
│   └── images/
├── .env.local
└── package.json
```

---

## Fases de Desarrollo

### **Fase 1: Autenticación & Estructura Base**
- Setup inicial de Next.js + Supabase
- Sistema de login/registro
- Autenticación cliente/admin
- Componentes base (Header, Footer, Navbar)

### **Fase 2: Gestión de Productos (Admin)**
- CRUD de productos en admin
- Upload de imágenes a Supabase Storage
- Dashboard admin con estadísticas
- Filtros por categoría y stock

### **Fase 3: Catálogo & Vistas Cliente**
- Página de inicio con productos destacados
- Catálogo con buscador y ordenamiento
- Fichas de producto completas
- Sistema de ratings (opcional)

### **Fase 4: Carrito & Checkout**
- Context de carrito (persistente en localStorage)
- Página de carrito
- Checkout con formulario de entrega
- Cálculo de impuestos y envío

### **Fase 5: Sistema de Pagos (Flow)**
- Integración Flow API
- Flujo de pago seguro
- Webhook para confirmación
- Email de confirmación

### **Fase 6: Órdenes & FAQs**
- Historial de órdenes del cliente
- Gestión de órdenes en admin
- Sistema de FAQs
- Búsqueda en FAQs

### **Fase 7: Mejoras & Producción**
- Testing (Jest + React Testing Library)
- SEO optimizaciones
- Performance (Image optimization, etc)
- Deployment (Vercel)

---

## Variables de Entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

SUPABASE_SERVICE_ROLE_KEY=xxx

FLOW_API_KEY=xxx
FLOW_SECRET_KEY=xxx
FLOW_COMMERCE_ID=xxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| POST | `/api/productos` | Crear producto (admin) |
| GET | `/api/productos/[id]` | Obtener detalles producto |
| PUT | `/api/productos/[id]` | Actualizar producto (admin) |
| DELETE | `/api/productos/[id]` | Eliminar producto (admin) |
| GET | `/api/ordenes` | Listar órdenes del usuario |
| POST | `/api/ordenes` | Crear orden |
| PUT | `/api/ordenes/[id]` | Actualizar estado orden (admin) |
| POST | `/api/pago/flow` | Iniciar transacción Flow |
| POST | `/api/pago/flow/webhook` | Webhook de confirmación |
| GET | `/api/faqs` | Listar FAQs |
| POST | `/api/upload` | Subir imagen a Storage |

---

## Decisiones Técnicas

1. **Next.js**: SSR para mejor SEO, API routes integradas, excelente para ecommerce
2. **Supabase**: PostgreSQL real, auth incorporada, storage para imágenes, pricing justo
3. **Flow**: Procesador chileno, comisiones bajas (~2-3%), integración simple
4. **Tailwind**: Estilos rápidos y consistentes
5. **React Context + localStorage**: Carrito sin necesidad de backend pesado
6. **Supabase Auth**: Token JWT, mejor que JWT manual

---

## Seguridad

- ✅ SQL Injection: Prepared statements (Supabase)
- ✅ Auth: Row Level Security (RLS) en Supabase
- ✅ Pagos: Nunca manejar directamente tarjetas (delegar a Flow)
- ✅ Uploads: Validación de tipo y tamaño en servidor
- ✅ HTTPS: Obligatorio en producción
- ✅ CORS: Configurado solo para dominio propio
