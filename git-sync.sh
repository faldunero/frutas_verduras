#!/bin/bash

# 🚀 Script de Sincronización Git - Frutas & Verduras
# Automatiza el flujo: local -> GitHub

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📦 Git Sync - Frutas & Verduras      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Verificar si estamos en un repositorio git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: No estás en un repositorio git${NC}"
    exit 1
fi

# Función para mostrar estado
show_status() {
    echo -e "${YELLOW}📊 Estado actual:${NC}"
    git status --short
    echo ""
}

# Función para hacer commit y push
push_changes() {
    local message=$1

    echo -e "${YELLOW}📝 Mensaje: ${NC}$message"
    echo ""

    # Agregar todos los cambios
    echo -e "${BLUE}📌 Agregando archivos...${NC}"
    git add .

    # Verificar si hay cambios
    if ! git diff --cached --quiet; then
        echo -e "${BLUE}💾 Creando commit...${NC}"
        git commit -m "$message"

        echo -e "${BLUE}🚀 Subiendo a GitHub...${NC}"
        git push origin main

        echo -e "${GREEN}✅ Cambios subidos exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️  No hay cambios para commitear${NC}"
    fi
    echo ""
}

# Función para hacer pull
pull_changes() {
    echo -e "${BLUE}⬇️  Descargando cambios desde GitHub...${NC}"
    git pull origin main
    echo -e "${GREEN}✅ Cambios descargados${NC}"
    echo ""
}

# Menú principal
echo -e "${BLUE}¿Qué quieres hacer?${NC}"
echo ""
echo "1) 📤 Push (subir cambios)"
echo "2) 📥 Pull (descargar cambios)"
echo "3) 📊 Ver estado"
echo "4) 🔄 Sync (pull + push)"
echo "5) ❌ Salir"
echo ""

read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        show_status
        read -p "Mensaje del commit: " message
        if [ -z "$message" ]; then
            message="🔄 Actualización de código"
        fi
        push_changes "$message"
        ;;
    2)
        pull_changes
        ;;
    3)
        show_status
        ;;
    4)
        pull_changes
        show_status
        read -p "Mensaje del commit: " message
        if [ -z "$message" ]; then
            message="🔄 Sincronización automática"
        fi
        push_changes "$message"
        ;;
    5)
        echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac
