# Índices de Firestore - Orden de Implementación

## 🎯 Orden de Prioridad

Crea en este orden (más importantes primero):

---

## 1️⃣ CRÍTICO - Órdenes por Fecha

**Colección:** `ordenes`
**Campos:**
- `createdAt` - **Descending** (más nuevos primero)
- `estado` - **Ascending** (para filtrar)

**Por qué:** La página de Cuadratura ordena por fecha. Sin esto, es lenta.

**Pasos:**
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Selecciona colección: `ordenes`
4. Añade campo 1:
   - Field: `createdAt`
   - Order: `Descending`
5. Añade campo 2:
   - Field: `estado`
   - Order: `Ascending`
6. Click **Create Index**
7. Espera ~5 minutos a que se cree ✅

---

## 2️⃣ IMPORTANTE - Productos Disponibles

**Colección:** `productos`
**Campos:**
- `categoria` - **Ascending**
- `disponible` - **Ascending**

**Por qué:** Filtras por categoría Y disponibilidad en el catálogo.

**Pasos:**
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Selecciona colección: `productos`
4. Añade campo 1:
   - Field: `categoria`
   - Order: `Ascending`
5. Añade campo 2:
   - Field: `disponible`
   - Order: `Ascending`
6. Click **Create Index**
7. Espera confirmación ✅

---

## 3️⃣ IMPORTANTE - Productos Destacados

**Colección:** `productos`
**Campos:**
- `destacado` - **Descending**
- `disponible` - **Ascending**

**Por qué:** Para mostrar productos destacados primero.

**Pasos:**
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Selecciona colección: `productos`
4. Añade campo 1:
   - Field: `destacado`
   - Order: `Descending`
5. Añade campo 2:
   - Field: `disponible`
   - Order: `Ascending`
6. Click **Create Index**
7. Espera confirmación ✅

---

## 4️⃣ NORMAL - Usuarios por Email

**Colección:** `users`
**Campos:**
- `email` - **Ascending**

**Por qué:** Para búsquedas rápidas de usuarios por email.

**Pasos:**
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Selecciona colección: `users`
4. Añade campo 1:
   - Field: `email`
   - Order: `Ascending`
5. Click **Create Index**
6. Espera confirmación ✅

---

## 5️⃣ NORMAL - Usuarios por Fecha

**Colección:** `users`
**Campos:**
- `createdAt` - **Descending**

**Por qué:** Para listar usuarios nuevos primero.

**Pasos:**
1. Firebase Console → Firestore Database → **Indexes**
2. Click **Create Index**
3. Selecciona colección: `users`
4. Añade campo 1:
   - Field: `createdAt`
   - Order: `Descending`
5. Click **Create Index**
6. Espera confirmación ✅

---

## 📊 Resumen

| # | Colección | Campos | Prioridad | Status |
|---|-----------|--------|-----------|--------|
| 1 | ordenes | createdAt↓, estado↑ | 🔴 Crítico | ⏳ |
| 2 | productos | categoria↑, disponible↑ | 🟡 Important | ⏳ |
| 3 | productos | destacado↓, disponible↑ | 🟡 Important | ⏳ |
| 4 | users | email↑ | 🟢 Normal | ⏳ |
| 5 | users | createdAt↓ | 🟢 Normal | ⏳ |

---

## ✅ Verificación

Después de crear todos:

1. Vuelve a Firestore Database → **Indexes**
2. Deberías ver 5 índices en **Enabled** ✅
3. La app será 10x más rápida 🚀

---

## 🔍 Si algo falla

Si ves errores de índices en consola del navegador, significa que falta crear uno. Firebase automaticamente te dirá cuál crear.

Copiar el mensaje de error y crear el índice sugerido en Firebase Console.

---

## 📝 Notas

- Los índices tardan 5-10 minutos en crearse
- No afectan el funcionamiento, solo la velocidad
- Son gratis dentro del plan de Firestore
- Puedes tener múltiples índices por colección

**Comienza con el #1 (órdenes). Es el más crítico.**
