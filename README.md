# 🐔 GranjaPOS Digital - Documentación Técnica

Sistema de gestión integral para pequeños negocios de venta de huevos, lácteos y cárnicos.

## 📋 Descripción General
GranjaPOS es una Single Page Application (SPA) construida con tecnologías modernas para digitalizar el flujo de ventas, inventario y delivery de un negocio minorista. 

Actualmente, utiliza una arquitectura **Serverless / Local-First** simulando una base de datos mediante `localStorage`, pero está arquitectada para migrar fácilmente a un backend real (Node.js/NestJS) sin reescribir el frontend.

## 🛠 Stack Tecnológico
*   **Frontend Library:** React 19
*   **Lenguaje:** TypeScript (Tipado estricto)
*   **Estilos:** Tailwind CSS (Utility-first)
*   **Iconos:** Lucide React
*   **Gráficos:** Recharts
*   **Manejo de Fechas:** Nativo (ISO Strings)
*   **Persistencia:** LocalStorage (Service Pattern)

## 📂 Estructura del Proyecto

```bash
/
├── components/       # Componentes reutilizables de UI
│   └── Layout.tsx    # Estructura principal (Sidebar, Header responsive)
├── pages/            # Vistas principales (Módulos)
│   ├── Login.tsx     # Autenticación simulada por Roles
│   ├── Dashboard.tsx # Métricas generales
│   ├── POS.tsx       # Punto de Venta (Lógica compleja de unidades)
│   ├── Inventory.tsx # CRUD de Productos
│   ├── Purchases.tsx # Módulo de Compras (Entradas de Stock)
│   ├── Reports.tsx   # Reportes Financieros (ROI, Ganancias)
│   └── ...
├── services/
│   ├── api.ts        # Capa de Abstracción de Datos (API Gateway simulado)
│   └── mockData.ts   # Datos semilla iniciales
├── types.ts          # Definiciones de Tipos e Interfaces (Dominio)
└── App.tsx           # Enrutador principal y manejo de estado de sesión
```

## 🏗 Arquitectura y Patrones

### 1. Service Repository Pattern
Toda la lógica de datos reside en `services/api.ts`. Los componentes de React **nunca** acceden a `localStorage` directamente.
*   **Beneficio:** Para conectar con un backend real, solo se necesita reescribir las funciones en `api.ts` (ej: cambiar `localStorage.getItem` por `axios.get`).

### 2. Lógica de Negocio Especializada
El sistema maneja unidades de medida complejas específicas del nicho:
*   **Huevos:** Se almacenan por unidad pero se venden por Unidad, Docena (12), Quincena (15) o Cubeta (30).
*   **Pesables (Pollo/Carne/Queso):** Se almacenan en **Kg**. El POS permite venta en **Libras** (Lb) realizando la conversión matemática interna (1 Lb = 0.453 Kg) para descontar del inventario correctamente.

### 3. Modelo de Costos Históricos
Para garantizar reportes financieros precisos:
*   Cada `Purchase` (Compra) actualiza el `cost` (Costo Promedio/Actual) del producto.
*   Cada `Order` (Venta) guarda una instantánea del costo en ese momento (`costAtSale`).
*   Esto permite calcular la ganancia real histórica incluso si el costo del producto cambia en el futuro.

## 🚀 Instalación y Despliegue

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Correr en desarrollo:**
    ```bash
    npm start
    ```

3.  **Compilar para producción:**
    ```bash
    npm run build
    ```

## ⚠️ Notas Importantes
*   **Persistencia:** Al usar `localStorage`, si el usuario borra la caché del navegador, se perderán los datos. Para producción real, es mandatorio conectar a una base de datos (PostgreSQL/Supabase).
*   **Seguridad:** La autenticación actual es simulada. No usar para guardar datos sensibles reales sin implementar JWT en un backend.

---
*Desarrollado para GranjaPOS v1.0.0*