import { useState, useEffect, useRef } from 'react'
import { Flex } from '@mantine/core'
// import { fromBPMN } from 'bpmn-js'
import { default as Viewer } from 'bpmn-js/lib/NavigatedViewer'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import API from '../API'
// import mergeBpmn from './BpmnMerger'
// import {mergeMultipleBpmnXml} from './BpmnMultiMerger'
// import { parseXml, serializeXml, mergeBpmnXml } from './BpmnCustom'
import mergeBpmnXML from './BpmnModdle'
import ex_bpmn from '../assets/empty.bpmn?raw'

function BpmnCards({bpmn, w='100%', h='100%'}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)
  const [cards, setCards] = useState([])

  const initializeCanvas = async () => {
    await bpmnModelerRef.current.importXML(bpmn || ex_bpmn)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport')
  }

  const loadCards = async () => {
    setCards((await API.getCards()).filter(c => c.type=='bpmn' && c.bpmn!=''))
    // console.log(serializeXml(parseXml(ex_bpmn)))
    console.log(await mergeBpmnXML(ex_bpmn, ex_bpmn))
  }

  useEffect(() => {
    bpmnModelerRef.current = new Viewer({
      container: containerRef.current,
    })
    initializeCanvas()
    loadCards()
    return () => {
      if(bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy()
      }
    }
  }, [])

  return <Flex direction="column" w={w} h={h}>
    <Flex>
      {cards.map((c, k) => <button key={k} onClick={async () => {
        await bpmnModelerRef.current.importXML((await bpmnModelerRef.current.saveXML({format: false})) + c.bpmn)
        // await bpmnModelerRef.current.importXML(mergeMultipleBpmnXml([await bpmnModelerRef.current.saveXML({format: false}), c.bpmn]))
        // const currentXML = (await bpmnModelerRef.current.saveXML({format: false})).xml
        const merged = await mergeBpmnXML(currentXML, c.bpmn)
        console.log('merged:',merged)
        await bpmnModelerRef.current.importXML(merged)
      }}>{c.name}</button>)}
    </Flex>
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

export default BpmnCards