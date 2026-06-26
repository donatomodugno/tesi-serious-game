/**
 * bpmnMerger.js
 * Utility per il merge di più diagrammi BPMN in un unico canvas bpmn.js
 *
 * Funzionalità:
 *  - Rinomina tutti gli ID del secondo (e successivi) diagrammi per evitare collisioni
 *  - Applica un offset X/Y agli elementi del secondo diagramma
 *  - Calcola automaticamente l'offset in base al bounding box del primo diagramma
 *  - Supporta merge di N diagrammi in cascata
 */

// ─────────────────────────────────────────────────────────
// 1. COSTANTI E CONFIGURAZIONE
// ─────────────────────────────────────────────────────────

const DEFAULT_GAP = 80; // px di gap orizzontale tra i diagrammi

// ─────────────────────────────────────────────────────────
// 2. UTILITÀ XML
// ─────────────────────────────────────────────────────────

/**
 * Parsa una stringa XML e restituisce un Document DOM.
 * @param {string} xmlString
 * @returns {Document}
 */
function parseXML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if(parseError) {
    throw new Error(`Errore nel parsing XML: ${parseError.textContent}`)
  }
  return doc
}

/**
 * Serializza un Document DOM in stringa XML.
 * @param {Document} doc
 * @returns {string}
 */
function serializeXML(doc) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

// ─────────────────────────────────────────────────────────
// 3. GESTIONE ID - evita collisioni tra diagrammi
// ─────────────────────────────────────────────────────────

/**
 * Raccoglie tutti gli ID presenti in un documento BPMN.
 * @param {Document} doc
 * @returns {Set<string>}
 */
function collectIds(doc) {
  const ids = new Set();
  doc.querySelectorAll('[id]').forEach(el => ids.add(el.getAttribute('id')));
  return ids;
}

/**
 * Genera un prefisso univoco che non collida con gli ID esistenti.
 * @param {Set<string>} existingIds
 * @param {string} [base='d']
 * @returns {string}
 */
function generateUniquePrefix(existingIds, base = 'd') {
  let counter = 1;
  while ([...existingIds].some(id => id.startsWith(`${base}${counter}_`))) {
    counter++;
  }
  return `${base}${counter}_`;
}

/**
 * Rinomina tutti gli ID (e i riferimenti ad essi) in un documento BPMN clonato.
 *
 * Strategia:
 *  1. Mappa vecchi ID → nuovi ID con prefisso
 *  2. Sostituisce gli attributi `id`
 *  3. Sostituisce tutti gli attributi che referenziano vecchi ID
 *     (sourceRef, targetRef, bpmnElement, processRef, …)
 *  4. Sostituisce anche i riferimenti testuali (es. flowNodeRef in lane)
 *
 * @param {Document} doc         - documento da modificare (verrà clonato internamente)
 * @param {string}   prefix      - prefisso da anteporre a ogni ID
 * @returns {Document}           - documento con ID rinominati
 */
