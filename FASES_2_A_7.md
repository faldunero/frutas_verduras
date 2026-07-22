# Fases 2-7: Desarrollo Completo del Ecommerce

## Fase 2: Gestión de Productos (Admin) 

**Duración estimada:** 3-4 días  
**Dependencias:** Fase 1 ✅

### Funcionalidades
- Dashboard admin con estadísticas
- CRUD completo de productos
- Upload de imágenes a Supabase Storage
- Filtros por categoría, stock, disponibilidad
- Búsqueda de productos

### Archivos a Crear
```
app/
├── (admin)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── productos/
│       ├── page.tsx
│       ├── nuevo/
│       │   └── page.tsx
│       └── [id]/
│           └── page.tsx
api/
├── productos/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── upload/
    └── route.ts
components/
├── ProductForm.tsx
├── ProductTable.tsx
└── AdminGuard.tsx
hooks/
└── useProductos.ts
```

### API Endpoints
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/[id]` - Actualizar
- `DELETE /api/productos/[id]` - Eliminar
- `POST /api/upload` - Subir imagen

### Base de Datos
Usar tabla `productos` ya creada en Fase 1

---

## Fase 3: Catálogo & Vistas Cliente

**Duración estimada:** 3-4 días  
**Dependencias:** Fase 2

### Funcionalidades
- Página de catálogo completa
- Filtros avanzados (precio, categoría, disponibilidad)
- Búsqueda con debounce
- Ordenamiento (precio, nombre, rating)
- Fichas de producto con detalles
- Galería de imágenes
- Información de envío y garantía

### Archivos a Crear
```
app/
├── (cliente)/
│   ├── catalogo/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── components/
│       ├── ProductCard.tsx
│       ├── ProductFilters.tsx
│       └── ProductGallery.tsx
hooks/
└── useProductos.ts
```

### Características Especiales
- SEO optimizado para fichas de producto
- Lazy loading de imágenes
- Reviews/ratings (opcional)
- Producto similares
- "Ver también"

---

## Fase 4: Carrito & Checkout

**Duración estimada:** 2-3 días  
**Dependencias:** Fase 3

### Funcionalidades
- Context del carrito con Zustand
- Persistencia en localStorage
- Página de carrito con edición
- Cálculo de impuestos
- Simulador de envío
- Checkout con formulario de entrega
- Resumen de orden

### Archivos a Crear
```
context/
└── CarritoContext.tsx
hooks/
└── useCarrito.ts
app/
└── (cliente)/
    ├── carrito/
    │   └── page.tsx
    └── checkout/
        └── page.tsx
components/
├── CarritoWidget.tsx
├── CarritoItems.tsx
├── CheckoutForm.tsx
└── OrderSummary.tsx
```

### Base de Datos (Opcional)
Crear tabla `carritos` para persistencia en BD:
```sql
CREATE TABLE carritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);
```

---

## Fase 5: Sistema de Pagos (Flow)

**Duración estimada:** 2-3 días  
**Dependencias:** Fase 4

### Funcionalidades
- Integración API Flow
- Transacciones seguras
- Webhook para confirmación de pago
- Email de confirmación
- Manejo de errores de pago
- Reintento automático

### Archivos a Crear
```
lib/
└── flow.ts (cliente Flow)
app/
└── api/
    ├── pago/
    │   └── flow/
    │       ├── route.ts (iniciar pago)
    │       └── webhook.ts (confirmación)
    └── email/
        └── confirmacion.ts
```

### Variables de Entorno
```
FLOW_API_KEY=xxx
FLOW_SECRET_KEY=xxx
FLOW_COMMERCE_ID=xxx
```

### Flujo de Pago
1. Usuario llena checkout
2. Envía orden a `/api/ordenes` (estado: "pendiente")
3. Crea transacción Flow en `/api/pago/flow`
4. Usuario redirigido a Flow (Webpay)
5. Después de pagar, Flow hace POST a webhook
6. Webhook actualiza orden (estado: "pagada")
7. Email de confirmación

---

## Fase 6: Órdenes & FAQs

**Duración estimada:** 2 días  
**Dependencias:** Fase 5

### Funcionalidades
- Historial de órdenes del cliente
- Estados de orden (pendiente, pagada, enviada, entregada)
- Rastreo de orden
- Gestión de órdenes en admin
- Sistema de FAQs completo
- Búsqueda en FAQs
- Panel de FAQs para admin

### Archivos a Crear
```
app/
├── (cliente)/
│   └── ordenes/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
├── (admin)/
│   └── ordenes/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
└── faqs/
    └── page.tsx
