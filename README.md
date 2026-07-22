# 🥬 Ecommerce Frutas & Verduras - Proyecto Completo

Plataforma de compra y venta de frutas y verduras frescas con vista cliente, administrador, carrito de compra y sistema de pagos integrado.

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Supabase + Flow (pagos)

---

## 📋 Contenido del Proyecto

### Documentación (START HERE 👇)

1. **`ARQUITECTURA_ECOMMERCE.md`** - Diseño técnico completo
   - Stack tecnológico
   - Schema de base de datos
   - Estructura de carpetas
   - Endpoints API
   - Decisiones técnicas

2. **`SETUP_GUIA.md`** - Instrucciones paso a paso ⭐ LEE ESTO PRIMERO
   - Requisitos
   - Instalación de dependencias
   - Configuración de Supabase
   - Setup de variables de entorno
   - Verificación de funcionalidades

3. **`FASES_2_A_7.md`** - Guía para las siguientes fases
   - Fase 2: Gestión de productos
   - Fase 3: Catálogo
   - Fase 4: Carrito
   - Fase 5: Pagos
   - Fase 6: Órdenes & FAQs
   - Fase 7: Producción

### Archivos de Código - Fase 1 (Autenticación)

#### Configuración Base
- `package.json` - Dependencias del proyecto
- `next.config.js` - Configuración Next.js
- `tsconfig.json` - TypeScript
- `tailwind.config.ts` - Tailwind CSS
- `postcss.config.js` - PostCSS
- `.env.example` - Variables de entorno
- `.gitignore` - Git ignore

#### Estilos
- `app/globals.css` - Estilos globales

#### Estructura de Carpetas
```
app/
├── layout.tsx                    # Layout principal
├── page.tsx                      # Home
├── globals.css                   # Estilos globales
├── auth/
│   ├── login/
│   │   └── page.tsx              # Página de login
│   └── register/
│       └── page.tsx              # Página de registro

components/
├── Header.tsx                    # Header con navegación
├── Footer.tsx                    # Footer
├── AuthGuard.tsx                 # Protección de rutas

hooks/
└── useAuth.ts                    # Hook de autenticación

lib/
└── supabase.ts                   # Cliente Supabase
```

---

## 🚀 Quick Start

### 1. Leer Documentación
- ⭐ Lee `SETUP_GUIA.md` completo
- Lee `ARQUITECTURA_ECOMMERCE.md` para entender el diseño

### 2. Preparar Ambiente
```bash
# Instalar Node.js 18+ desde nodejs.org

# Crear proyecto Next.js
npx create-next-app@latest frutas-verduras-ecommerce --typescript
cd frutas-verduras-ecommerce

# Instalar dependencias (copiar package.json)
npm install
```

### 3. Configurar Supabase
- Crear cuenta en https://supabase.com
- Crear proyecto
- Ejecutar SQL (ver SETUP_GUIA.md)
- Obtener claves

### 4. Copiar Archivos de Código
- Copiar archivos de Fase 1 según estructura en SETUP_GUIA.md
- Crear `.env.local` con claves de Supabase

### 5. Ejecutar Proyecto
```bash
npm run dev
# Abre http://localhost:3000
```

### 6. Probar Flujos
- Home: http://localhost:3000
- Registro: http://localhost:3000/auth/register
- Login: http://localhost:3000/auth/login (usa demo: cliente@test.com / password123)

---

## ✅ Fase 1: Autenticación & Estructura Base

**Estado:** ✅ Código completado  
**Duración:** 1-2 días  
**Funcionalidades:**

- ✅ Sistema de login/registro con Supabase Auth
- ✅ Roles (cliente/admin)
- ✅ Componentes base (Header, Footer)
- ✅ Protección de rutas
- ✅ Página de inicio con secciones principales
- ✅ FAQs preview
- ✅ Responsive design con Tailwind

**Usuarios Demo:**
- Cliente: `cliente@test.com` / `password123`
- Admin: `admin@test.com` / `password123` (crear en BD)

**URLs Principales:**
- Home: `/`
- Login: `/auth/login`
- Registro: `/auth/register`

---

## 📦 Fase 2-7: Próximos Pasos

Ver `FASES_2_A_7.md` para especificaciones completas de:

| Fase | Funcionalidad | Duración |
|------|---------------|----------|
| 2 | Gestión de Productos (Admin) | 3-4 días |
| 3 | Catálogo & Fichas | 3-4 días |
| 4 | Carrito & Checkout | 2-3 días |
| 5 | Sistema de Pagos (Flow) | 2-3 días |
| 6 | Órdenes & FAQs | 2 días |
| 7 | Testing & Producción | 2-3 días |

