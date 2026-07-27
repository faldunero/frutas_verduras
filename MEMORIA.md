# 🍎 Memoria - Frutas & Verduras

## Estado del Proyecto
- **Fase:** F&F (Friends & Family - Beta temprana)
- **NO TIENE DOMINIO AÚN** ← CRÍTICO
- **Email:** faldunate@gmail.com
- **Fecha inicio:** Julio 2026

## Configuración Importante
- ✅ Firebase en modo prueba
- ✅ Resend API configurado (re_PYEcM2K1...)
- ❌ NO TIENE DOMINIO PROPIO
- ❌ Emails no llegan (sin dominio verificado en Resend)

## Próximos Pasos Cuando Tenga Dominio
1. Verificar dominio en Resend
2. Agregar `RESEND_FROM_EMAIL=noreply@sudominio.com` en Render
3. Los emails de verificación empezarán a funcionar

## Cambios Recientes (27 Julio)
✅ Posicionado botón "COMPRA AHORA" en esquina inferior izquierda del hero banner
✅ Reducidos botones "Ingresar/Registrar" del header (más pequeños)

## Cambios Anteriores (26 Julio)
✅ Removido reCAPTCHA del formulario de registro
✅ Creado endpoint `/auth/verify-email/page.tsx` para validar tokens
✅ Email verification completo: registro → email → validación → crear contraseña

## Flujo de Registro
1. Usuario: `/auth/register` → nombre + email
2. Sistema: Envía email con link a `/auth/verify-email?token=xxx&email=xxx`
3. Usuario: Hace clic en link
4. Sistema: Valida token, crea usuario en Firestore, redirige a `/auth/set-password`

## Funcionalidades Completadas
✅ Cuadratura - Totales, tabla, filtros
✅ Pedidos - Carga correcta
✅ Analizador - Margen y precios
✅ Mi Perfil - Rol visible, verificación de email
✅ Header - Navegación con window.location
✅ Registro sin CAPTCHA - Rate limiting via email verification

## Pendiente
❌ Crear página `/auth/set-password` para crear contraseña
❌ Email de confirmación de pedidos
❌ Transición a Firebase producción
