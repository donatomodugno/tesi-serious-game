import { useState, useEffect, useRef } from 'react'
import { Flex, Table, Text } from '@mantine/core'
// import Viewer from 'bpmn-js/lib/NavigatedViewer'
import { BpmnViewer } from './'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import API from '../API'
import { BpmnModdle } from 'bpmn-moddle'
import { diff } from 'bpmn-js-differ'
import ex_a from '../assets/a.bpmn?raw'
import ex_b from '../assets/b.bpmn?raw'
import ex_c from '../assets/c.bpmn?raw'

async function loadModel(diagramXML) {
  const bpmnModdle = new BpmnModdle()
  // const {rootElement: definitionsA} = await bpmnModdle.fromXML(diagramXML)
  // const rootElement = await bpmnModdle.fromXML(diagramXML)
  // console.log(rootElement.rootElement)
  return (await bpmnModdle.fromXML(diagramXML)).rootElement
}

const definitionsA = await loadModel(ex_a)
const definitionsB = await loadModel(ex_b)

const changes = diff(definitionsA, definitionsB)

// console.log('changed', changes._changed)
// console.log('removed', changes._removed)
// console.log('diff layout', changes._layoutChanged)
// console.log('added', changes._added)

function BpmnDiff({bpmn, w='100%', h='100%'}) {
  return <Flex w={w} h={h}>
    <Flex direction="column" w="60%">
      <BpmnViewer bpmn={ex_a} h="50%"/>
      <BpmnViewer bpmn={ex_b} h="50%"/>
    </Flex>
    <Flex direction="column" w="40%">
      <Table>
        <Table.Tbody>
          {Object.values(changes._changed).map((val, k) => <Table.Tr key={k} bg="yellow">
            <Table.Th>Changed</Table.Th>
            <Table.Td>{(val.$type || val.model.$type).slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
          </Table.Tr>)}
          {Object.values(changes._removed).map((val, k) => <Table.Tr key={k} bg="red">
            <Table.Th>Removed</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
          </Table.Tr>)}
          {Object.values(changes._layoutChanged).map((val, k) => <Table.Tr key={k} bg="blue">
            <Table.Th>Diff. layout</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
          </Table.Tr>)}
          {Object.values(changes._added).map((val, k) => <Table.Tr key={k} bg="green">
            <Table.Th>Added</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
          </Table.Tr>)}
        </Table.Tbody>
      </Table>
    </Flex>
  </Flex>
}

export default BpmnDiff