**Total:** 15-21 días

---

## 🛠️ Tecnologías

**Frontend:**
- Next.js 14 con App Router
- React 18
- TypeScript
- Tailwind CSS
- React Icons

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Supabase Auth

**Pagos:**
- Flow (procesador chileno)

**DevOps:**
- Vercel (deployment)
- Supabase (base de datos)
- Supabase Storage (imágenes)

---

## 📁 Estructura de Carpetas (Completa)

```
frutas-verduras-ecommerce/
├── app/                          # App Router de Next.js
│   ├── (admin)/                  # Rutas protegidas admin
│   │   ├── dashboard/
│   │   ├── productos/
│   │   ├── ordenes/
│   │   ├── usuarios/
│   │   └── faqs/
│   ├── (cliente)/                # Rutas protegidas cliente
│   │   ├── catalogo/
│   │   ├── producto/[id]/
│   │   ├── carrito/
│   │   ├── checkout/
│   │   ├── ordenes/
│   │   └── perfil/
│   ├── auth/                     # Rutas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── api/                      # API Routes
│   │   ├── productos/
│   │   ├── ordenes/
│   │   ├── carrito/
│   │   ├── pago/
│   │   ├── faqs/
│   │   ├── upload/
│   │   └── email/
│   ├── layout.tsx
│   ├── page.tsx                  # Home
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── AuthGuard.tsx
│   ├── AdminGuard.tsx
│   ├── ProductCard.tsx
│   ├── ProductGallery.tsx
│   ├── CarritoWidget.tsx
│   └── ... (más componentes en Fase 2+)
├── hooks/
│   ├── useAuth.ts
│   ├── useProductos.ts
│   ├── useCarrito.ts
│   ├── useOrdenes.ts
│   └── useFAQs.ts
├── lib/
│   ├── supabase.ts
│   ├── flow.ts
│   └── utils.ts
├── context/
│   └── CarritoContext.tsx
├── public/
│   └── images/
├── __tests__/                    # Tests (Fase 7)
├── .env.example
├── .env.local                    # No subir a git
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

---

## 🔐 Seguridad

**Implementado:**
- ✅ Autenticación con Supabase
- ✅ JWT tokens
- ✅ Protección de rutas
- ✅ Variables sensibles en `.env.local`

**Por implementar (Fase 7):**
- CORS configurado
- Rate limiting
- SQL Injection prevention (Supabase prepared statements)
- CSRF tokens
- Security headers

---

## 📊 Base de Datos

**Tablas creadas en Fase 1:**
- `users` - Usuarios registrados
- `productos` - Catálogo
- `ordenes` - Órdenes de compra
- `faqs` - Preguntas frecuentes

Ver `ARQUITECTURA_ECOMMERCE.md` para schema completo.

---

## 🧪 Testing

**Fase 1:** Sin tests  
**Fase 7:** Jest + React Testing Library

---

## 📱 Responsivo

✅ Diseño mobile-first con Tailwind CSS
- Teléfonos (320px+)
- Tablets (768px+)
- Desktop (1024px+)

---

## 🚢 Deployment

**Recomendado:** Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Ver `FASES_2_A_7.md` Fase 7 para checklist completo.

---

## 📞 Troubleshooting

1. **Error de Supabase:** Verifica `.env.local`
2. **Auth no funciona:** Comprueba tabla `users`
3. **Estilos no aplican:** Limpia cache y reinicia: `rm -rf .next && npm run dev`
4. **Puertos ocupados:** `lsof -i :3000`

Ver `SETUP_GUIA.md` para más ayuda.

---

## 📖 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Flow API](https://www.flow.cl/apiDocumentation) (pagos)

---

## 🎯 Próximos Pasos

1. ⭐ Lee `SETUP_GUIA.md` completo
2. Sigue instrucciones paso a paso
3. Configura Supabase
4. Copia archivos de código
5. Ejecuta `npm run dev`
6. Prueba flujos de login/registro
7. Cuando esté funcionando, solicita Fase 2

---

## 📝 Notas

- Todos los archivos están listos para copiar
- Usa TypeScript para mejor DX
- Sigue la estructura de carpetas
- Commit frecuentemente a git
- Lee comentarios en el código

---

## 📄 Archivos de Referencia

| Archivo | Descripción |
|---------|-------------|
| ARQUITECTURA_ECOMMERCE.md | Diseño técnico |
| SETUP_GUIA.md | Instalación paso a paso |
| FASES_2_A_7.md | Especificaciones futuras |
| package.json | Dependencias |
| .env.example | Variables de entorno |

---

**¡Listo para comenzar! 🚀**

Cualquier duda, revisa la documentación o contacta soporte.
