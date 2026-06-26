import { useState, useEffect, useRef } from 'react'
import { Flex } from '@mantine/core'
import { BpmnModdle } from 'bpmn-moddle'
import { default as Modeler } from 'bpmn-js/lib/Modeler'
import { BpmnViewer } from './'
import provaXML from '../assets/a.bpmn?raw'
import emptyXML from '../assets/empty2.bpmn?raw'

const moddle = new BpmnModdle()
// const modeler = new Modeler({container: '#prova'})

// const addLane = async () => {
    // const {rootElement: definitions} = await moddle.fromXML(emptyXML)
    // definitions.set('id', 'id_new')
    // const bpmnProcess = moddle.create('bpmn:Process', {id: 'MyProcess_1'})
    // const myTask = moddle.create('bpmn:ServiceTask', {id: 'Task_1', name: 'Execute Service'})
    // definitions.get('rootElements').push(bpmnProcess)
    // bpmnProcess.get('flowElements').push(myTask)
    // const startEvent = moddle.create('bpmn:StartEvent', { id: 'Start_1' })
    // const sequenceFlow = moddle.create('bpmn:SequenceFlow', {
    //     id: 'Flow_1',
    //     sourceRef: startEvent,
    //     targetRef: myTask
    // })
    // bpmnProcess.get('flowElements').push(startEvent, sequenceFlow)
    // console.log(definitions)
    // const { xml } = await moddle.toXML(definitions, {format: true})
    // return xml
// }

function Prova({}) {
    const [bpmn, setBpmn] = useState(emptyXML)
    const containerRef = useRef(null)
    const modelerRef = useRef(null)

    const stampa = () => {
        if(modelerRef.current) {
            const elementRegistry = modelerRef.current.get('elementRegistry')
            console.log(elementRegistry.getAll())
        }
    }

    const addLane = async () => {
        if(modelerRef.current) {
            const elementRegistry = modelerRef.current.get('elementRegistry')
            const elementFactory = modelerRef.current.get('elementFactory')
            const modeling = modelerRef.current.get('modeling')
            // const elements = elementRegistry.getAll()

            // const myTask = moddle.create('bpmn:UserTask', {id: 'Task_1', name: 'Nuovo task programmatico'})
            // console.log(elements)

            // const parentElement = elementRegistry.get('BPMNPlane_1')
            // const businessObject = parentElement.businessObject
            // businessObject.get('extensionElements').get('values').push(myTask)
            // modeling.updateProperties(parentElement, { 
            //     extensionElements: businessObject.extensionElements 
            // })

            // const targetParent = elementRegistry.get('Process_1')
            // const newShape = modeling.createShape(
            //     { type: 'bpmn:UserTask' }, 
            //     { x: 300, y: 150 },
            //     targetParent,
            //     { attach: false }
            // )
            // elements.push(newShape)

            const process = elementRegistry.getAll().find(e => e.type=='bpmn:Process')
            const startEvent = elementRegistry.get('StartEvent_1')
            const newTask = elementFactory.createShape({type: 'bpmn:Task'})
            newTask.businessObject.name = 'provetta' // Eureka!!!
            modeling.createShape(newTask, {x: 400, y: 200}, process)
            modeling.connect(startEvent, newTask)
        }
    }

    const load = async () => {
        await modelerRef.current?.importXML(bpmn)
        const canvas = modelerRef.current.get('canvas')
        canvas.zoom('fit-viewport')
    }

    const save = async () => {
        const {xml: testo} = await modelerRef.current.saveXML({format: true})
        console.log(testo)
    }

    // useEffect(() => load, [bpmn])

    useEffect(() => {
        modelerRef.current = new Modeler({container: containerRef.current})
        load()
        return () => {
            if(modelerRef.current) modelerRef.current.destroy()
        }
    }, [])
    
    {/* <BpmnViewer bpmn={bpmn} w="80%" h="80%"/> */}
    return <Flex direction="column" w="100%" h="100%" justify="center" align="center">
        <Flex>
            <button onClick={addLane}>cambia</button>
            <button onClick={save}>esporta</button>
            <button onClick={stampa}>log</button>
        </Flex>
        <div
            ref={containerRef}
            style={{ 
                width: '100%', 
                height: '100%', 
                border: '1px solid #ccc',
                backgroundColor: '#CDF'
            }}
        />
    </Flex>
}

export default Prova