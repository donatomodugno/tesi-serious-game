import { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Flex, Table, ScrollArea, Button, Title, Text } from '@mantine/core'
import { BpmnViewer } from './'
import { BpmnModdle } from 'bpmn-moddle'
import { diff } from 'bpmn-js-differ'
import API from '../API'

function DiffView({bpmn_ex, bpmn_res, w='50%'}) {
  return <Flex w={w} direction="column">
    <BpmnViewer bpmn={bpmn_ex} h="50%"/>
    <BpmnViewer bpmn={bpmn_res} h="50%"/>
  </Flex>
}

function DiffList({ex, res, logged, w='50%'}) {
  const [changes, setChanges] = useState({})
  const [score, setScore] = useState(res.score || 50)

  const findChanges = async () => {
    const moddle = new BpmnModdle()
    const def_ex = (await moddle.fromXML(ex.bpmn)).rootElement
    const def_res = (await moddle.fromXML(res.bpmn)).rootElement
    const diffs = diff(def_ex, def_res)
    setChanges(diffs)
    let temp_score = score
    Object.values(diffs._changed).map(() => temp_score -= 1)
    Object.values(diffs._removed).map(() => temp_score -= 1.5)
    Object.values(diffs._layoutChanged).map(() => {})
    Object.values(diffs._added).map(() => temp_score -= 0.5)
    setScore(temp_score)
  }

  useEffect(() => {
    findChanges()
  }, [])

  return <Flex w={w} direction="column">
    <ScrollArea h="70%" type="always">
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Th>Change</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Score</Table.Th>
          </Table.Tr>
          {changes._changed && Object.values(changes._changed).map((val, k) => <Table.Tr key={k}>
            <Table.Th c="yellow">Changed</Table.Th>
            <Table.Td>{(val.$type || val.model.$type).slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
            <Table.Td c="red">-1</Table.Td>
          </Table.Tr>)}
          {changes._removed && Object.values(changes._removed).map((val, k) => <Table.Tr key={k}>
            <Table.Th c="red">Removed</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
            <Table.Td c="red">-1.5</Table.Td>
          </Table.Tr>)}
          {changes._layoutChanged && Object.values(changes._layoutChanged).map((val, k) => <Table.Tr key={k}>
            <Table.Th c="blue">Diff. layout</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
            <Table.Td c="red">0</Table.Td>
          </Table.Tr>)}
          {changes._added && Object.values(changes._added).map((val, k) => <Table.Tr key={k}>
            <Table.Th c="green">Added</Table.Th>
            <Table.Td>{val.$type.slice(5)}</Table.Td>
            <Table.Td>{val.name}</Table.Td>
            <Table.Td c="red">-0.5</Table.Td>
          </Table.Tr>)}
        </Table.Tbody>
      </Table>
    </ScrollArea>
    <Flex direction="column" h="30%" gap={2} justify="space-evenly" align="center" style={{borderTop:'1px solid grey'}}>
      <div>Player: <b>{res.player}</b></div>
      <Title order={3}>Total score: {score}</Title>
      <Flex gap="md">
        <Link to="/home">
          <Button color="green">Close exercise</Button>
        </Link>
        <Link to={'/play/'+ex.id}>
          <Button color="green">Try again</Button>
        </Link>
      </Flex>
      {logged && <Link to={'/edit/'+ex.id}>
        <Button color="green">Edit exercise</Button>
      </Link>}
    </Flex>
  </Flex>
}

function Results({logged}) {
  const [page, setPage] = useState('loading')
  const [exercise, setExercise] = useState(null)
  const [result, setResult] = useState(null)
  const {ex_id, res_id} = useParams()
  
  const load = async () => {
    const ex = await API.getExercise(ex_id)
    const res = await API.getResult(res_id)
    setExercise(ex)
    setResult(res)
    if(!ex || !res) setPage('invalid')
    else setPage('loaded')
  }
  
    useEffect(() => {
      load()
    }, [])

  return <>
    {page=='invalid' && <Navigate to="/"/>}
    {page=='loaded' && <Flex w="100%" h="92%">
      <DiffList w="30%" ex={exercise} res={result} logged={logged}/>
      <Flex w="2%" style={{borderLeft:'1px solid grey'}} direction="column" justify="space-around">
        <Text style={{rotate:'-90deg'}}>Exercise&nbsp;solution</Text>
        <Text style={{rotate:'-90deg'}}>Your&nbsp;solution</Text>
      </Flex>
      <DiffView w="68%" bpmn_ex={exercise.bpmn} bpmn_res={result.bpmn}/>
    </Flex>}
  </>
}

export default Results