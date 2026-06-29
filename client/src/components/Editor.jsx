import { useState, useEffect, useRef } from 'react'
import { useParams, Navigate, Link } from 'react-router'
import { Flex, ScrollArea, Table, Modal,
  Title, Text, Space, Button, Fieldset,
  TextInput, Input, InputBase, Slider, ActionIcon,
  Combobox, useCombobox, Tooltip, Transition,
  Loader, SegmentedControl, NumberInput } from '@mantine/core'
import { BpmnModeler } from './'
import { default as Modeler } from 'bpmn-js/lib/Modeler'
import { default as Viewer } from 'bpmn-js/lib/Viewer'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import emptyBpmnXML from '../assets/empty2.bpmn?raw'
import '@mantine/core/styles.css'
import './Editor.css'
import './Gameboard.css'
import { Icon, bpmn_icon } from '../icons'
import API from '../API'

const panels = ['20%', '40%', '20%']
const new_card = {name: 'Card', type: 'bpmn', cost: 1, score: 0, bonus: 0, draws: 0, buys: 0, turns: 0, bpmn: ''}
const new_block = {type: 'task', text: 'New block'}
const block_types_groups = [
  {group: 'Tasks', children: [
    {value: 'task', label: <Flex align="center" gap="xs">{bpmn_icon.Task} Task</Flex>},
    {value: 'task-m', label: <Flex align="center" gap="xs">{bpmn_icon.Manual} Manual task</Flex>},
    {value: 'task-u', label: <Flex align="center" gap="xs">{bpmn_icon.User} User task</Flex>},
    {value: 'task-s', label: <Flex align="center" gap="xs">{bpmn_icon.Service} Service task</Flex>},
  ]},
  {group: 'Gateways', children: [
    {value: 'gw-and', label: <Flex align="center" gap="xs">{bpmn_icon.And} Parallel gateway</Flex>},
    {value: 'gw-or', label: <Flex align="center" gap="xs">{bpmn_icon.Or} Inclusive gateway</Flex>},
    {value: 'gw-xor', label: <Flex align="center" gap="xs">{bpmn_icon.Xor} Exclusive gateway</Flex>},
  ]},
  {group: 'Events', children: [
    {value: 'ev-msg-s', label: <Flex align="center" gap="xs">{bpmn_icon.MsgSend} Send message</Flex>},
    {value: 'ev-msg-r', label: <Flex align="center" gap="xs">{bpmn_icon.MsgRecv} Receive message</Flex>},
    {value: 'ev-timer', label: <Flex align="center" gap="xs">{bpmn_icon.Timer} Timer/Delay</Flex>},
  ]},
  {group: 'Pools', children: [
    {value: 'pool', label: <Flex align="center" gap="xs">{bpmn_icon.Pool} Pool</Flex>},
    {value: 'lane', label: <Flex align="center" gap="xs">{bpmn_icon.Lane} Lane</Flex>},
  ]},
]

function ModalDelete({opened, close, confirm, title, text, variant='light'}) {
  return <Modal
    opened={opened}
    onClose={close}
    title={title}
    overlayProps={{
      backgroundOpacity: 0.5,
      blur: 3,
    }}
    transitionProps={{transition: 'rotate-left'}}
    size="xs"
  >
    <Flex>
      <Text>{text}</Text>
    </Flex>
    <Flex justify="flex-end" gap="md" mt="xl">
      <Button color="gray" variant={variant} onClick={close}>Cancel</Button>
      <Button color="red" variant={variant} onClick={confirm}>Delete</Button>
    </Flex>
  </Modal>
}

