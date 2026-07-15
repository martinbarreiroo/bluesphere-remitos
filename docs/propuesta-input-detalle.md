# Propuesta: input de detalle de remitos

## Recomendación

Usar **renglones estructurados** en vez de un único campo de texto. Para el caso habitual, la pantalla debe ofrecer un modo rápido con dos cantidades y generar automáticamente los dos renglones del remito:

| Cantidad | Detalle impreso |
|---:|---|
| `1.052,62` | DESCARTADORES 4 LITROS |
| `295,31` | DESCARTADORES 7 LITROS |

Los valores son un ejemplo tomado del primer destino de la hoja `AJUSTE FEBRERO`: sus totales nuevos son 1.052,62 para 4 L y 295,31 para 7 L. Como la planilla contiene fracciones, el sistema debe conservar hasta dos decimales y no redondear automáticamente; si las cantidades deben ser unidades enteras, primero hay que definir la regla comercial de redondeo.

## Por qué

La planilla se organiza como una matriz de destinos y cantidades por presentación. Cada remito representa un destino, pero debe imprimir uno o dos renglones de producto. Un `textarea` obliga a volver a escribir productos, cantidades y formato manualmente; también impide validar que la cantidad sea numérica y que el total impreso coincida con lo cargado.

El formulario físico ya tiene una columna `Cant.` y otra `Detalle`, por lo que los renglones estructurados reflejan exactamente el papel.

## Interacción propuesta

1. Seleccionar el destinatario guardado (o cargarlo por primera vez).
2. En "Detalle", mostrar dos campos numéricos visibles:
   - Descartadores 4 L
   - Descartadores 7 L
3. Si una cantidad es cero o queda vacía, no imprimir ese renglón.
4. Permitir `+ Agregar otro producto` sólo como excepción: abre una grilla de renglones con `Cantidad`, `Producto` y eliminar.
5. Mostrar en la vista previa exactamente las mismas filas que saldrán en el remito, con un total de unidades.

## Fuente de datos futura

Mantener la agenda de destinatarios separada de las cantidades. En una segunda etapa, ofrecer "Importar tabla de entregas" que acepte columnas como:

| Lugar de entrega | 4 L | 7 L |
|---|---:|---:|
| H.I.G.A. PROF. DR. R. ROSSI | 1.052,62 | 295,31 |

Al elegir un lugar, el sistema precarga los dos inputs del modo rápido. Esto conserva el flujo de trabajo de Excel sin convertir el remito individual en una planilla compleja.

## Regla de impresión

Cada renglón se imprime con la cantidad alineada en la columna izquierda del formulario y el nombre del producto en la columna `Detalle`. No conviene imprimir "4 L: 1053 / 7 L: 295" dentro de una sola celda de detalle, porque no aprovecha la columna de cantidades y dificulta controlar la entrega.
