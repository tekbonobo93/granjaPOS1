# 📘 Manual de Usuario - GranjaPOS

Bienvenido al sistema digital de gestión. Esta guía le ayudará a operar los diferentes módulos del sistema.

## 👥 Roles de Usuario
*   **Admin (Dueño):** Acceso total a ventas, inventario, compras, reportes y clientes.
*   **Cajero:** Acceso a Punto de Venta (POS), Clientes y Delivery.
*   **Repartidor:** Acceso exclusivo a la gestión de pedidos de Delivery.

---

## 🛒 1. Módulo de Punto de Venta (POS)
Es la pantalla principal para registrar ventas diarias.

### Vender Productos
1.  **Buscar:** Use la barra superior o filtre por categorías (Huevos, Pollo, etc.).
2.  **Seleccionar:** Haga clic en un producto.
3.  **Configurar Cantidad (Ventana Emergente):**
    *   **Huevos:** Seleccione botones rápidos (Unidad, Docena, Cubeta) o escriba manual.
    *   **Peso (Carnes/Quesos):** Escriba el peso exacto. Puede alternar entre **Kg** y **Libras**. El sistema calcula el precio automáticamente.
4.  **Carrito:** Los productos aparecen a la derecha. Puede eliminarlos con el icono de basura.
5.  **Confirmar Venta:**
    *   Click en "Confirmar Venta".
    *   Seleccione si es **Venta Mostrador** o **Delivery**.
    *   (Opcional) Asigne un cliente.
    *   Seleccione método de pago (Efectivo, Yape, etc.) y finalice.

---

## 📦 2. Módulo de Inventario y Compras
Gestión de mercadería.

### Crear/Editar Productos (Módulo Inventario)
*   Use este módulo para crear nuevos productos que no existen o cambiar precios de venta.
*   **Nota:** No use este módulo para agregar stock diario. Use "Compras".

### Reponer Stock (Módulo Compras) 🌟 *Importante*
Cuando llegue mercadería del proveedor:
1.  Vaya a **"Compras / Insumos"**.
2.  Click en **"Registrar Compra"**.
3.  Seleccione el producto, la cantidad que llegó y el costo unitario de compra.
4.  Al guardar, **el sistema sumará automáticamente el stock** al inventario y registrará el gasto para los reportes.

---

## 🚚 3. Delivery y Pedidos WhatsApp
Para gestionar pedidos que no se entregan al instante.

1.  En el POS, al confirmar venta, seleccione **"Delivery / WhatsApp"**.
2.  Ingrese los datos de entrega (Nombre, Teléfono, Dirección).
3.  El pedido irá al módulo **"Delivery"** con estado "Pendiente".
4.  El repartidor o cajero puede cambiar el estado a:
    *   *En Preparación* -> *En Camino* -> *Entregado*.

---

## 📈 4. Reportes y Finanzas

### Dashboard (Panel Principal)
*   Vista rápida del día a día. Ventas de hoy, productos con stock bajo y gráficas simples.

### Reportes Financieros
*   Herramienta para el dueño.
*   **Filtros de Tiempo:** Vea la rentabilidad de hoy, la semana, el mes o un rango personalizado.
*   **Métricas Clave:**
    *   **Ventas:** Total dinero ingresado.
    *   **Gastos (Costo):** Cuánto le costó a usted la mercadería vendida.
    *   **Ganancia Neta:** Dinero real que queda (Ventas - Costos).
    *   **Inversión Actual:** Cuánto dinero tiene parado en mercadería en el almacén hoy.

### Historial de Ventas
*   Lista detallada de cada ticket. Use esto para auditoría o para buscar una venta específica por nombre de cliente o fecha.

---

## ❓ Preguntas Frecuentes

**¿Qué pasa si vendo en Libras?**
El sistema convierte internamente a Kilos para descontar del inventario correctamente, pero en el ticket muestra Libras para el cliente.

**¿Cómo cierro caja?**
Actualmente puede ver el total de ventas del día en el Dashboard o en "Reportes Financieros" filtrando por "Hoy".

**¿Se borran mis datos?**
En esta versión demo, los datos viven en su navegador. Si borra el historial/caché, se reiniciará el sistema.