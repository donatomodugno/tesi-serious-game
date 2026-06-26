/**
 * Fonde due stringhe XML BPMN, prevenendo collisioni di ID.
 * @param {string} xmlString1 - Il diagramma base
 * @param {string} xmlString2 - Il diagramma da aggiungere
 * @param {number} offsetX - Spostamento orizzontale del diagramma aggiunto
 * @param {number} offsetY - Spostamento verticale del diagramma aggiunto
 * @param {string} idSuffix - Suffisso da aggiungere a tutti gli ID del secondo file
 * @returns {string} - L'XML fuso
 */
function mergeBpmn(xmlString1, xmlString2, offsetX = 1000, offsetY = 0, idSuffix = '_merged') {
    const parser = new DOMParser()
    const doc1 = parser.parseFromString(xmlString1, 'application/xml')
    const doc2 = parser.parseFromString(xmlString2, 'application/xml')

    const definitions1 = doc1.documentElement
    const allElements2 = doc2.getElementsByTagName('*')

    // --- FASE 1: Mappatura e Modifica degli ID base ---
    const idMap = {} // Dizionario per salvare { 'Vecchio_ID': 'Nuovo_ID' }

    for(let i=0; i<allElements2.length; i++) {
        const el = allElements2[i]
        if (el.hasAttribute('id')) {
            const oldId = el.getAttribute('id')
            const newId = oldId + idSuffix // es. 'StartEvent_1' diventa 'StartEvent_1_merged'
            
            el.setAttribute('id', newId)
            idMap[oldId] = newId
        }
    }

    // --- FASE 2: Aggiornamento dei Riferimenti (Attributi e Nodi di Testo) ---
    // Lista dei principali attributi BPMN/DI che contengono riferimenti a ID
    const refAttributes = [
        'sourceRef', 'targetRef', 'bpmnElement', 
        'attachedToRef', 'default', 'messageRef', 'errorRef'
    ];

    for (let i = 0; i < allElements2.length; i++) {
        const el = allElements2[i]

        // A. Controllo sugli attributi
        for (const attr of refAttributes) {
            if (el.hasAttribute(attr)) {
                const oldRef = el.getAttribute(attr)
                if (idMap[oldRef]) {
                    el.setAttribute(attr, idMap[oldRef])
                }
            }
        }

        // B. Controllo sui nodi di testo (incoming / outgoing)
        // Usiamo localName per ignorare i prefissi (es. cattura sia <incoming> che <bpmn:incoming>)
        const tagName = el.localName
        if (tagName === 'incoming' || tagName === 'outgoing') {
            const oldText = el.textContent.trim()
            if (idMap[oldText]) {
                el.textContent = idMap[oldText]
            }
        }
    }

    // --- FASE 3: Importazione della Logica nel Documento 1 ---
    const processes = doc2.getElementsByTagNameNS('*', 'process')
    for (let i = 0; i < processes.length; i++) {
        const importedProcess = doc1.importNode(processes[i], true)
        definitions1.appendChild(importedProcess)
    }

    // --- FASE 4: Importazione e Traslazione della Grafica (DI) ---
    const diagrams = doc2.getElementsByTagNameNS('*', 'BPMNDiagram')
    for (let i = 0; i < diagrams.length; i++) {
        const diagramNode = doc1.importNode(diagrams[i], true)
        
        // Sposta i Bounds (Forme)
        const bounds = diagramNode.getElementsByTagNameNS('*', 'Bounds')
        for (let j = 0; j < bounds.length; j++) {
            const x = parseFloat(bounds[j].getAttribute('x'))
            const y = parseFloat(bounds[j].getAttribute('y'))
            bounds[j].setAttribute('x', x + offsetX)
            bounds[j].setAttribute('y', y + offsetY)
        }

        // Sposta i Waypoints (Frecce)
        const waypoints = diagramNode.getElementsByTagNameNS('*', 'waypoint')
        for (let j = 0; j < waypoints.length; j++) {
            const x = parseFloat(waypoints[j].getAttribute('x'))
            const y = parseFloat(waypoints[j].getAttribute('y'))
            waypoints[j].setAttribute('x', x + offsetX)
            waypoints[j].setAttribute('y', y + offsetY)
        }

        definitions1.appendChild(diagramNode)
    }

    // --- FASE 5: Serializzazione e Ritorno ---
    const serializer = new XMLSerializer()
    return serializer.serializeToString(doc1)
}

export default mergeBpmn