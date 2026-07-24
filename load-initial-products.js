#!/usr/bin/env node

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

async function loadInitialProducts() {
  try {
    // Leer las credenciales
    const keyPath = path.join(__dirname, 'firebase-key.json');
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    // Inicializar Firebase
    initializeApp({
      credential: cert(serviceAccount),
    });

    const db = getFirestore();

    const productos = [
      // Manzanas
      { nombre: 'Manzana Roja', categoria: 'frutas', peso: '1 kg', precio: 3500, descripcion: 'Manzanas rojas frescas y crujientes', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Manzana Verde', categoria: 'frutas', peso: '1 kg', precio: 3500, descripcion: 'Manzanas verdes ácidas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Manzana Royal Gala', categoria: 'frutas', peso: '1 kg', precio: 4000, descripcion: 'Manzana Royal Gala premium', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Manzana Fuji', categoria: 'frutas', peso: '1 kg', precio: 3800, descripcion: 'Manzana Fuji dulce', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Manzana Pink Lady', categoria: 'frutas', peso: '1 kg', precio: 4200, descripcion: 'Manzana Pink Lady rosada', disponible: false, destacado: false, stock: 0 },

      // Frutas básicas
      { nombre: 'Plátano', categoria: 'frutas', peso: '1 kg', precio: 2800, descripcion: 'Plátanos maduros', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Naranja Valencia', categoria: 'frutas', peso: '1 kg', precio: 3200, descripcion: 'Naranjas jugosas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Limón', categoria: 'frutas', peso: '500 g', precio: 2000, descripcion: 'Limones frescos', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Fresa', categoria: 'frutas', peso: '250 g', precio: 4500, descripcion: 'Fresas rojas dulces', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Arándano', categoria: 'frutas', peso: '200 g', precio: 5500, descripcion: 'Arándanos frescos', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Pera', categoria: 'frutas', peso: '1 kg', precio: 4000, descripcion: 'Peras dulces', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Sandía', categoria: 'frutas', peso: '4 kg', precio: 8000, descripcion: 'Sandía refrescante', disponible: false, destacado: false, stock: 0 },

      // Melones
      { nombre: 'Melón', categoria: 'frutas', peso: '2 kg', precio: 6500, descripcion: 'Melón aromático', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Melón Calampeño', categoria: 'frutas', peso: '2 kg', precio: 7000, descripcion: 'Melón Calampeño', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Melón Tuna', categoria: 'frutas', peso: '2 kg', precio: 6800, descripcion: 'Melón Tuna', disponible: false, destacado: false, stock: 0 },

      // Uvas
      { nombre: 'Uva Verde', categoria: 'frutas', peso: '500 g', precio: 5000, descripcion: 'Uvas verdes', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Uva Roja', categoria: 'frutas', peso: '500 g', precio: 5200, descripcion: 'Uvas rojas', disponible: false, destacado: false, stock: 0 },

      // Verduras
      { nombre: 'Lechuga', categoria: 'verduras', peso: '300 g', precio: 2000, descripcion: 'Lechuga fresca', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Tomate', categoria: 'verduras', peso: '1 kg', precio: 3500, descripcion: 'Tomates rojos', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Zanahoria', categoria: 'verduras', peso: '1 kg', precio: 2500, descripcion: 'Zanahorias dulces', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Brócoli', categoria: 'verduras', peso: '400 g', precio: 3800, descripcion: 'Brócoli fresco', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Coliflor', categoria: 'verduras', peso: '400 g', precio: 3500, descripcion: 'Coliflor blanca', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Cebolla Blanca', categoria: 'verduras', peso: '1 kg', precio: 2200, descripcion: 'Cebollas blancas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Cebolla Morada', categoria: 'verduras', peso: '1 kg', precio: 2500, descripcion: 'Cebollas moradas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Ajo', categoria: 'verduras', peso: '500 g', precio: 3500, descripcion: 'Ajo fresco', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Pimiento Rojo', categoria: 'verduras', peso: '500 g', precio: 4500, descripcion: 'Pimientos rojos', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Pimiento Verde', categoria: 'verduras', peso: '500 g', precio: 3800, descripcion: 'Pimientos verdes', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Espinaca', categoria: 'verduras', peso: '200 g', precio: 2800, descripcion: 'Espinaca fresca', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Acelga', categoria: 'verduras', peso: '300 g', precio: 2500, descripcion: 'Acelga fresca', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Papas', categoria: 'verduras', peso: '2 kg', precio: 2800, descripcion: 'Papas blancas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Choclo', categoria: 'verduras', peso: '500 g', precio: 3200, descripcion: 'Choclo fresco', disponible: false, destacado: false, stock: 0 },

      // Paltas
      { nombre: 'Palta Hass', categoria: 'otro', peso: '300 g', precio: 4500, descripcion: 'Palta Hass cremosa', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Palta Negra de la Cruz', categoria: 'otro', peso: '350 g', precio: 4800, descripcion: 'Palta Negra de la Cruz', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Palta Fuerte', categoria: 'otro', peso: '300 g', precio: 4200, descripcion: 'Palta Fuerte', disponible: false, destacado: false, stock: 0 },

      // Orgánico
      { nombre: 'Tomate Orgánico', categoria: 'organico', peso: '500 g', precio: 5500, descripcion: 'Tomate orgánico', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Lechuga Orgánica', categoria: 'organico', peso: '250 g', precio: 4000, descripcion: 'Lechuga orgánica', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Zanahoria Orgánica', categoria: 'organico', peso: '500 g', precio: 4200, descripcion: 'Zanahoria orgánica', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Brócoli Orgánico', categoria: 'organico', peso: '300 g', precio: 5000, descripcion: 'Brócoli orgánico', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Espinaca Orgánica', categoria: 'organico', peso: '200 g', precio: 4500, descripcion: 'Espinaca orgánica', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Manzana Orgánica', categoria: 'organico', peso: '1 kg', precio: 6500, descripcion: 'Manzana orgánica', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Plátano Orgánico', categoria: 'organico', peso: '1 kg', precio: 5500, descripcion: 'Plátano orgánico', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Fresas Orgánicas', categoria: 'organico', peso: '250 g', precio: 7000, descripcion: 'Fresas orgánicas', disponible: false, destacado: false, stock: 0 },

      // Otros
      { nombre: 'Huevos Camperos', categoria: 'otro', peso: '6 unidades', precio: 5500, descripcion: 'Huevos camperos', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Queso Fresco', categoria: 'otro', peso: '250 g', precio: 6500, descripcion: 'Queso fresco', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Queso Cheddar', categoria: 'otro', peso: '200 g', precio: 7500, descripcion: 'Queso cheddar', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Almendras', categoria: 'otro', peso: '200 g', precio: 8000, descripcion: 'Almendras naturales', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Nueces', categoria: 'otro', peso: '200 g', precio: 7500, descripcion: 'Nueces frescas', disponible: false, destacado: false, stock: 0 },
      { nombre: 'Avellanas', categoria: 'otro', peso: '150 g', precio: 6500, descripcion: 'Avellanas selectas', disponible: false, destacado: false, stock: 0 },
    ];

    console.log('🔥 Cargando 46 productos iniciales...\n');

    let count = 0;
    for (const producto of productos) {
      await db.collection('productos').add({
        ...producto,
        imagenUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      count++;
      console.log(`✅ ${count}. ${producto.nombre}`);
    }

    console.log(`\n🎉 ¡${count} productos cargados correctamente!`);
    console.log('⚠️  Esta carga SOLO se ejecuta UNA VEZ. No volver a ejecutar.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

loadInitialProducts();