function CardsListPanel({cards, setCards, activeCard, setActiveCard, loadCards, createCard, title}) {
  const [cardToDelete, setCardToDelete] = useState(-1)

  const addCard = async () => {
    await createCard()
    await loadCards()
    setActiveCard(cards.length)
  }

  const deleteCard = async (key) => {
    await API.deleteCard(cards[key].id)
    setCards(cards.toSpliced(key, 1))
    setActiveCard(-1)
  }
  
  useEffect(() => {
    loadCards()
  }, [])

  return <>
    <ModalDelete
      opened={cardToDelete>=0}
      close={() => setCardToDelete(-1)}
      confirm={() => {
        deleteCard(cardToDelete)
        setCardToDelete(-1)
        setActiveCard(-1)
      }}
      title={
        <Flex align="center" gap="sm">
          <Icon.Delete color="red"/>
          <Text span fw="700"> Delete card</Text>
        </Flex>
      }
      text="Are you sure to delete this card?"
    />
    <Flex id="list-panel" direction="column" gap="lg" w={panels[0]} h="100%">
      <Title ta="center" order={3} py="8" mb="20" id="title" onClick={() => setActiveCard(-1)}>{title || '<Untitled>'}</Title>
      <Button color="green" h="45" onClick={addCard} leftSection={<Icon.PlusCard color="white"/>}>Add card</Button>
      <ScrollArea.Autosize h="100%" mah="100%" type="always" scrollbars="y" offsetScrollbars="present">
        <Table verticalSpacing="sm" striped={false} highlightOnHover withTableBorder={false}>
          <Table.Tbody>
            {cards.map((c, k) => (
              <Table.Tr
                key={k}
                onClick={() => setActiveCard(k)}
                className={'list-item' + (k==activeCard ? ' active' : '')}
              >
                <Table.Td><Text>{c.name || '<Untitled card>'}</Text></Table.Td>
                <Table.Td w="45" className="trash">
                  {k==activeCard && <ActionIcon size="lg" color="green" visibility="hidden" onClick={() => setCardToDelete(k)}>
                    <Icon.Delete color="white" />
                  </ActionIcon>}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
    </Flex>
  </>
}

function EditBPMNElements({closeModal, cards, setCards, activeCard}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const initializeCanvas = async () => {
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
    await bpmnModelerRef.current.importXML(cards[activeCard].bpmn || emptyBpmnXML)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport')
  }

  const saveDiagram = async () => {
    const result = await bpmnModelerRef.current.saveXML({format: false})
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], bpmn: result.xml}))
    await API.editCard({...cards[activeCard], bpmn: result.xml})
    closeModal()
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

  return <Flex direction="column" w="100%" h="500">
    <div
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        border: '1px solid #ccc',
        backgroundColor: '#f8f9fa'
      }}
    />
    <Flex justify="center" align="center" gap="20" mt="20">
      <Button color="grey" variant="light" onClick={closeModal}>Close</Button>
      <Button color="green" variant="filled" onClick={saveDiagram}>Save</Button>
    </Flex>
  </Flex>
}

function PreviewBPMNElements({cards, activeCard}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const initializeCanvas = async () => {
    await bpmnModelerRef.current.importXML(cards[activeCard].bpmn)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport', 'auto')
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
  }, [activeCard, cards[activeCard]])

  return <Flex direction="column" w="100%" h="300" mb="50">
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

