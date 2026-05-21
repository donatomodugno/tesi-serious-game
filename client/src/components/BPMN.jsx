import BpmnJS from 'bpmn-js'

const xml = ``
const xml_empty = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  targetNamespace="http://bpmn.io/schema/bpmn" 
                  id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

// const viewer = new BpmnJS({
//     container: 'body',
// })
// const modeler = new BpmnJS({
//     container: 'body',
// })

// try {
//     const { warnings } = await viewer.importXML(xml_empty)
//     console.log('rendered')
// } catch(err) {
//     console.log('error rendering', err)
// }

// try {
//     const result = await modeler.saveXML({ format: true })
//     alert('Diagram exported. Check the developer tools!')
//     console.log('DIAGRAM', result.xml)
// } catch(err) {
//     console.error('could not save BPMN 2.0 diagram', err)
// }

function BPMN({}) {
    return <p>This is the BPMN diagram</p>
}

export default BPMN