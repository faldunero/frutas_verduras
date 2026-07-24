#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function setupFirestore() {
  try {
    console.log('🔥 Inicializando Firebase Admin...');

    // Leer firebase-key.json
    const keyPath = path.join(__dirname, 'firebase-key.json');
    const serviceAccount = JSON.parse(
      fs.readFileSync(keyPath, 'utf8')
    );

    console.log('📝 Credenciales cargadas:', serviceAccount.project_id);

    // Inicializar Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    const db = getFirestore(app);

    console.log('🔥 Creando colecciones en Firestore...\n');

    // Crear colección users con documento ejemplo
    await db.collection('users').doc('example-user').set({
      email: 'ejemplo@test.com',
      nombre: 'Usuario Ejemplo',
      rol: 'client',
      direccion: '',
      telefono: '',
      createdAt: new Date(),
    });
    console.log('✅ Colección "users" creada');

    // Crear colección productos
    await db.collection('productos').doc('example-product').set({
      nombre: 'Producto Ejemplo',
      descripcion: 'Este es un producto de ejemplo',
      precio: 5000,
      stock: 100,
      categoria: 'frutas',
      peso: '1kg',
      disponible: true,
      destacado: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Colección "productos" creada');

    // Crear colección ordenes
    await db.collection('ordenes').doc('example-order').set({
      userId: 'example-user',
      estado: 'pendiente',
      total: 5000,
      subtotal: 5000,
      impuestos: 0,
      envio: 0,
      direccionEntrega: 'Calle Principal 123',
      metodoPago: 'flow',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Colección "ordenes" creada');

    // Crear colección faqs
    await db.collection('faqs').doc('example-faq').set({
      pregunta: '¿Cuál es el horario de entrega?',
      respuesta: 'Entregamos de 9am a 6pm, lunes a viernes',
      orden: 1,
      activo: true,
      createdAt: new Date(),
    });
    console.log('✅ Colección "faqs" creada');

    console.log('\n🎉 ¡Firestore configurado correctamente!');
    console.log('\n⚠️  Los documentos de ejemplo fueron creados.');
    console.log('   Puedes eliminarlos manualmente en Firebase Console si lo deseas.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupFirestore();