function remapIds(doc, prefix) {
  // Lavoriamo su una copia per non mutare l'originale
  const clone = doc.cloneNode(true);

  // Attributi che contengono riferimenti a singoli ID
  const REF_ATTRS = [
    'sourceRef', 'targetRef', 'processRef', 'bpmnElement',
    'calledElement', 'attachedToRef', 'cancelActivityRef',
    'dataStoreRef', 'itemSubjectRef', 'operationRef',
    'messageRef', 'escalationRef', 'errorRef', 'signalRef',
    'correlationPropertyRef', 'dataInputRef', 'dataOutputRef',
  ];

  // Attributi che contengono liste di ID separati da spazio
  const REF_LIST_ATTRS = ['flowNodeRef', 'incoming', 'outgoing'];

  // 1. Mappa vecchi → nuovi ID
  const idMap = new Map();
  clone.querySelectorAll('[id]').forEach(el => {
    const oldId = el.getAttribute('id');
    const newId = prefix + oldId;
    idMap.set(oldId, newId);
  });

  // 2. Aggiorna attributo `id`
  clone.querySelectorAll('[id]').forEach(el => {
    const oldId = el.getAttribute('id');
    el.setAttribute('id', idMap.get(oldId));
  });

  // 3. Aggiorna attributi riferimento singolo
  REF_ATTRS.forEach(attr => {
    clone.querySelectorAll(`[${attr}]`).forEach(el => {
      const oldRef = el.getAttribute(attr);
      if (idMap.has(oldRef)) {
        el.setAttribute(attr, idMap.get(oldRef));
      }
    });
  });

  // 4. Aggiorna attributi riferimento lista
  REF_LIST_ATTRS.forEach(attr => {
    clone.querySelectorAll(`[${attr}]`).forEach(el => {
      const refs = el.getAttribute(attr).split(/\s+/);
      const newRefs = refs.map(r => idMap.get(r) ?? r);
      el.setAttribute(attr, newRefs.join(' '));
    });
  });

  // 5. Aggiorna i text node con ID (es. <flowNodeRef>Task_1</flowNodeRef>)
  const walker = clone.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const trimmed = node.textContent.trim();
    if (idMap.has(trimmed)) {
      node.textContent = node.textContent.replace(trimmed, idMap.get(trimmed));
    }
  }

  return clone;
}

// ─────────────────────────────────────────────────────────
// 4. BOUNDING BOX - per calcolare l'offset automatico
// ─────────────────────────────────────────────────────────

/**
 * Calcola il bounding box (minX, minY, maxX, maxY) di tutti gli Shape
 * nel piano di un documento BPMN (namespace bpmndi).
 *
 * @param {Document} doc
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number }}
 */
function getBoundingBox(doc) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  // Cerchiamo sia con namespace esplicito che senza (per compatibilità con vari serializzatori)
  const shapes = [
    ...doc.getElementsByTagNameNS('http://www.omg.org/spec/BPMN/20100524/DI', 'BPMNShape'),
    ...doc.querySelectorAll('BPMNShape'),
  ]

  shapes.forEach(shape => {
    // <dc:Bounds> o <Bounds>
    const bounds =
      shape.getElementsByTagNameNS('http://www.omg.org/spec/DD/20100524/DC', 'Bounds')[0] ||
      shape.querySelector('Bounds')
    if(!bounds) return

    const x = parseFloat(bounds.getAttribute('x') || 0)
    const y = parseFloat(bounds.getAttribute('y') || 0)
    const w = parseFloat(bounds.getAttribute('width') || 0)
    const h = parseFloat(bounds.getAttribute('height') || 0)

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + w)
    maxY = Math.max(maxY, y + h)
  })

  if(!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { minX, minY, maxX, maxY }
}

// ─────────────────────────────────────────────────────────
// 5. OFFSET - trasla tutti gli elementi grafici
// ─────────────────────────────────────────────────────────

/**
 * Applica un offset (dx, dy) a tutti gli elementi grafici di un documento BPMN.
 * Modifica in-place il documento clonato.
 *
 * Elementi modificati:
 *  - BPMNShape → Bounds[x, y]
 *  - BPMNEdge  → waypoint[x, y]
 *  - Label     → Bounds[x, y]
 *
 * @param {Document} doc
 * @param {number} dx
 * @param {number} dy
 * @returns {Document}
 */
function applyOffset(doc, dx, dy) {
  if(dx==0 && dy==0) return doc

  const clone = doc.cloneNode(true)

  // BPMNShape - Bounds
  const allBounds = [
    ...clone.getElementsByTagNameNS('http://www.omg.org/spec/DD/20100524/DC', 'Bounds'),
    ...clone.querySelectorAll('Bounds'),
  ];

  // Usiamo un Set per evitare di processare lo stesso nodo due volte
  const seen = new WeakSet();
  allBounds.forEach(bounds => {
    if(seen.has(bounds)) return
    seen.add(bounds)
    bounds.setAttribute('x', parseFloat(bounds.getAttribute('x') || 0) + dx)
    bounds.setAttribute('y', parseFloat(bounds.getAttribute('y') || 0) + dy)
  })

  // BPMNEdge - waypoint
  const allWaypoints = [
    ...clone.getElementsByTagNameNS('http://www.omg.org/spec/DD/20100524/DI', 'waypoint'),
    ...clone.querySelectorAll('waypoint'),
  ]

  const seenWp = new WeakSet()
  allWaypoints.forEach(wp => {
    if (seenWp.has(wp)) return
    seenWp.add(wp)
    wp.setAttribute('x', parseFloat(wp.getAttribute('x') || 0) + dx)
    wp.setAttribute('y', parseFloat(wp.getAttribute('y') || 0) + dy)
  })

  return clone
}

