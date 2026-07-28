// Configuración centralizada de la aplicación
// NO hardcodear valores aquí - todas las constantes deben estar centralizadas

export const CONFIG = {
  // Inventario y reservas
  RESERVATION_DURATION_MINUTES: 30, // Tiempo que una orden reserva stock
  LOW_STOCK_THRESHOLD: 5, // Cantidad mínima de stock para alertar

  // Tareas automáticas
  CLEANUP_INTERVAL_MINUTES: 2, // Cada cuánto se liberan reservas expiradas

  // Dashboard y límites
  PENDING_ORDERS_LIMIT: 20, // Máximo de órdenes pendientes a mostrar
  PAID_ORDERS_LIMIT: 10, // Máximo de órdenes pagadas a mostrar en observabilidad

  // Validación de carrito
  MIN_QUANTITY: 1, // Cantidad mínima permitida
  MAX_QUANTITY_PER_ORDER: 999, // Cantidad máxima por producto en una orden

  // Datos de transporte
  FREE_SHIPPING_THRESHOLD: 50000, // CLP - envío gratis si el total es mayor
  SHIPPING_COST: 5000, // CLP - costo de envío estándar
} as const

// Validar que los valores tienen sentido
if (CONFIG.RESERVATION_DURATION_MINUTES <= 0) {
  throw new Error('RESERVATION_DURATION_MINUTES debe ser > 0')
}

if (CONFIG.CLEANUP_INTERVAL_MINUTES <= 0) {
  throw new Error('CLEANUP_INTERVAL_MINUTES debe ser > 0')
}

if (CONFIG.LOW_STOCK_THRESHOLD < 0) {
  throw new Error('LOW_STOCK_THRESHOLD no puede ser negativo')
}
