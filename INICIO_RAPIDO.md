# ⚡ Inicio Rápido - Frutas & Verduras Ecommerce

## 📦 ¿Qué tienes?

✅ **Proyecto Fase 1 completo** en `/Users/felipealdunate/Desktop/Desarrollo/frutas_verduras/`
✅ **22 archivos listos** para comenzar
✅ **Git configurado** localmente
✅ **Scripts de automatización** para Git
✅ **Documentación completa**

---

## 🚀 Pasos Iniciales

### 1️⃣ Configurar GitHub (5 minutos)

```bash
# Leer la guía
cat GIT_SETUP.md

# O seguir estos pasos:
1. Ve a https://github.com/settings/tokens
2. Crea un Personal Access Token (cópialo)
3. Configura Git:
   git config --global user.name "Felipe Aldunate"
   git config --global user.email "faldunate@gmail.com"
```

### 2️⃣ Hacer el Primer Push

```bash
cd /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras

# En macOS/Linux
./git-sync.sh
# Selecciona opción 1 (Push)
# Escribe un mensaje como: "🚀 Fase 1 completada"

# En Windows
git-sync.bat
# Selecciona opción 1
```

**Te pedirá:**
- Username: tu usuario de GitHub
- Password: el Personal Access Token que copiaste

### 3️⃣ Instalar Dependencias

```bash
cd /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras
npm install
```

### 4️⃣ Configurar Supabase

```bash
# Lee la guía de setup
cat SETUP_GUIA.md

# Crea .env.local con tus claves de Supabase
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### 5️⃣ Ejecutar Proyecto

```bash
npm run dev
# Abre http://localhost:3000
```

---

## 🤖 Usar Scripts de Automatización

### macOS/Linux

```bash
# Hacer push (subir cambios)
./git-sync.sh
# Selecciona 1

# Hacer pull (descargar cambios)
./git-sync.sh
# Selecciona 2

# Ver estado
./git-sync.sh
# Selecciona 3

# Sync completo (pull + push)
./git-sync.sh
# Selecciona 4
```

### Windows

```bash
# Hacer push
git-sync.bat
# Selecciona 1

# Hacer pull
git-sync.bat
# Selecciona 2

# Etc...
```

---

## 📁 Estructura del Proyecto

```
frutas_verduras/
├── 📚 Documentación
│   ├── README.md (visión general)
│   ├── SETUP_GUIA.md (instalación detallada)
│   ├── ARQUITECTURA_ECOMMERCE.md (diseño técnico)
│   ├── FASES_2_A_7.md (próximas fases)
│   ├── GIT_SETUP.md (configuración Git)
│   └── INICIO_RAPIDO.md (este archivo)
│
├── ⚙️ Configuración
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.example
│
├── 🎯 Código Fase 1
│   ├── app/
│   │   ├── page.tsx (home)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AuthGuard.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── lib/
│       └── supabase.ts
│
└── 🤖 Scripts
    ├── git-sync.sh (macOS/Linux)
    └── git-sync.bat (Windows)
```

---

## ✅ Checklist de Setup

- [ ] Leer README.md
- [ ] Leer SETUP_GUIA.md
- [ ] Crear Personal Access Token en GitHub
- [ ] Configurar Git globalmente
- [ ] Hacer primer push con `./git-sync.sh`
- [ ] Instalar dependencias: `npm install`
- [ ] Crear Supabase account
- [ ] Crear `.env.local` con claves Supabase
- [ ] Ejecutar `npm run dev`
- [ ] Probar login en http://localhost:3000

---

## 🧪 Probar la Aplicación

1. Abre http://localhost:3000
2. Verás:
   - ✅ Hero section con descripción
   - ✅ Features (3 tarjetas)
   - ✅ Productos destacados (placeholders)
   - ✅ CTA section
   - ✅ FAQs preview
3. Botones de Login/Registro en Header
4. Crea una cuenta de prueba
5. Inicia sesión con demo: `cliente@test.com` / `password123`

---

## 📞 Problemas Comunes

### Error: "npm: command not found"
→ Instala Node.js desde nodejs.org

### Error: "fatal: unable to access repository"
→ Lee GIT_SETUP.md sección "Troubleshooting"

### Error: "Supabase URL not set"
→ Crea `.env.local` con las claves correctas

### Estilos no se aplican
```bash
rm -rf .next
npm run dev
```

---

## 🎯 Próximos Pasos Después de Fase 1

1. Leer **FASES_2_A_7.md**
2. Comenzar **Fase 2: Gestión de Productos (Admin)**
3. Usar scripts de Git para mantener sincronizado
4. Hacer commits frecuentes con mensajes descriptivos

---

## 📊 Estado del Proyecto

| Fase | Estado | Duración |
|------|--------|----------|
| 1: Auth & Estructura | ✅ Completo | 1-2 días |
| 2: Gestión de Productos | ⏳ Pendiente | 3-4 días |
| 3: Catálogo & Fichas | ⏳ Pendiente | 3-4 días |
| 4: Carrito & Checkout | ⏳ Pendiente | 2-3 días |
| 5: Sistema de Pagos | ⏳ Pendiente | 2-3 días |
| 6: Órdenes & FAQs | ⏳ Pendiente | 2 días |
| 7: Testing & Producción | ⏳ Pendiente | 2-3 días |

**Total:** 15-21 días (3-4 semanas)

---

## 🚀 Let's Go!

```bash
# Resumen de comandos iniciales
cd /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras
npm install
cp .env.example .env.local
# (editar .env.local con claves Supabase)
npm run dev
# Abre http://localhost:3000
```

**¡Listo para comenzar! 🎉**

Para cualquier duda, revisa la documentación:
- README.md → Visión general
- SETUP_GUIA.md → Instalación detallada
- ARQUITECTURA_ECOMMERCE.md → Diseño técnico
- GIT_SETUP.md → Configuración Git
