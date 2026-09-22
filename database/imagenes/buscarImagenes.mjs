// Busca una imagen con licencia reutilizable para cada receta, la redimensiona
// y la guarda como binario en la propia tabla recetas (columna imagen_datos).
//
// Fuentes: Wikimedia Commons y Openverse. Ambas exponen la licencia de cada
// archivo, que es lo que permite filtrar las que no se pueden usar.
//
// Uso:
//   node database/imagenes/buscarImagenes.mjs                 # todas las que falten
//   node database/imagenes/buscarImagenes.mjs --limit 15      # prueba corta
//   node database/imagenes/buscarImagenes.mjs --dry           # no escribe en la BD
//   node database/imagenes/buscarImagenes.mjs --categoria bebidas
//   node database/imagenes/buscarImagenes.mjs --rehacer       # reprocesa las que ya tienen
//
// El proceso es reanudable: por defecto salta las recetas que ya tienen imagen.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const root = path.resolve(import.meta.dirname, '..', '..');

// ---------------------------------------------------------------- parámetros

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto = null) => {
  const i = args.indexOf(`--${nombre}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : porDefecto;
};
const bandera = (nombre) => args.includes(`--${nombre}`);

const LIMITE = Number(opcion('limit', '0')) || Infinity;
const DRY = bandera('dry');
const REHACER = bandera('rehacer');
const CATEGORIA = opcion('categoria');

// Tamaño final. 600x450 (4:3) cubre tanto la tarjeta del listado como la
// cabecera del detalle sin que se vea pixelada en pantallas 2x.
const ANCHO = 600;
const ALTO = 450;
const CALIDAD = 80;

// Wikimedia pide un User-Agent descriptivo que identifique a la aplicación.
const UA = 'HuebitoApp/1.0 (proyecto educativo de recetas peruanas)';

// --------------------------------------------------------------- licencias

// Rechazamos ND (NoDerivatives) porque redimensionar es crear una obra
// derivada, y esa licencia no lo permite. NC sí entra: restringe el uso
// comercial, pero deja modificar.
const LICENCIA_PROHIBIDA = /\bnd\b|noderiv|no deriv/i;
const LICENCIA_PERMITIDA = /^(cc0|pdm|public domain|dominio p|cc[- ]?by|attribution)/i;

function licenciaUsable(texto) {
  if (!texto) return false;
  const t = String(texto).trim();
  if (LICENCIA_PROHIBIDA.test(t)) return false;
  return LICENCIA_PERMITIDA.test(t) || /^(by|by-sa|by-nc|by-nc-sa)$/i.test(t);
}

// --------------------------------------------------------------- relevancia

const VACIAS = new Set(['de','del','la','el','los','las','con','y','a','al','en','un','una','para','por','su','sus']);

const normalizar = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const tokens = (s) =>
  normalizar(s).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length >= 3 && !VACIAS.has(t));

// Contar palabras sueltas resultó demasiado permisivo: "Pan con queso fresco"
// aceptaba "Tosta de berenjena con mermelada de tomate y queso fresco" porque
// todas las palabras estaban, dispersas. Exigimos que el nombre del plato
// aparezca como frase contigua, ignorando las palabras vacías de ambos lados:
//
//   plato  "pan con queso fresco"  -> "pan queso fresco"
//   título "...tomate y queso fresco" -> "tosta berenjena ... queso fresco"
//   "pan queso fresco" NO está contenido -> se descarta
//
// mientras que "Pan con Chicharron from @sanguchon..." -> "pan chicharron ..."
// sí contiene "pan chicharron" y se acepta.
// Muchos títulos vienen de redes sociales y traen arrobas, hashtags y URLs
// que no describen el plato pero alargan el título y hunden el score. Un
// "Pan con Chicharron from @sanguchonperuvianfood @offthegrid #foodporn"
// es una coincidencia perfectamente buena y no debería penalizarse por eso.
function limpiarRuido(texto) {
  return String(texto)
    .replace(EXT_VALIDA, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[@#]\S+/g, ' ')
    .replace(/(from|via|por|photo|foto|img|dsc|image)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fraseDe(texto) {
  return tokens(limpiarRuido(texto)).join(' ');
}

function puntaje(nombreReceta, tituloArchivo) {
  const plato = fraseDe(nombreReceta);
  if (!plato) return 0;
  const titulo = fraseDe(tituloArchivo);
  if (!titulo.includes(plato)) return 0;
  // Entre dos títulos que contienen la frase, preferimos el más escueto:
  // "Humitas.jpg" describe el plato mejor que "Cabrito con tamales".
  return plato.length / titulo.length;
}

// Señal de que el archivo pertenece al ámbito peruano/andino. Hace falta para
// los platos de una sola palabra: "Chapana" también es un dulce de Odisha, y
// sin esta comprobación se colaría esa foto.
const PISTA_PERUANA = /per[uú]|peruvian|andean|andino|cusco|cuzco|lima|arequipa|inca|latin america/i;

// El nombre del plato puede coincidir con un lugar, un producto envasado o una
// planta. Casos reales que se colaron: "Chancay" trajo una foto de la calle de
// la ciudad de Chancay (es pan y es ciudad), "Estofado de Res" la etiqueta de
// una lata, y "Jugo de pera" una rama con frutos.
const NO_ES_COMIDA = /(calle|calles|street|streets|plaza|avenida|jir[oó]n|ciudad|distrito|provincia|puerto|iglesia|edificio|building|vista|panor[aá]mica|mapa|map|escudo|bandera|flag|logo|letrero|se[nñ]al|lata|can|tin|envase|package|packaging|etiqueta|label|producto|brand|supermercado|tienda|shop|arbol|[aá]rbol|tree|planta|plant|flor|flower|hoja|leaf|semilla|seed|retrato|portrait|iglesia|cementerio|estacion|station|puente|bridge)/i;

// Señal de que el archivo sí retrata comida o bebida. Commons categoriza muy
// bien los alimentos, así que cuando hay categorías se puede exigir esto.
const ES_COMIDA = /(food|foods|cuisine|dish|dishes|comida|plato|platos|gastronom|drink|drinks|beverage|beverages|bebida|bebidas|juice|jugo|soup|sopa|bread|pan(es)?|dessert|postre|meat|carne|seafood|marisco|restaurant|cooking|cocina|recipe|receta|breakfast|desayuno|lunch|almuerzo|snack|cake|pastry|panaderia|cocktail|coctel|tea|te|cafe|coffee)/i;

function pareceDeLibro(titulo) {
  // Los escaneos del Internet Archive vienen como "(IA nombre-del-libro)" y
  // contaminan cualquier búsqueda de texto en Commons.
  return /\(IA\s|\bpage\b|\bfolio\b|zarzuela|memorias|libro|revista|gazette|\bvol\b/i.test(titulo);
}

const EXT_VALIDA = /\.(jpe?g|png|webp)$/i;

// Mínimo de "cuánto del título es el nombre del plato" para aceptar la foto.
const UMBRAL_SCORE = 0.30;

// ------------------------------------------------------------ Wikimedia API

async function buscarEnCommons(consulta) {
  // filetype:bitmap descarta PDFs y DjVu, que es de donde salían los libros.
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    `&generator=search&gsrsearch=${encodeURIComponent(consulta + ' filetype:bitmap')}` +
    '&gsrnamespace=6&gsrlimit=8' +
    '&prop=imageinfo|categories&cllimit=max' +
    `&iiprop=url|extmetadata&iiurlwidth=${ANCHO * 2}`;

  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const j = await r.json();
  const paginas = j?.query?.pages ? Object.values(j.query.pages) : [];

  return paginas.map((p) => {
    const info = p.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    const categorias = (p.categories || []).map((c) => c.title).join(' ');
    return {
      fuenteApi: 'commons',
      titulo: String(p.title || '').replace(/^File:/, ''),
      urlDescarga: info.thumburl || info.url,
      urlPagina: info.descriptionurl,
      licencia: meta.LicenseShortName?.value || meta.UsageTerms?.value || '',
      autor: String(meta.Artist?.value || '').replace(/<[^>]*>/g, '').trim(),
      contexto: `${p.title} ${categorias}`,
    };
  });
}

async function buscarEnOpenverse(consulta) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(consulta)}&page_size=8`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results || []).map((x) => ({
    fuenteApi: 'openverse',
    titulo: x.title || '',
    urlDescarga: x.url,
    urlPagina: x.foreign_landing_url || x.url,
    licencia: x.license || '',
    autor: x.creator || '',
    contexto: `${x.title} ${x.tags?.map((t) => t.name).join(' ') || ''}`,
  }));
}

