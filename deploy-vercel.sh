#!/bin/bash

# Deploy Frutas & Verduras a Vercel
# Este script conecta tu proyecto a Vercel y lo despliega en el plan gratis

echo "🚀 Iniciando deploy a Vercel..."
echo ""
echo "Paso 1: Instalar Vercel CLI localmente"
npm install -g vercel --legacy-peer-deps

echo ""
echo "Paso 2: Autenticarse con Vercel"
echo "Se abrirá una ventana del navegador para iniciar sesión"
npx vercel login

echo ""
echo "Paso 3: Desplegar el proyecto"
echo "Sigue las instrucciones en pantalla:"
echo "- Nombre del proyecto: frutas-verduras-ecommerce"
echo "- Usa el directorio actual (./)"
echo "- Framework: Next.js"
npx vercel deploy --prod

echo ""
echo "✅ ¡Deploy completado!"
echo "Tu sitio estará disponible en la URL que Vercel te proporcione"
