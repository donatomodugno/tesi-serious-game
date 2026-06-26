import { useEffect, useRef } from 'react'
import { Flex } from '@mantine/core'
import { default as Viewer } from 'bpmn-js/lib/NavigatedViewer'
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
    </bpmn:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn:definitions>
`

function BpmnViewer({bpmn, w='100%', h='300'}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const initializeCanvas = async () => {
    await bpmnModelerRef.current.importXML(bpmn || emptyBpmnXML)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport', 'auto')//.zoom('center')
    // canvas.viewbox({x: 100, y: 50, width: 300, height: 300})
  }

  useEffect(() => {
    bpmnModelerRef.current = new Viewer({
      container: containerRef.current,
    })
    initializeCanvas()
    return () => {
      if(bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy()
      }
    }
  }, [bpmn])

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
  </Flex>
}

export default BpmnViewer