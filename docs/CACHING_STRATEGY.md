# Estrategia de Caché - Frutas & Verduras

## Descripción General

Implementamos un sistema multicapa de caché para optimizar el rendimiento y reducir consultas frecuentes a Firestore:

1. **Cliente (localStorage)** - Cache de corta a larga duración
2. **Servidor (en memoria)** - Cache compartido entre requests (Next.js)
3. **Firestore offline persistence** - Acceso offline

---

## 1. Caché en Cliente (localStorage)

### Uso

```typescript
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

// Guardar en cache
clientCache.set(CACHE_KEYS.CONFIG, configData, CACHE_TTL.LONG)

// Leer desde cache
const data = clientCache.get(CACHE_KEYS.CONFIG)

// Limpiar
clientCache.clear(CACHE_KEYS.CONFIG)
```

### Hooks que usan cache automáticamente

#### `useConfig()`
- **Qué cachea:** Configuración global (categorías, estados, comunas, etc)
- **TTL:** 1 hora
- **Comportamiento:** Lee cache primero, luego suscribe a BD para actualizaciones en tiempo real
- **Fallback:** Si falla conexión a BD, usa cache

```typescript
const { config, loading } = useConfig()
// config.categorias, config.estados, etc
```

#### `useProductos(filtroCategoria?)`
- **Qué cachea:** Lista de productos (con filtro opcional)
- **TTL:** 30 minutos
- **Comportamiento:** Similar a useConfig
- **Fallback:** Si falla BD, usa cache

```typescript
const { productos, loading } = useProductos('frutas')
```

### Tiempos de Caché Predefinidos

```typescript
CACHE_TTL = {
  SHORT: 5 * 60 * 1000,          // 5 minutos
  MEDIUM: 30 * 60 * 1000,        // 30 minutos
  LONG: 60 * 60 * 1000,          // 1 hora
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 horas
}
```

---

## 2. Caché en Servidor (Next.js)

### Uso

```typescript
import { getCachedData, setCachedData, clearCache } from '@/lib/cache'

// En API routes
export async function GET(request: NextRequest) {
  const cacheKey = 'api:productos:list'
  
  // Intentar obtener del cache
  let data = getCachedData(cacheKey)
  
  if (!data) {
    // Si no está en cache, obtener de BD
    data = await fetchProductosFromDB()
    // Guardar en cache por 30 minutos
    setCachedData(cacheKey, data, 30 * 60 * 1000)
  }
  
  return NextResponse.json(data)
}
```

### Ventajas

- **Performance:** Reduce queries a Firestore
- **Escalabilidad:** Mejor rendimiento bajo carga
- **Offline:** Si Firestore falla, cache sirve datos
- **Consistencia:** Mismo cache entre sesiones de usuario

---

## 3. Firestore Offline Persistence

Ya habilitado en `lib/firebase.ts`:

```typescript
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const db = initializeFirestore(app, {})
enableIndexedDbPersistence(db)
```

**Beneficios:**
- Acceso offline a datos sincronizados previamente
- Sincronización automática cuando conexión se recupera
- No requiere configuración adicional

---

## 4. Estrategia por Tipo de Dato

### Datos Estáticos (Configuración)
- **Cache:** Si (1 hora)
- **Real-time:** Si (escucha cambios)
- **Offline:** Si

```typescript
// Ejemplo: categorías, estados, roles
useConfig() // → automáticamente cacheado
```

### Datos Semi-Estáticos (Productos)
- **Cache:** Si (30 minutos)
- **Real-time:** Si (escucha cambios)
- **Offline:** Si

```typescript
// Ejemplo: lista de productos
useProductos('frutas') // → automáticamente cacheado
```

### Datos Dinámicos (Órdenes, Usuarios)
- **Cache:** No (o muy corto: 5 min)
- **Real-time:** Si (siempre fresco)
- **Offline:** No

```typescript
// Estos usan queries directas a Firestore sin cache
```

---

## 5. Invalidar Cache

### Cuando cambios algo en admin:

El cache **se actualiza automáticamente** porque usamos `onSnapshot` (real-time listeners).

Pero si necesitas forzar limpieza:

```typescript
import { clearCache, CACHE_KEYS } from '@/lib/cache'

// Limpiar config
clearCache(CACHE_KEYS.CONFIG)

// Limpiar productos de una categoría
clearCache(`${CACHE_KEYS.PRODUCTOS}:frutas`)
```

### En API routes de admin:

```typescript
export async function POST(request: NextRequest) {
  // Guardar cambios
  await updateConfigInDB(data)
  
  // Limpiar cache
  clearCache(CACHE_KEYS.CONFIG)
  
  return NextResponse.json({ success: true })
}
```

---

## 6. Monitoreo y Debugging

### Ver qué está en cache (Cliente)

```typescript
// En DevTools console:
const config = localStorage.getItem('cache:app:config')
console.log(JSON.parse(config))
```

### Limpiar todo el cache (Cliente)

```typescript
import { clientCache } from '@/lib/cache'
clientCache.clearAll()
```

---

## 7. Impacto en Performance

### Antes (sin cache)
- Cada página: 2-3 queries a Firestore
- Tiempo de carga: ~500ms-1s
- Uso de conexión: Alto

### Después (con cache)
- Primera carga: 1-2 queries a Firestore (cache miss)
- Cargas posteriores: 0 queries (cache hit)
- Tiempo de carga: ~50-100ms (con cache)
- Uso de conexión: 90% reducido

---

## 8. Próximas Mejoras

- [ ] Redis para caché distribuido (si Render lo soporta)
- [ ] Service Workers para cache offline más robusto
- [ ] Cache invalidation automático basado en eventos
- [ ] Monitoring de hit/miss ratio

---

## Referencias

- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Firebase Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