// Elige el mejor candidato aplicando licencia + relevancia.
function elegirCandidato(fraseObjetivo, candidatos) {
  const unaSolaPalabra = tokens(fraseObjetivo).length === 1;

  const viables = candidatos
    .filter((c) => c.urlDescarga && !urlsUsadas.has(c.urlDescarga) && !urlsUsadas.has(c.urlPagina) && licenciaUsable(c.licencia))
    .filter((c) => c.fuenteApi === 'openverse' || EXT_VALIDA.test(c.titulo))
    .filter((c) => !pareceDeLibro(c.titulo))
    // Descarta lugares, productos envasados y plantas que comparten nombre
    // con el plato.
    .filter((c) => !NO_ES_COMIDA.test(c.titulo))
    // Si la fuente aporta categorías o tags, exigimos que digan que es comida.
    // Openverse a veces no trae tags: ahí no se puede pedir la señal.
    .filter((c) => !c.contexto || c.contexto === c.titulo || ES_COMIDA.test(c.contexto))
    .map((c) => ({ ...c, score: puntaje(fraseObjetivo, c.titulo), peruano: PISTA_PERUANA.test(c.contexto) }))
    // El score es qué proporción del título ocupa el nombre del plato. Un
    // valor bajo significa que el plato es un detalle menor dentro de una foto
    // de otra cosa: así se colaba un plato de mayólica de Urbino en "Pan con
    // pollo" con score 0.12, o una hamburguesa en "Sándwich de pollo" con 0.25.
    .filter((c) => c.score >= UMBRAL_SCORE)
    // Un plato de una sola palabra puede chocar con un homónimo de otra cocina
    // ("Chapana" es también un dulce de Odisha). Le pedimos señal peruana, o
    // bien que el título sea prácticamente solo el nombre del plato
    // ("Humitas.jpg"), que ya es evidencia suficiente.
    .filter((c) => !unaSolaPalabra || c.peruano || c.score >= 0.7)
    .sort((a, b) => b.score - a.score || Number(b.peruano) - Number(a.peruano));

  return viables[0] || null;
}

