# 🔧 Configuración Git & GitHub - Frutas & Verduras

## 1️⃣ Configuración Inicial de GitHub

### Opción A: Personal Access Token (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Configura:
   - Name: `frutas-verduras-dev`
   - Expiration: 90 days (o más)
   - Scopes: ✅ repo (todos los permisos de repositorio)
4. Copia el token (úsalo como contraseña)

### Opción B: SSH (Avanzado)

```bash
ssh-keygen -t ed25519 -C "faldunate@gmail.com"
# Sigue las instrucciones y presiona Enter
cat ~/.ssh/id_ed25519.pub
# Copia la clave pública y agrégala en GitHub Settings → SSH and GPG keys
```

---

## 2️⃣ Configurar Git Localmente

### Primero

```bash
cd /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras
git config --global user.name "Felipe Aldunate"
git config --global user.email "faldunate@gmail.com"
```

### Con HTTPS (Personal Access Token)

```bash
# Cuando hagas push, usa el token como contraseña
git push origin main
# Username: tu_usuario_github
# Password: tu_personal_access_token
```

### Con SSH (Recomendado después)

```bash
# Ya debería estar configurado si hiciste ssh-keygen
git push origin main
# Sin pedir credenciales
```

---

## 3️⃣ Usar los Scripts de Automatización

### En macOS/Linux

```bash
# Dar permisos de ejecución
chmod +x git-sync.sh

# Ejecutar
./git-sync.sh
```

**Opciones:**
1. **Push** - Subir cambios (te pide mensaje)
2. **Pull** - Descargar cambios
3. **Ver estado** - Git status
4. **Sync** - Pull + Push automático
5. **Salir**

### En Windows

```bash
# Ejecutar directamente (no necesita permisos)
git-sync.bat
```

**Opciones:** (igual que en macOS)

---

## 4️⃣ Flujo de Trabajo Diario

### Opción 1: Script Automático (Recomendado)

```bash
# macOS/Linux
./git-sync.sh

# Windows
git-sync.bat
```

### Opción 2: Comandos Manuales

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Crear commit
git commit -m "📝 Descripción del cambio"

# Subir a GitHub
git push origin main

# Descargar cambios (si trabajas en múltiples máquinas)
git pull origin main
```

---

## 5️⃣ Convención de Mensajes de Commit

Usa emojis y sé descriptivo:

```
✨ Agregar nueva funcionalidad
🐛 Arreglar bug
📝 Actualizar documentación
🔧 Cambios de configuración
💄 Mejorar estilos
♻️  Refactorizar código
🚀 Deployar cambios
🎯 Fase 2: [descripción]
```

**Ejemplos:**
```bash
git commit -m "✨ Agregar autenticación con Supabase"
git commit -m "🐛 Arreglar validación de login"
git commit -m "📝 Actualizar README con instrucciones"
git commit -m "🚀 Fase 2: CRUD de productos completado"
```

---

## 6️⃣ Comandos Útiles Git

```bash
# Ver log de commits
git log --oneline

# Ver cambios no staged
git diff

# Ver cambios staged
git diff --cached

# Deshacer último commit (sin perder cambios)
git reset --soft HEAD~1

# Deshacer cambios en un archivo
git checkout -- archivo.tsx

# Ver ramas
git branch -a

# Cambiar de rama
git checkout nombre-rama

# Crear nueva rama
git checkout -b nombre-rama

# Eliminar rama local
git branch -d nombre-rama

# Sincronizar con remoto
git fetch origin
git merge origin/main
# O más simple:
git pull origin main
```

---

## 7️⃣ Troubleshooting

### Error: "fatal: unable to access repository"

**Solución:**
```bash
# Verificar URL remota
git remote -v

# Si es incorrecta, cambiar
git remote set-url origin https://github.com/faldunero/frutas_verduras.git
```

### Error: "fatal: 'main' does not appear to be a 'git' repository"

**Solución:**
```bash
# Verificar que estés en la carpeta correcta
pwd

# Debe ser: /Users/felipealdunate/Desktop/Desarrollo/frutas_verduras
```

### Error: "fatal: the current branch main has no upstream branch"

**Solución:**
```bash
# Primero hacer pull del remoto
git pull origin main

# O establecer rama por defecto
git branch -u origin/main
```

### Error: "fatal: Authentication failed"

**Solución:**
1. Verificar que el token de GitHub sea válido
2. En macOS, actualizar credenciales en Keychain:
   ```bash
   git credential-osxkeychain erase
   host=github.com
   # Presiona Control+D dos veces
   ```
3. Intentar push de nuevo

---

## 8️⃣ Workflow Recomendado

### Para Desarrollar Fase a Fase

```bash
# 1. Asegurarse de tener los últimos cambios
git pull origin main

# 2. Crear rama para la nueva fase
git checkout -b desarrollo/fase-2

# 3. Desarrollar y hacer commits frecuentes
git add .
git commit -m "🎯 Fase 2: Agregar CRUD de productos"

# 4. Subir cambios
git push origin desarrollo/fase-2

# 5. Hacer Pull Request en GitHub (crear merge)
# 6. Revisar y mergear a main
# 7. Volver a main
git checkout main
git pull origin main
```

---

## 9️⃣ Integración Continua (Opcional - Futuro)

Cuando estés en Fase 7, puedes agregar:

- **GitHub Actions** - Tests automáticos al hacer push
- **Deploy automático** - A Vercel en cada push
- **Linting automático** - Validar código antes de commit

---

## 🔟 Resumen Rápido

| Tarea | Comando |
|-------|---------|
| Ver estado | `git status` |
| Agregar todo | `git add .` |
| Commit | `git commit -m "mensaje"` |
| Subir | `git push origin main` |
| Descargar | `git pull origin main` |
| Ver log | `git log --oneline` |
| Usar script | `./git-sync.sh` (macOS/Linux) o `git-sync.bat` (Windows) |

---

**✨ ¡Listo para trabajar con Git! Usa los scripts para automatizar todo. 🚀**