function CardEditPanel({cards, setCards, activeCard, setActiveCard, saveCard}) {
  const c_id = cards[activeCard]?.id
  const [blocks, setBlocks] = useState([])
  const [opened, setOpened] = useState(false)

  const loadBlocks = async () => {
    setBlocks(await API.getCardBlocks(cards[activeCard].id))
  }

  const addBlock = async () => {
    await API.createBlock({...new_block, c_id})
    setBlocks([...blocks, new_block])
  }

  useEffect(() => {
    if(activeCard>=0 && activeCard<cards.length)
      loadBlocks()
  }, [activeCard])
  
  const handleTitleChange = ({currentTarget: {value}}) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], name: value}))
  }

  const handleTitleBlur = async ({currentTarget: {value}}) => {
    await saveCard()
  }

  const handleTypeChange = async (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], type: value}))
    // Non posso usare "await saveCard()" perché va in concorrenza con la set dello stato
    await API.editCard({...cards[activeCard], type: value})
  }

  const handleCostChange = (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], cost: value}))
  }

  const handleCostChangeEnd = async (value) => {
    await saveCard()
  }
  // Change and ChangeEnd events written separate just to prevent too many requests

  const handleScoreChange = (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], score: value}))
  }

  const handleScoreChangeEnd = async (value) => {
    await saveCard()
  }

  const handleBonusChange = (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], bonus: value}))
  }

  const handleBonusChangeEnd = async (value) => {
    await saveCard()
  }

  return <Transition
    mounted={activeCard>=0 && activeCard<cards.length}
    transition="fade-left"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[1]} id="edit-panel">
      <Modal opened={opened} onClose={() => setOpened(false)} size="xl" title="Unsaved work will be lost" closeOnClickOutside={false}>
        <EditBPMNElements closeModal={() => setOpened(false)} cards={cards} setCards={setCards} activeCard={activeCard}/>
      </Modal>
      <Title order={3}>
        <Flex align="center" gap="sm">
          <Tooltip label="Go back to settings">
            <ActionIcon variant="outline" color="black" onClick={() => setActiveCard(-1)}>
              <Icon.Back/>
            </ActionIcon>
          </Tooltip>
          Edit card
        </Flex>
      </Title>
      <ScrollArea h="100%">
        {cards[activeCard] && <Flex direction="column" gap="md" id="edit-area">
          <Input.Wrapper label="Card type">
            <SegmentedControl
              value={cards[activeCard].type||'bpmn'}
              onChange={handleTypeChange}
              data={[
                {label: 'BPMN', value: 'bpmn'},
                {label: 'Action', value: 'action'},
                {label: 'Coins', value: 'coins'},
              ]}
              color={
                cards[activeCard].type=='bpmn' && '#E47' ||
                cards[activeCard].type=='action' && '#1AB' ||
                cards[activeCard].type=='coins' && '#FA0' ||
               'grey'
              }
              ml="10"
            />
          </Input.Wrapper>
          <TextInput
            label="Title"
            placeholder="Insert card title here"
            error={!cards[activeCard].name && 'Title can\'t be empty'}
            value={cards[activeCard].name}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            maxLength="50"
          />
          {cards[activeCard].type=='bpmn' && <>
            <Input.Wrapper label="Cost">
              <Slider
                // domain={[0.9, 8.1]}
                min={1}
                max={12}
                step={1}
                marks={[...Array(13).keys()].slice(1).map(v => ({value: v, label: v}))}
                size="lg"
                color="green"
                label={null}
                value={cards[activeCard].cost}
                onChange={handleCostChange}
                onChangeEnd={handleCostChangeEnd}
              />
            </Input.Wrapper>
            <Input.Wrapper
              label="Score (secret)"
              mt="20"
            >
              <Slider
                min={-3}
                max={6}
                step={1}
                startPointValue={0}
                marks={[...Array(10).keys()].map(v => v-3).map(v => ({value: v, label: v}))}
                size="lg"
                color={cards[activeCard].score<0 ? 'red' : 'green'}
                label={null}
                value={cards[activeCard].score}
                onChange={handleScoreChange}
                onChangeEnd={handleScoreChangeEnd}
              />
            </Input.Wrapper>
            <Button color="green" mt="40" onClick={() => setOpened(true)} leftSection={<Icon.PlusBlock color="white"/>}>
              Edit BPMN elements
            </Button>
            {cards[activeCard].bpmn && <PreviewBPMNElements cards={cards} activeCard={activeCard}/>}
          </>}
          {cards[activeCard].type=='action' && <>
            <Input.Wrapper label="Cost">
              <Slider
                min={1}
                max={12}
                step={1}
                marks={[...Array(13).keys()].slice(1).map(v => ({value: v, label: v}))}
                size="lg"
                color="green"
                label={null}
                value={cards[activeCard].cost}
                onChange={handleCostChange}
                onChangeEnd={handleCostChangeEnd}
              />
            </Input.Wrapper>
            <Input.Wrapper
              label="Bonus (or malus)"
              mt="20"
            >
              <Slider
                min={-2}
                max={3}
                step={1}
                marks={[-2, -1, 0, 1, 2, 3].map(v => ({value: v, label: v}))}
                startPointValue={0}
                size="lg"
                color={cards[activeCard].bonus<0 ? 'red' : 'green'}
                label={null}
                value={cards[activeCard].bonus}
                onChange={handleBonusChange}
                onChangeEnd={handleBonusChangeEnd}
              />
            </Input.Wrapper>
            <Flex gap="xl" mt="20">
              <NumberInput
                label="Add draws (0-3)"
                size="xl"
                labelProps={{fz: 'sm'}}
                leftSection={<Text fz="30">🃏</Text>}
                min={0}
                max={3}
                value={cards[activeCard].draws}
                onChange={(value) => setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], draws: value}))}
                onBlur={async () => { await saveCard() }}
              />
              <NumberInput
                label="Add buys (0-2)"
                size="xl"
                labelProps={{fz: 'sm'}}
                leftSection={<Text fz="30">🛒</Text>}
                min={0}
                max={2}
                value={cards[activeCard].buys}
                onChange={(value) => setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], buys: value}))}
                onBlur={async () => { await saveCard() }}
              />
              <NumberInput
                label="Add turns (0-1)"
                size="xl"
                labelProps={{fz: 'sm'}}
                leftSection={<Text fz="30">✋🏻</Text>}
                min={0}
                max={1}
                value={cards[activeCard].turns}
                onChange={(value) => setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], turns: value}))}
                onBlur={async () => { await saveCard() }}
              />
            </Flex>
          </>}
          {cards[activeCard].type=='coins' && <>
            <Text c="grey">For this type of card the editor is not available yet!</Text>
          </>}
        </Flex>}
      </ScrollArea>
    </Flex>}
  </Transition>
}