// Palabras que describen una variante pero no el plato en sí. Ninguna foto se
// titula "Tacacho de desayuno", así que para poder encontrar algo hay que
// reducir el nombre a su núcleo ("Tacacho").
// Palabras de categoría culinaria: describen el tipo de preparación, no el
// plato concreto. Una foto titulada solo "pan" o "jugo" no sirve para
// identificar una receta puntual.
const GENERICOS = new Set([
  'pan','jugo','sopa','arroz','mate','infusion','batido','refresco','sandwich',
  'sanguche','tortilla','empanada','chicha','ponche','caldo','chupe','seco',
  'picante','guiso','agua','leche','cafe','crema','bebida','plato','postre',
  'torta','queque','bizcocho','galletas','tostada','tostadas','panqueques',
  // Ingredientes base: reducir a uno solo trae cualquier foto de ese
  // ingrediente. Así "Seco de Pollo" acabó con una foto de pollo a la brasa,
  // porque la búsqueda se había reducido a "pollo peru".
  'pollo','carne','pescado','res','cerdo','huevo','huevos','queso','papa',
  'papas','yuca','camote','choclo','platano','frejol','frejoles','mariscos',
]);

const MODIFICADORES = new Set([
  'desayuno','casero','casera','caseros','caseras','peruano','peruana','especial',
  'clasico','clasica','pequeno','pequena','grande','tradicional','simple','rapido',
  'rapida','mixto','mixta','surtido','natural','fresco','fresca',
]);