// ─────────────────────────────────────────────────────────
// 6. MERGE - unisce due documenti BPMN
// ─────────────────────────────────────────────────────────

/**
 * Esegue il merge di due documenti BPMN XML.
 *
 * @param {string} baseXml      - XML del diagramma base (nel canvas)
 * @param {string} secondXml    - XML del diagramma da aggiungere
 * @param {object} [options]
 * @param {number} [options.offsetX]  - offset X manuale (px); se omesso, calcolato auto
 * @param {number} [options.offsetY]  - offset Y manuale (px); default 0
 * @param {number} [options.gap]      - gap orizzontale automatico (default 80px)
 * @returns {string}            - XML risultante dal merge
 */
function mergeBpmnXml(baseXml, secondXml, options = {}) {
  const { offsetY = 0, gap = DEFAULT_GAP } = options;

  // 1. Parsing
  const baseDoc   = parseXML(baseXml);
  const secondDoc = parseXML(secondXml);

  // 2. Calcola offset X automatico se non fornito
  const baseBB   = getBoundingBox(baseDoc);
  const secondBB = getBoundingBox(secondDoc);

  const offsetX = options.offsetX !== undefined
    ? options.offsetX
    : baseBB.maxX + gap - secondBB.minX;

  // 3. Rinomina gli ID del secondo diagramma per evitare collisioni
  const existingIds = collectIds(baseDoc);
  const prefix      = generateUniquePrefix(existingIds);
  const renamedDoc  = remapIds(secondDoc, prefix);

  // 4. Applica l'offset agli elementi grafici
  const shiftedDoc = applyOffset(renamedDoc, offsetX, offsetY);

  // 5. Estrai i nodi da fondere nel documento base

  // Namespace comuni in BPMN 2.0
  const BPMN2_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
  const BPMNDI_NS = 'http://www.omg.org/spec/BPMN/20100524/DI';

  // Trova l'elemento <definitions> base
  const baseDefs = baseDoc.documentElement;

  // Trova il <process> del secondo diagramma e aggiungi i suoi figli al <process> base
  // (se esistono più process, li aggiungiamo tutti)
  const baseProcess = baseDefs.querySelector('process') ||
    baseDefs.getElementsByTagNameNS(BPMN2_NS, 'process')[0];

  const secondProcesses = [
    ...shiftedDoc.getElementsByTagNameNS(BPMN2_NS, 'process'),
    ...shiftedDoc.querySelectorAll('process'),
  ];

  // Rimuoviamo duplicati (vedi applyOffset con querySelectorAll + getElementsByTagNameNS)
  const uniqueProcesses = [...new Map(secondProcesses.map(p => [p, p])).keys()];

  uniqueProcesses.forEach(proc => {
    if (baseProcess) {
      // Aggiungi i figli del process del secondo diagramma al process base
      [...proc.childNodes].forEach(child => {
        const imported = baseDoc.importNode(child, true);
        baseProcess.appendChild(imported);
      });
    } else {
      // Nessun process base → importa il process intero
      const imported = baseDoc.importNode(proc, true);
      baseDefs.appendChild(imported);
    }
  });

  // Trova il <BPMNDiagram> base e aggiungi gli shape/edge del secondo
  const baseDiagram = baseDefs.querySelector('BPMNDiagram') ||
    baseDefs.getElementsByTagNameNS(BPMNDI_NS, 'BPMNDiagram')[0];

  const basePlane = baseDiagram
    ? (baseDiagram.querySelector('BPMNPlane') ||
       baseDiagram.getElementsByTagNameNS(BPMNDI_NS, 'BPMNPlane')[0])
    : null;

  const secondDiagrams = [
    ...shiftedDoc.getElementsByTagNameNS(BPMNDI_NS, 'BPMNDiagram'),
    ...shiftedDoc.querySelectorAll('BPMNDiagram'),
  ];

  const uniqueDiagrams = [...new Map(secondDiagrams.map(d => [d, d])).keys()];

  uniqueDiagrams.forEach(diag => {
    const plane = diag.querySelector('BPMNPlane') ||
      diag.getElementsByTagNameNS(BPMNDI_NS, 'BPMNPlane')[0];

    if (plane && basePlane) {
      [...plane.childNodes].forEach(child => {
        const imported = baseDoc.importNode(child, true);
        basePlane.appendChild(imported);
      });
    }
  });

  return serializeXML(baseDoc);
}

