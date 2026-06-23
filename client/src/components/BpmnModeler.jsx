import { useEffect, useRef } from 'react'
import { Flex } from '@mantine/core'
import { default as Modeler } from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

const emptyBpmnXML = `
  <?xml version="1.0" encoding="UTF-8"?>
  <bpmn:definitions
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
    targetNamespace="http://bpmn.io/schema/bpmn" 
    id="Definitions_1"
  >
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
  </bpmn:definitions>
`

function BpmnModeler({showControls=false, w='100%', h='500'}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const exportDiagram = async () => {
    try {
      const result = await bpmnModelerRef.current.saveXML({format: true})
      alert('Diagram exported. Check the developer tools!')
      console.log(result.xml)
    } catch(err) {
      console.error('could not save BPMN 2.0 diagram', err)
    }
  }

  const initializeCanvas = async () => {
    try {
      await bpmnModelerRef.current.importXML(emptyBpmnXML)
      const canvas = bpmnModelerRef.current.get('canvas')
      canvas.zoom('fit-viewport')
    } catch(err) {
      console.error('Error while loading BPMN diagram', err)
    }
  }

  useEffect(() => {
    bpmnModelerRef.current = new Modeler({
      container: containerRef.current,
    })
    initializeCanvas()
    return () => {
      if(bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy()
      }
    }
  }, [])

  return <Flex direction="column" w={w} h={h}>
    <div
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        border: '1px solid #ccc',
        backgroundColor: '#f8f9fa'
      }}
    />
    {showControls && <span>
      <button onClick={exportDiagram}>export</button>
    </span>}
  </Flex>
}

export default BpmnModeler