import { BpmnModdle } from 'bpmn-moddle'
import emptyXML from '../assets/empty.bpmn?raw'


const moddle = new BpmnModdle()

// function isObject(value) {
//   return value !== null && typeof value === 'object'
// }

// function remapValue(value, idMap) {
//   // Remap single ID
//   if (typeof value === 'string') {
//     return idMap.has(value) ? idMap.get(value) : value
//   }

//   return value
// }

// /**
//  * Recursively traverses a moddle element graph and remaps any property
//  * whose value matches an old BPMN/XML id.
//  */
// function remapGraph(root, idMap) {
//   const visited = new WeakSet()

//   function walk(node) {
//     if (!isObject(node)) return
//     if (visited.has(node)) return
//     visited.add(node)

//     for (const key of Object.keys(node)) {
//       const value = node[key]

//       // Arrays: may contain id strings or nested objects
//       if (Array.isArray(value)) {
//         for (let i = 0; i < value.length; i++) {
//           const item = value[i]
//           if (typeof item === 'string') {
//             value[i] = remapValue(item, idMap)
//           } else {
//             walk(item)
//           }
//         }
//         continue
//       }

//       // Strings: maybe an id reference
//       if (typeof value === 'string') {
//         node[key] = remapValue(value, idMap)
//         continue
//       }

//       // Objects: recurse
//       if (isObject(value)) {
//         walk(value)
//       }
//     }
//   }

//   walk(root)
// }

async function mergeBpmnXML(xml1, xml2, xOffset = 0, yOffset = 0, idSuffix = '_m') {
  try {
    // const res1 = await moddle.fromXML(xml1)
    // const def1 = res1.rootElement

    // const res2 = await moddle.fromXML(xml2)
    // const def2 = res2.rootElement

    // const elementsById2 = res2.elementsById || {}

    // // Build oldId -> newId map for everything we are going to rename
    // const idMap = new Map()
    // for (const key in elementsById2) {
    //   const elem = elementsById2[key]
    //   if (elem && elem.id) {
    //     idMap.set(elem.id, elem.id + idSuffix)
    //   }
    // }

    // // 1) Rename IDs + apply offsets to DI-ish objects
    // for (const key in elementsById2) {
    //   const elem = elementsById2[key]

    //   if (!elem) continue

    //   if (elem.id && idMap.has(elem.id)) {
    //     elem.id = idMap.get(elem.id)
    //   }

    //   // Keep your original DI shift behavior
    //   if (elem.$type === 'dc:Bounds' || elem.$type === 'dc:Point') {
    //     elem.x = (elem.x || 0) + xOffset
    //     elem.y = (elem.y || 0) + yOffset
    //   }
    // }

    // // 2) Remap ALL references inside def2 graph (so relationships still point to renamed IDs)
    // remapGraph(def2, idMap)

    // // 3) Merge root elements + diagrams into def1
    // if (def2.rootElements) {
    //   def1.rootElements = def1.rootElements || []
    //   def2.rootElements.forEach(elem => def1.rootElements.push(elem))
    // }

    // if (def2.diagrams) {
    //   def1.diagrams = def1.diagrams || []
    //   def2.diagrams.forEach(diag => def1.diagrams.push(diag))
    // }

    // const { xml } = await moddle.toXML(def1)
    // return xml

    const {rootElement: definitions} = await moddle.fromXML(emptyXML)
    definitions.set('id', 'id_new')
    const bpmnProcess = moddle.create('bpmn:Process', {id: 'MyProcess_1'})
    const myTask = moddle.create('bpmn:ServiceTask', {id: 'Task_1', name: 'Execute Service'})
    definitions.get('rootElements').push(bpmnProcess)
    bpmnProcess.get('flowElements').push(myTask)
    const startEvent = moddle.create('bpmn:StartEvent', { id: 'Start_1' })
    const sequenceFlow = moddle.create('bpmn:SequenceFlow', {
      id: 'Flow_1',
      sourceRef: startEvent,
      targetRef: myTask
    })
    bpmnProcess.get('flowElements').push(startEvent, sequenceFlow)
    const { xml } = await moddle.toXML(definitions, {format: true})
    return xml
  } catch (err) {
    console.error('Error while merging xmls', err)
    throw err
  }
}


export default mergeBpmnXML

