# PEDORNO — sitio web

Sitio de la banda Pedorno. Es una página estática: HTML, CSS y JavaScript sin frameworks ni dependencias. No tiene servidor ni base de datos.

## Estructura

```
index.html      Marcado de la página y su seguridad (CSP) en el <head>
css/styles.css  Estilos. Los colores, la tipografía y el espaciado están en :root
js/main.js      Interacciones: menú, formulario, visor de fotos, avión y sonido
img/            Imágenes, logo y audios (motor, pedo y bomba del avión)
```

## Cómo verlo en tu computador

Necesitas Python 3 instalado. Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000 en el navegador. Para detenerlo, presiona `Ctrl + C` en la terminal.

Abrir `index.html` con doble clic también funciona, pero el reproductor de Bandcamp y las fuentes necesitan conexión a internet.

## Contenido pendiente

Los datos que faltan aparecen como `[AGREGAR ...]`, con estilo punteado:

- Ciudades, lugares y enlaces de entradas de la gira.
- Nombres e instrumentos de los integrantes.
- Fotos, precios y enlaces de compra del merch.
- Servicio de correo para el formulario de suscripción.
- Páginas de privacidad y términos.

## Comportamientos a conocer

- **Avión y sonido:** el avión vuela por la pantalla y, al tocarlo, lanza un sonido, cae una imagen y explota la pantalla. El sonido del motor se activa con el primer toque en la página, y el botón "Sonido" lo apaga o lo enciende. Si el sistema tiene activado "Reducir movimiento", el avión y los efectos no se muestran.
- **Formulario:** todavía no envía nada. Valida el correo y muestra un aviso. Para conectarlo a un servicio, hay que cambiar el código de `js/main.js` en la sección del formulario y actualizar la CSP de `index.html`.

## Seguridad

- **Política de contenido (CSP):** el `<head>` de `index.html` limita los orígenes permitidos. Solo se ejecuta el script en línea identificado por su hash, además de `js/main.js` y los archivos del propio sitio. Si cambias ese script en línea, el hash deja de coincidir y el navegador lo bloquea. Hay que recalcularlo.
- **Enlaces externos:** los que abren en otra pestaña usan `rel="noopener noreferrer"`, para que la página abierta no pueda manipular la original.
- **Sin datos sensibles:** el sitio no guarda cookies, no usa almacenamiento local y no tiene claves ni credenciales. Nunca subas secretos a este repositorio.
- **Formulario:** cuando se conecte a un servicio, valida también en el servidor del proveedor. La validación del navegador es solo una ayuda para el usuario.

## Publicar

El sitio se publica con GitHub Pages desde una rama del repositorio. Revisa la configuración en **Settings → Pages** y verifica que la rama y la carpeta coincidan con lo que quieres publicar.
