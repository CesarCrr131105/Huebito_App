# Imágenes de recetas

Coloca aquí las fotos reales de cada receta. La app las carga automáticamente
en cuanto detecta el archivo — no hay que tocar código, solo el archivo debe
llamarse **exactamente** como se indica abajo (el nombre viene del campo
`imagen_asset` de [`src/core/database/seed/recetasSeedData.js`](../../../../src/core/database/seed/recetasSeedData.js)).

## Convenciones

- **Formato**: `.jpg` (también funciona `.png`/`.webp` si cambias la
  extensión en `imagen_asset` para esa receta).
- **Proporción**: idealmente 4:3 o similar (se recorta automáticamente con
  `object-cover`, así que no pasa nada si no calza exacto).
- **Tamaño recomendado**: ~1200×900 px, comprimida (menos de ~300 KB) para
  que la app cargue rápido.
- **Si falta el archivo**: no rompe nada — la receta muestra un ícono de
  reemplazo (taza para desayunos, cubiertos para almuerzos) hasta que agregues
  la foto.

## Archivos esperados

### Desayunos

| Archivo | Receta |
|---|---|
| `pan_con_palta.jpg` | Pan con palta |
| `pan_con_chicharron.jpg` | Pan con chicharrón |
| `pan_con_tamal.jpg` | Pan con tamal |
| `pan_con_tortilla.jpg` | Pan con tortilla |
| `pan_con_huevo.jpg` | Pan con huevo |
| `quinua.jpg` | Quinua |
| `avena.jpg` | Avena |
| `maca.jpg` | Maca |
| `emoliente.jpg` | Emoliente |
| `humitas.jpg` | Humitas |
| `tamales.jpg` | Tamales |
| `pan_con_queso_fresco.jpg` | Pan con queso fresco |
| `pan_con_aceitunas.jpg` | Pan con aceitunas |
| `sandwich_de_pollo.jpg` | Sándwich de pollo |
| `sandwich_de_jamon.jpg` | Sándwich de jamón |
| `jugo_de_papaya.jpg` | Jugo de papaya |
| `jugo_surtido.jpg` | Jugo surtido |
| `leche_con_cafe.jpg` | Leche con café |
| `chocolate_caliente.jpg` | Chocolate caliente |
| `infusion_de_hierbas.jpg` | Infusión de hierbas |

### Almuerzos

| Archivo | Receta |
|---|---|
| `lomo_saltado.jpg` | Lomo Saltado |
| `aji_de_gallina.jpg` | Ají de Gallina |
| `arroz_con_pollo.jpg` | Arroz con Pollo |
| `seco_de_res.jpg` | Seco de Res |
| `carapulcra.jpg` | Carapulcra |
| `tallarines_verdes.jpg` | Tallarines Verdes |
| `causa_limena.jpg` | Causa Limeña |
| `papa_a_la_huancaina.jpg` | Papa a la Huancaína |
| `escabeche.jpg` | Escabeche |
| `pollo_a_la_brasa.jpg` | Pollo a la Brasa |
| `arroz_chaufa.jpg` | Arroz Chaufa |
| `tacu_tacu.jpg` | Tacu Tacu |
| `frejoles_con_seco.jpg` | Frejoles con seco |
| `estofado.jpg` | Estofado |
| `pescado_frito.jpg` | Pescado Frito |
| `sudado.jpg` | Sudado |
| `ceviche.jpg` | Ceviche |
| `arroz_con_mariscos.jpg` | Arroz con Mariscos |

## Agregar una receta nueva

1. Agrega el objeto de la receta en `recetasSeedData.js` con su
   `imagen_asset: '/assets/images/recetas/nombre_del_archivo.jpg'`.
2. Coloca el archivo `nombre_del_archivo.jpg` en esta carpeta.
3. Si ya habías abierto la app antes en este navegador, borra los datos
   guardados (`localStorage.clear()` en la consola, o `appDatabase.reset()`)
   para que tome el nuevo seed.