// ─────────────────────────────────────────────────────────
// 7. MERGE DI N DIAGRAMMI
// ─────────────────────────────────────────────────────────

/**
 * Esegue il merge di un array di XML BPMN in un unico diagramma.
 * Ogni diagramma viene affiancato orizzontalmente al precedente con il gap specificato.
 *
 * @param {string[]} xmlArray   - array di stringhe XML BPMN
 * @param {object}  [options]
 * @param {number}  [options.gap]     - gap orizzontale tra i diagrammi (default 80px)
 * @param {number}  [options.offsetY] - offset Y fisso per tutti (default 0)
 * @returns {string}            - XML risultante
 */
function mergeMultipleBpmnXml(xmlArray, options = {}) {
  if (!xmlArray || xmlArray.length === 0) {
    throw new Error('Array di diagrammi vuoto');
  }
  if (xmlArray.length === 1) return xmlArray[0];

  return xmlArray.slice(1).reduce((accXml, nextXml) => {
    return mergeBpmnXml(accXml, nextXml, options);
  }, xmlArray[0]);
}

// ─────────────────────────────────────────────────────────
// 8. INTEGRAZIONE CON bpmn.js BpmnModeler
// ─────────────────────────────────────────────────────────

/**
 * Importa e unisce più XML BPMN in un'istanza di BpmnModeler.
 *
 * Uso:
 *   const modeler = new BpmnModeler({ container: '#canvas' });
 *   await importAndMergeDiagrams(modeler, [xml1, xml2, xml3]);
 *
 * @param {import('bpmn-js/lib/Modeler').default} modeler - istanza di BpmnModeler
 * @param {string[]} xmlArray  - array di stringhe XML BPMN
 * @param {object}  [options]
 * @param {number}  [options.gap]     - gap orizzontale (default 80px)
 * @param {number}  [options.offsetY] - offset Y (default 0)
 * @returns {Promise<void>}
 */
async function importAndMergeDiagrams(modeler, xmlArray, options = {}) {
  if (!xmlArray || xmlArray.length === 0) {
    throw new Error('Nessun diagramma da importare');
  }

  const mergedXml = mergeMultipleBpmnXml(xmlArray, options);

  const { warnings } = await modeler.importXML(mergedXml);

  if (warnings && warnings.length > 0) {
    console.warn('[bpmnMerger] Avvisi durante l\'importazione:', warnings);
  }

  // Fit della vista sul contenuto
  const canvas = modeler.get('canvas');
  canvas.zoom('fit-viewport');
}

// ─────────────────────────────────────────────────────────
// 9. EXPORT
// ─────────────────────────────────────────────────────────

export {
  mergeBpmnXml,
  mergeMultipleBpmnXml,
  importAndMergeDiagrams,
  // Utilità esportate per uso avanzato
  parseXML,
  serializeXML,
  collectIds,
  generateUniquePrefix,
  remapIds,
  getBoundingBox,
  applyOffset,
}