// Genera intentos de búsqueda del más específico al más general, junto con la
// frase que el título del resultado tendrá que contener. Reducir el nombre
// amplía mucho la cobertura, y el requisito de señal peruana para frases
// cortas evita que se cuelen homónimos de otras cocinas.
function consultasPara(nombre, categoriaSlug) {
  const contenido = tokens(nombre);
  const nucleo = contenido.filter((t) => !MODIFICADORES.has(t));
  const base = nucleo.length > 0 ? nucleo : contenido;

  // Frases candidatas, de la más específica a la más general. Lo que NO se
  // puede hacer es reducir a una palabra genérica: al permitirlo, seis recetas
  // distintas ("Pan con tamal", "Pan con pavo", "Pan con huevo frito"...)
  // terminaron todas con la misma foto titulada "pan". Por eso la reducción
  // conserva las palabras distintivas y descarta las de categoría.
  const distintivas = base.filter((t) => !GENERICOS.has(t));

  const frases = [];
  const agregar = (arr) => {
    const f = arr.join(' ');
    if (f && !frases.includes(f)) frases.push(f);
  };
  agregar(contenido);
  agregar(base);
  agregar(distintivas);
  if (distintivas.length > 2) agregar(distintivas.slice(0, 2));

  // Dos variantes por frase alcanzan: agregar el sufijo largo casi nunca
  // aportaba un resultado nuevo y triplicaba el tiempo de las que no matchean.
  const intentos = [];
  for (const frase of frases) {
    intentos.push({ consulta: `${frase} peru`, objetivo: frase });
    intentos.push({ consulta: frase, objetivo: frase });
  }
  return intentos;
}

async function descargarYRedimensionar(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`descarga ${r.status}`);
  const buffer = Buffer.from(await r.arrayBuffer());

  // cover recorta al centro para que todas queden con la misma proporción y
  // las tarjetas del listado no se vean desparejas.
  const salida = await sharp(buffer)
    .resize(ANCHO, ALTO, { fit: 'cover', position: 'attention' })
    .webp({ quality: CALIDAD })
    .toBuffer();

  const meta = await sharp(salida).metadata();
  return { buffer: salida, ancho: meta.width, alto: meta.height };
}

const dormir = (ms) => new Promise((res) => setTimeout(res, ms));

// ----------------------------------------------------------------- proceso

