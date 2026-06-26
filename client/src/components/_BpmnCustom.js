function parseXml(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  return doc
}

function serializeXml(doc) {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(doc)
}

function mergeBpmnXml(aXml, bXml, xOffset=1000, yOffset=0, idSuffix='_m') {
  const aDoc = parseXml(aXml)
  const bDoc = parseXml(bXml)
  // Namespace comuni in BPMN 2.0
  const BPMN20_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
  const BPMNDI_NS = 'http://www.omg.org/spec/BPMN/20100524/DI'

  const aDefs = aDoc.documentElement
  const aProcess = aDefs.querySelector('process') || aDefs.getElementsByTagNameNS(BPMN20_NS, 'process')[0]
  const bProcesses = [...new Set([
    ...bDoc.getElementsByTagNameNS(BPMN20_NS, 'process'),
    ...bDoc.querySelectorAll('process'),
  ])]


  bProcesses.forEach(proc => {
    if(aProcess) {
      // Aggiungi i figli del process del secondo diagramma al process base
      [...proc.childNodes].forEach(child => {
        const imported = aDoc.importNode(child, true)
        aProcess.appendChild(imported)
      })
    } else {
      // Nessun process base → importa il process intero
      const imported = aDoc.importNode(proc, true)
      aDefs.appendChild(imported)
    }
  })

  // Trova il <BPMNDiagram> base e aggiungi gli shape/edge del secondo
  const aDiagram = aDefs.querySelector('BPMNDiagram') || aDefs.getElementsByTagNameNS(BPMNDI_NS, 'BPMNDiagram')[0]
  const aPlane = aDiagram
    ? (aDiagram.querySelector('BPMNPlane') || aDiagram.getElementsByTagNameNS(BPMNDI_NS, 'BPMNPlane')[0])
    : null

  const bDiagrams = [...new Set([
    ...bDoc.getElementsByTagNameNS(BPMNDI_NS, 'BPMNDiagram'),
    ...bDoc.querySelectorAll('BPMNDiagram'),
  ])]

  bDiagrams.forEach(diag => {
    const plane = diag.querySelector('BPMNPlane') || diag.getElementsByTagNameNS(BPMNDI_NS, 'BPMNPlane')[0]
    if(plane && aPlane) {
      [...plane.childNodes].forEach(child => {
        const imported = aDoc.importNode(child, true)
        aPlane.appendChild(imported)
      })
    }
  })

  return serializeXml(aDoc)
}

// export default parseXml
export { parseXml, serializeXml, mergeBpmnXml }