function CardPreviewPanel({cards, activeCard}) {
  return <Transition
    mounted={activeCard>=0 && activeCard<cards.length}
    transition="fade-left"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" align="center" gap="lg" w={panels[2]} id="preview-panel">
      <Title order={3} mb="20">Card preview</Title>
      {cards[activeCard] && <Flex
        direction="column" justify="center" align="center"
        id="card-preview" className={'type-'+cards[activeCard].type}
      >
        {cards[activeCard].type!='coins' && <Title ta="center" fz="xl" p="20">{cards[activeCard].name}</Title>}
        {cards[activeCard].type=='action' && <>
          {cards[activeCard].draws>0 && <Text ta="center" fz="xl">+{cards[activeCard].draws}🃏</Text>}
          {cards[activeCard].buys>0 && <Text ta="center" fz="xl">+{cards[activeCard].buys}🛒</Text>}
          {cards[activeCard].turns>0 && <Text ta="center" fz="xl">+{cards[activeCard].turns}✋🏻</Text>}
          {cards[activeCard].bonus>=0 && <Text ta="center" fz="xl" c="green">[+{cards[activeCard].bonus}🪙]</Text>}
          {cards[activeCard].bonus<0 && <Text ta="center" fz="xl" c="red">[{cards[activeCard].bonus}🪙]</Text>}
        </>}
        <Text ta="center" fz="xl" p="20">{cards[activeCard].cost+'🪙'}</Text>
      </Flex>}
    </Flex>}
  </Transition>
}

function EditBPMNSolution({closeModal, exercise, setExercise}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const init = async () => {
    await bpmnModelerRef.current.importXML(exercise.bpmn || emptyBpmnXML)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport')
  }

  const save = async () => {
    const result = await bpmnModelerRef.current.saveXML({format: false})
    setExercise({...exercise, bpmn: result.xml})
    await API.editExercise({...exercise, bpmn: result.xml})
    closeModal()
  }

  useEffect(() => {
    bpmnModelerRef.current = new Modeler({container: containerRef.current})
    init()
    return () => {
      if(bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy()
      }
    }
  }, [])

  return <Flex direction="column" w="100%" h="540">
    <div
      ref={containerRef} 
      style={{ 
        width: '100%',
        height: '100%',
        border: '1px solid #ccc',
        backgroundColor: '#f8f9fa'
      }}
    />
    <Flex justify="center" align="center" gap="20" mt="20">
      <Button color="grey" variant="light" onClick={closeModal}>Close</Button>
      <Button color="green" variant="filled" onClick={save}>Save</Button>
    </Flex>
  </Flex>
}

