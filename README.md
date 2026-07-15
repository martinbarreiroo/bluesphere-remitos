# Bluesphere Remitos

Aplicación estática para imprimir los campos variables sobre remitos físicos preimpresos de Bluesphere.

## Qué resuelve la primera versión

- Guarda clientes y transportistas en el navegador de la computadora que usa la aplicación.
- Al elegirlos, completa Señor(es), domicilio y CUIT; los campos siguen siendo editables para casos puntuales.
- Permite escribir o pegar texto libre en el campo Detalle.
- Imprime exclusivamente los campos cargados: nunca genera, altera ni cubre el número/código de barras del formulario físico.
- Usa una única plantilla para todos los remitos del mismo tamaño y guarda los ajustes de calibración horizontal y vertical.

## Uso diario

1. Colocar el remito físico en la alimentación manual de la impresora.
2. Elegir un cliente y un transportista, o escribir los datos manualmente.
3. Escribir el detalle.
4. Pulsar **Imprimir campos**.
5. En el diálogo de impresión usar el papel personalizado de **170 mm × 200 mm**, orientación vertical, escala 100 %, sin márgenes y sin encabezados/pies de página.
6. Completar a mano los demás datos del remito.

## Primera calibración

1. Medir un remito real con regla al milímetro y reemplazar el tamaño provisional (170 × 200 mm) si fuese necesario.
2. Imprimir una prueba en hoja común usando el tamaño configurado en la impresora.
3. Superponer esa prueba sobre un remito contra una luz.
4. Si el texto queda corrido, cambiar los milímetros Horizontal/Vertical en la app y repetir. Esos valores quedan guardados para la próxima vez.

## Desarrollo

```bash
npm install
npm run dev
```

Para producir la versión estática:

```bash
npm run build
```

El resultado queda en `dist/`. La aplicación no necesita base de datos ni servidor: al publicarla como sitio estático, los contactos y el borrador se almacenan sólo en el navegador de quien la use.

## Próximos pasos propuestos

1. Probar la alineación con la impresora real y fijar las coordenadas definitivas.
2. Añadir exportación/importación de la agenda como respaldo, antes de entregarla a la PC de uso final.
3. Publicarla en una URL privada o instalarla como PWA en esa PC.