components/
├── OrderCard.tsx
├── OrderTimeline.tsx
├── FAQAccordion.tsx
└── FAQAdmin.tsx
hooks/
├── useOrdenes.ts
└── useFAQs.ts
```

### API Endpoints
- `GET /api/ordenes` - Mis órdenes
- `GET /api/ordenes/[id]` - Detalle orden
- `PUT /api/ordenes/[id]` - Actualizar estado (admin)
- `GET /api/faqs` - Listar FAQs
- `POST /api/faqs` - Crear FAQ (admin)
- `PUT /api/faqs/[id]` - Editar FAQ (admin)
- `DELETE /api/faqs/[id]` - Eliminar FAQ (admin)

---

## Fase 7: Mejoras & Producción

**Duración estimada:** 2-3 días  
**Dependencias:** Fase 6

### Testing
- Jest + React Testing Library
- Tests unitarios de componentes
- Tests de integración de API
- Cobertura >80%

### SEO & Performance
- Meta tags dinámicos
- Open Graph (og:image, og:title, etc)
- Sitemap.xml
- robots.txt
- Image optimization con Next.js Image
- Code splitting automático
- Cache de imágenes en Supabase

### Seguridad
- CORS configurado
- Rate limiting en APIs
- Validación de input en servidor
- Sanitización de HTML
- CSRF tokens
- Headers de seguridad

### Deployment (Vercel)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Archivos a Crear
```
jest.config.js
jest.setup.js
__tests__/
├── components/
├── hooks/
└── api/
public/
├── sitemap.xml
├── robots.txt
└── .well-known/
```

### Checklist Pre-Producción
- [ ] Variables de entorno en Vercel
- [ ] Email confirmación configurado
- [ ] Flow conectado en producción
- [ ] Supabase en modo seguro (CORS)
- [ ] Backups automáticos Supabase
- [ ] Logs de errores (Sentry o similar)
- [ ] Tests ejecutándose
- [ ] Performance Audit (Lighthouse >90)
- [ ] SEO verificado

---

## Timeline Total

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 1 | 1-2 días | 1-2 días |
| 2 | 3-4 días | 4-6 días |
| 3 | 3-4 días | 7-10 días |
| 4 | 2-3 días | 9-13 días |
| 5 | 2-3 días | 11-16 días |
| 6 | 2 días | 13-18 días |
| 7 | 2-3 días | 15-21 días |

**Total: 3-4 semanas de desarrollo**

---

## Prioridades

**MVP (Mínimo Viable):** Fases 1-5
- Autenticación
- Gestión de productos
- Catálogo
- Carrito
- Pagos

**Completo:** Fases 1-7
- Todo lo anterior +
- Órdenes
- FAQs
- Testing
- Producción-ready

---

## Notas Importantes

1. **Supabase**: Usa Row Level Security (RLS) en producción
2. **Flow**: Requiere cuenta comerciante aprobada
3. **Email**: Implementar con SendGrid, Resend o similar en Fase 5
4. **Imagenes**: Comprimir antes de subir a Storage
5. **Pagos**: Testear en ambiente sandbox de Flow primero
6. **Database**: Hacer backups regulares de Supabase

---

## Soporte & Debugging

### Logs
- Cliente: Vercel Analytics
- Server: Vercel Function logs
- Base de datos: Supabase logs

### Monitoreo
- Sentry para errores
- Vercel Analytics para performance
- Google Analytics para conversión

---

## Próximas Mejoras (Post-MVP)

- Reseñas de productos
- Sistema de cupones/descuentos
- Wishlist de usuarios
- Notificaciones por email
- Chat support
- Integración redes sociales
- App móvil (React Native)
- Marketplace multi-vendedor