function PreviewBPMNSolution({exercise}) {
  const containerRef = useRef(null)
  const bpmnModelerRef = useRef(null)

  const init = async () => {
    await bpmnModelerRef.current.importXML(exercise.bpmn || emptyBpmnXML)
    const canvas = bpmnModelerRef.current.get('canvas')
    canvas.zoom('fit-viewport', 'auto')
  }

  useEffect(() => {
    bpmnModelerRef.current = new Viewer({container: containerRef.current})
    init()
    return () => {
      if(bpmnModelerRef.current) {
        bpmnModelerRef.current.destroy()
      }
    }
  }, [exercise])

  return <Flex direction="column" w="100%" h="300" mb="50">
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

function SettingsPanel({exercise, setExercise, cards, activeCard, deleteCards}) {
  const [openedModalDelete, setOpenedModalDelete] = useState(false)
  const [openedEdit, setOpenedEdit] = useState(false)
  const [difficulty, setDifficulty] = useState({})

  useEffect(() => {
    const turnsDifficulties = [
      {min: 18, max: 18, label: 'Very hard!', color: 'grape'},
      {min: 19, max: 22, label: 'Hard', color: '#F00'},
      {min: 23, max: 26, label: 'Medium', color: 'orange'},
      {min: 27, max: 30, label: 'Easy', color: 'green'},
    ]
    for(let d of turnsDifficulties) {
      if(exercise.turns>=d.min && exercise.turns<=d.max) {
        setDifficulty(d)
      }
    }
  }, [exercise.turns])

  const handleTitleChange = ({currentTarget: {value}}) => {
    setExercise({...exercise, name: value})
  }

  const handleTitleBlur = async () => {
    await API.editExercise(exercise)
  }

  const handleTurnsChange = (value) => {
    setExercise({...exercise, turns: value})
  }
  const handleTurnsChangeEnd = async (value) => {
    await API.editExercise(exercise)
  }

  return <Transition
    mounted={activeCard<0 || activeCard>=cards.length}
    transition="fade-right"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[1]} id="settings-panel">
      <Modal opened={openedEdit} onClose={() => setOpenedEdit(false)} size="90%" title="Unsaved work will be lost" closeOnClickOutside={false}>
        <EditBPMNSolution closeModal={() => setOpenedEdit(false)} exercise={exercise} setExercise={setExercise}/>
      </Modal>
      <Flex justify="space-between" w="100%">
        <Title order={3}>Exercise settings</Title>
        <Link to={'/play/'+exercise.id}>
          <Button color="green" rightSection={<Icon.Play color="white"/>}>Play test</Button>
        </Link>
      </Flex>
      <ScrollArea h="100%">
        <Flex direction="column" gap="md" id="edit-area">
          <TextInput
            label="Title"
            placeholder="Insert exercise title here"
            maxLength="40"
            error={!exercise.name && 'Title can\'t be empty'}
            value={exercise.name}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
          />
          <Input.Wrapper
            label={'Total turns: '+exercise.turns}
            error={difficulty.label || 'ciao'}
            errorProps={{c: difficulty.color, fz: 'md', fw: 600}}
          >
            <Slider
              domain={[1, 30]}
              min={18}
              max={30}
              step={1}
              marks={[18, 21, 24, 27, 30].map(v => ({value: v, label: v}))}
              size="lg"
              color={difficulty.color}
              value={exercise.turns}
              onChange={handleTurnsChange}
              onChangeEnd={handleTurnsChangeEnd}
            />
          </Input.Wrapper>
          <Button color="green" mt="40" onClick={() => setOpenedEdit(true)} leftSection={<Icon.PlusBlock color="white"/>}>
            Edit BPMN solution
          </Button>
          <PreviewBPMNSolution exercise={exercise}/>
          <Fieldset legend={<Text fz="sm" fw={600}>Stats</Text>}>
            N. of cards: {cards.length}
          </Fieldset>
          <Fieldset legend={<Text fz="sm" fw={600}>Danger zone</Text>} variant="filled" mb="80">
            <Button color="red" onClick={() => setOpenedModalDelete(true)}>Delete all cards</Button>
            <ModalDelete
              opened={openedModalDelete}
              close={() => setOpenedModalDelete(false)}
              confirm={() => {
                deleteCards()
                setOpenedModalDelete(false)
              }}
              title={
                <Flex align="center" gap="sm">
                  <Icon.Delete color="red"/>
                  <Text span fw="700"> Delete all cards</Text>
                </Flex>
              }
              text="Are you sure to delete ALL cards in this exercise?"
              variant=""
            />
          </Fieldset>
        </Flex>
      </ScrollArea>
    </Flex>}
  </Transition>
}

function Editor({}) {
  const [exercise, setExercise] = useState({})
  const [cards, setCards] = useState([])
  const [activeCard, setActiveCard] = useState(-1)
  const [page, setPage] = useState('loading')
  const {ex_id} = useParams()
  
  const loadExercise = async () => {
    const ex = await API.getExercise(ex_id)
    setExercise(ex)
    if(!ex) setPage('invalid')
    else setPage('loaded')
  }
  
  const loadCards = async () => {
    setCards(await API.getExerciseCards(ex_id))
  }

  const createCard = async () => {
    const c_id = await API.createCard({...new_card, ex_id})
    await API.createBlock({...new_block, c_id})
  }

  const saveCard = async () => {
    await API.editCard(cards[activeCard])
  }

  const deleteCards = async () => {
    await API.deleteExerciseCards(ex_id)
    loadCards()
  }

  useEffect(() => {
    loadExercise()
  }, [])

  return <>
    {page=='invalid' && <Navigate to="/"/>}
    {page=='loading' && <>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Loader color="green" size="xl"/>
      </Flex>
    </>}
    {page=='loaded' && <>
      <Flex direction="row" h="92%" gap="60">
        <CardsListPanel
          title={exercise.name}
          cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard}
          loadCards={loadCards} createCard={createCard}
        />
        <CardEditPanel
          cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard}
          saveCard={saveCard}
        />
        <CardPreviewPanel
          cards={cards} activeCard={activeCard}
        />
        <SettingsPanel
          exercise={exercise} setExercise={setExercise}
          cards={cards} activeCard={activeCard}
          deleteCards={deleteCards}
        />
      </Flex>
    </>}
  </>
}

export default Editor