async function obtenerConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const ruta = path.resolve(root, '..', 'Huebito_API', '.env');
  const contenido = await readFile(ruta, 'utf-8');
  const linea = contenido.split(/\r?\n/).find((l) => l.trimStart().startsWith('DATABASE_URL='));
  return linea.slice(linea.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

// idleTimeoutMillis bajo para que el pool cierre sus conexiones antes de que
// Neon las corte por su cuenta, que es lo que reventaba el proceso.
const pool = new Pool({
  connectionString: await obtenerConnectionString(),
  max: 2,
  idleTimeoutMillis: 5000,
});

// Cuando Neon cierra un socket que el pool tenía en reposo, ese cliente emite
// un evento 'error'. Sin este manejador, Node lo trata como error no atrapado
// y mata el proceso a mitad del recorrido, aunque la consulta siguiente
// habría funcionado. El reintento de consultar() no alcanza para esto porque
// el fallo no viene de una consulta en curso.
pool.on('error', (error) => {
  console.log(`        (conexion en reposo cerrada por el servidor: ${error.message})`);
});

// El recorrido completo tarda bastante y Neon cierra la conexión si se la
// mantiene tomada todo ese tiempo. En lugar de retener un client, se pide una
// conexión por consulta al pool y se reintenta si se cayó en ese momento.
async function consultar(sql, params = [], intentos = 4) {
  for (let intento = 1; ; intento += 1) {
    try {
      return await pool.query(sql, params);
    } catch (error) {
      if (intento >= intentos) throw error;
      console.log(`        (reintentando consulta tras "${error.message}")`);
      await new Promise((r) => setTimeout(r, 1500 * intento));
    }
  }
}

let conImagen = 0;
let sinImagen = 0;
const fallidas = [];

// Si dos recetas reciben la misma foto, el listado se ve como un error. Se
// registra cada origen ya usado para no repetirlo.
//
// Importante: este conjunto se precarga con lo que ya hay en la base. Cuando
// solo se llenaba durante la corrida, al reanudar el proceso volvía a estar
// vacío y varias recetas terminaban compartiendo la misma foto entre corridas
// distintas ("Seco de Pollo" quedó con la foto de "Pollo a la Brasa").
const urlsUsadas = new Set();

async function precargarUrlsUsadas() {
  const { rows } = await consultar(
    'SELECT DISTINCT imagen_fuente FROM recetas WHERE imagen_fuente IS NOT NULL'
  );
  for (const fila of rows) urlsUsadas.add(fila.imagen_fuente);
  return rows.length;
}

try {
  const filtros = ['1=1'];
  if (!REHACER) filtros.push('r.imagen_datos IS NULL');
  if (CATEGORIA) filtros.push(`c.slug = '${CATEGORIA.replace(/'/g, "''")}'`);

  const { rows: recetas } = await consultar(
    `SELECT r.id, r.nombre, c.slug AS categoria
       FROM recetas r JOIN categorias c ON c.id = r.categoria_id
      WHERE ${filtros.join(' AND ')}
      ORDER BY r.id`
  );

  const yaUsadas = await precargarUrlsUsadas();
  if (yaUsadas > 0) console.log(`(${yaUsadas} fotos ya en uso; no se van a repetir)
`);

  const objetivo = recetas.slice(0, LIMITE === Infinity ? undefined : LIMITE);
  console.log(`Recetas a procesar: ${objetivo.length}${DRY ? '  (modo --dry, no escribe)' : ''}\n`);

  for (const [i, receta] of objetivo.entries()) {
    const prefijo = `[${String(i + 1).padStart(3)}/${objetivo.length}] ${receta.nombre}`;
    let elegido = null;

    for (const { consulta, objetivo } of consultasPara(receta.nombre, receta.categoria)) {
      const candidatos = [];
      try {
        candidatos.push(...(await buscarEnCommons(consulta)));
      } catch { /* seguimos con la otra fuente */ }

      elegido = elegirCandidato(objetivo, candidatos);
      if (elegido) { elegido.query = consulta; break; }

      try {
        candidatos.push(...(await buscarEnOpenverse(consulta)));
      } catch { /* ignoramos */ }

      elegido = elegirCandidato(objetivo, candidatos);
      if (elegido) { elegido.query = consulta; break; }

      await dormir(120);
    }

    if (!elegido) {
      sinImagen += 1;
      fallidas.push(receta.nombre);
      console.log(`${prefijo}\n        sin imagen con licencia usable`);
      continue;
    }

    try {
      const img = await descargarYRedimensionar(elegido.urlDescarga);

      if (!DRY) {
        await consultar(
          `UPDATE recetas SET
             imagen_datos = $1, imagen_mime = 'image/webp',
             imagen_ancho = $2, imagen_alto = $3, imagen_bytes = $4,
             imagen_fuente = $5, imagen_autor = $6, imagen_licencia = $7, imagen_query = $8,
             imagen_titulo = $9
           WHERE id = $10`,
          [img.buffer, img.ancho, img.alto, img.buffer.length,
           elegido.urlPagina, elegido.autor?.slice(0, 300) || null, elegido.licencia, elegido.query,
           elegido.titulo?.slice(0, 300) || null, receta.id]
        );
      }

      urlsUsadas.add(elegido.urlDescarga);
      if (elegido.urlPagina) urlsUsadas.add(elegido.urlPagina);
      conImagen += 1;
      console.log(
        `${prefijo}\n        ${(img.buffer.length / 1024).toFixed(0)} KB  ${elegido.licencia}  ` +
        `[${elegido.fuenteApi}, score ${elegido.score.toFixed(2)}]  ${elegido.titulo.slice(0, 55)}`
      );
    } catch (error) {
      sinImagen += 1;
      fallidas.push(`${receta.nombre} (${error.message})`);
      console.log(`${prefijo}\n        falló la descarga: ${error.message}`);
    }

    await dormir(250); // cortesía con las APIs públicas
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Con imagen: ${conImagen}    Sin imagen: ${sinImagen}`);
  if (fallidas.length) {
    console.log(`\nSin imagen (${fallidas.length}):`);
    console.log(fallidas.map((f) => `  - ${f}`).join('\n'));
  }
} finally {
  await pool.end();
}
