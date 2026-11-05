# API de productos de la semana 10

Práctica de Desarrollo de Aplicaciones Web (IS093A). API REST con Node.js y Express. Usa un pool de `mysql2/promise` y sentencias preparadas para acceder a la tabla `productos` de `db_lab10`.

## Demostración en Windows

Inicia MySQL en XAMPP y abre **PRESENTAR.cmd** con doble clic. El lanzador ejecuta el CRUD, las validaciones y la prueba de error 500 en una instancia separada. La primera vez instala las dependencias si hacen falta.

## Puesta en marcha

1. Instala Node.js 20 o superior e inicia MySQL, por ejemplo desde XAMPP.
2. Importa `sql/schema.sql` desde phpMyAdmin o ejecútalo en el cliente de MySQL.
3. Desde la raíz del proyecto, instala las dependencias y copia la plantilla de configuración.

   ```powershell
   npm ci
   Copy-Item .env.example .env
   ```

4. Completa `.env` con tu usuario, contraseña y puerto de MySQL. Ejecuta `npm start`. La API escucha en `http://127.0.0.1:3010/api/productos` con la configuración de ejemplo.

## Interfaz web

Con la API en ejecución, abre [el inventario](http://127.0.0.1:3010/) en el navegador. El formulario permite agregar productos y la tabla permite editarlos o eliminarlos. La interfaz usa los mismos endpoints que la colección de Postman.

## Endpoints

| Método y ruta | Operación | Éxito |
| --- | --- | --- |
| `GET /api/productos` | Lista los productos ordenados por ID. | `200 OK` |
| `POST /api/productos` | Crea un producto y devuelve su ID y sus datos. | `201 Created` |
| `PUT /api/productos/:id` | Reemplaza el nombre, precio y stock del producto. | `200 OK` |
| `DELETE /api/productos/:id` | Elimina físicamente el producto. | `200 OK` |

Para POST y PUT envía `Content-Type: application/json` y los tres campos.

```json
{
  "nombre": "Cuaderno",
  "precio": 12.50,
  "stock": 20
}
```

El nombre admite hasta 120 caracteres. El precio es no negativo y admite dos decimales. El stock es un entero no negativo. La respuesta representa el precio como cadena decimal, por ejemplo `"12.50"`, para conservar el formato exacto de MySQL.

Los errores devuelven JSON con el campo `error`. Los datos inválidos devuelven `400`, los productos o rutas inexistentes devuelven `404` y un fallo interno devuelve `500`.

## Pruebas

En Postman en modo local, abre la carpeta `postman` del repositorio y usa la colección v3 **Semana 10 · API de productos**. La [colección JSON](pruebas/productos.postman_collection.json) queda disponible para Newman. Ejecuta en orden la carpeta **CRUD y validación**. La solicitud de creación guarda el ID para las siguientes operaciones. La colección comprueba el estado HTTP, el encabezado de respuesta y el esquema JSON.

También puedes ejecutarla con Newman.

```powershell
npx --yes --package=newman newman run pruebas/productos.postman_collection.json --folder "CRUD y validación"
```

Para provocar un `500` en una instancia separada, usa un puerto de base de datos sin servicio. En una terminal, ejecuta lo siguiente.

```powershell
$env:PORT = '3011'
$env:DB_PORT = '33311'
npm start
```

En otra terminal, ejecuta la carpeta de prueba con la URL de esa instancia.

```powershell
npx --yes --package=newman newman run pruebas/productos.postman_collection.json --folder "Base de datos no disponible" --env-var "baseUrl=http://127.0.0.1:3011"
```

## Evidencias

Newman ejecutó **8 solicitudes y 27 verificaciones** sin fallos. Las capturas de respuestas se generaron a partir del reporte de Newman.

- [Estructura del proyecto](evidencias/estructura.png)
- [Código del controlador](evidencias/controlador.png)
- [Pool y esquema de la base de datos](evidencias/base-datos.png)
- [Respuestas exitosas 200 y 201](evidencias/crud.png)
- [Respuestas de error 400, 404 y 500](evidencias/errores.png)

## Referencias

- [Rutas de Express](https://expressjs.com/en/guide/routing/)
- [Pools de mysql2](https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool)
