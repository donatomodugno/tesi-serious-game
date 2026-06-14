import { useState, useEffect, useRef } from 'react'
import { useParams, Navigate, Link } from 'react-router'
import { Flex, ScrollArea, Table, Modal,
  Title, Text, Space, Button, Fieldset,
  TextInput, Input, InputBase, Slider, ActionIcon,
  Combobox, useCombobox, Tooltip, Transition, 
  Loader, SegmentedControl} from '@mantine/core'
import '@mantine/core/styles.css'
import './Editor.css'
import './Gameboard.css'
import { Icon, bpmn_icon } from '../icons'
import API from '../API'

const panels = ['20%', '40%', '20%']
const new_card = {name: 'Card', type: 'bpmn', cost: 1}
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
      <Title ta="center" order={3} py="10" id="title" onClick={() => setActiveCard(-1)}>{title || '<Untitled>'}</Title>
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

function EditBlock({blocks, setBlocks, index, allowDelete}) {
  const combobox = useCombobox()

  function findLabel(value) {
    for(let g of block_types_groups) {
      for(let c of g.children) {
        if(c.value==value) return c.label
      }
    }
    return 'Invalid value'
  }

  const saveBlock = async () => {
    await API.editBlock(blocks[index])
  }

  const deleteBlock = async () => {
    await API.deleteBlock(blocks[index].id)
    setBlocks(blocks.toSpliced(index, 1))
  }

  const handleTypeSubmit = async (type) => {
    combobox.closeDropdown()
    setBlocks(blocks.toSpliced(index, 1, {...blocks[index], type}))
    await saveBlock()
  }

  const handleTextChange = ({currentTarget: {value}}) => {
    setBlocks(blocks.toSpliced(index, 1, {...blocks[index], text: value}))
  }

  const handleTextBlur = async ({currentTarget: {value}}) => {
    await saveBlock()
  }

  return <Fieldset
    legend={
      <Flex justify="space-between">
        Block
        <Tooltip
          withArrow
          label="Cards should have at least one block"
          events={{hover: !allowDelete}}
        >
          <ActionIcon variant="default" onClick={deleteBlock} disabled={!allowDelete}>
            <Icon.Delete color={allowDelete ? 'black' : 'grey'} />
          </ActionIcon>
        </Tooltip>
      </Flex>
    }
    variant="filled"
    classNames={{legend: 'fieldset-legend'}}
  >
    <Input.Wrapper label="Block type">
      <Combobox
        store={combobox}
        onOptionSubmit={handleTypeSubmit}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={<Combobox.Chevron />}
            rightSectionPointerEvents="none"
            onClick={() => combobox.toggleDropdown()}
          >
            {findLabel(blocks[index]?.type)}
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
            {block_types_groups.map(({group, children}) => (
              <Combobox.Group key={group} label={group}>
                {children.map(({value, label}) => (
                  <Combobox.Option key={value} value={value}>
                    {label}
                  </Combobox.Option>
                ))}
              </Combobox.Group>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
    {['task', 'task-m', 'task-u', 'task-s', 'pool', 'lane'].includes(blocks[index]?.type) && <TextInput
      label={
        blocks[index]?.type=='pool'
        ? 'Pool name'
        : blocks[index]?.type=='lane'
          ? 'Lane name'
          : 'Task text'
      }
      placeholder={
        ['pool', 'lane'].includes(blocks[index]?.type)
        ? 'Insert the name of the '+blocks[index]?.type
        : 'Insert the task to perform'
      }
      value={blocks[index]?.text}
      onChange={handleTextChange}
      onBlur={handleTextBlur}
    />}
  </Fieldset>
}

function CardEditPanel({cards, setCards, activeCard, setActiveCard, saveCard}) {
  const c_id = cards[activeCard]?.id
  const [blocks, setBlocks] = useState([])

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

  const handleCostChange = (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], cost: value}))
  }

  const handleCostChangeEnd = async (value) => { // Just to prevent too many requests
    await saveCard()
  }

  const handleTypeChange = async (value) => {
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], type: value}))
    // Non posso usare "await saveCard()" perché va in concorrenza con la set dello stato
    await API.editCard({...cards[activeCard], type: value})
  }

  return <Transition
    mounted={activeCard>=0 && activeCard<cards.length}
    transition="fade-left"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[1]} id="edit-panel">
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
                { label: 'BPMN', value: 'bpmn' },
                { label: 'Action', value: 'action' },
                { label: 'Coins', value: 'coins' },
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
          <Input.Wrapper label="Cost">
            <Slider
              domain={[0.9, 4.1]}
              min={1}
              max={4}
              step={1}
              marks={[1, 2, 3, 4].map(v => ({value: v, label: v}))}
              size="lg"
              color="green"
              label={null}
              value={cards[activeCard].cost}
              onChange={handleCostChange}
              onChangeEnd={handleCostChangeEnd}
            />
          </Input.Wrapper>
          <Space />
          {blocks.map((b, k) => (
            <EditBlock
              key={k}
              blocks={blocks}
              setBlocks={setBlocks}
              index={k}
              allowDelete={blocks.length>1}
            />
          ))}
          <Button color="green" mb="20" onClick={addBlock} leftSection={<Icon.PlusBlock color="white"/>}>Add block</Button>
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
      <Flex
        direction="column" justify="center" align="center"
        id="card-preview" className={'type-'+cards[activeCard]?.type}
      >
        <Text ta="center" fz="xl" p="20">{cards[activeCard]?.name}</Text>
        <Text ta="center" fz="xl" p="20">{cards[activeCard]?.cost+'🪙'}</Text>
      </Flex>
      {/* <Button onClick={() => console.log(cards)}>log cards</Button> */}
    </Flex>}
  </Transition>
}

function SettingsPanel({cards, activeCard, title, editTitle, deleteCards}) {
  const [openedModalDelete, setOpenedModalDelete] = useState(false)
  const [turns, setTurns] = useState(24)
  const [difficulty, setDifficulty] = useState({})

  useEffect(() => {
    const turnsDifficulties = [
      {min: 18, max: 18, label: 'Very hard!', color: 'grape'},
      {min: 19, max: 22, label: 'Hard', color: '#F00'},
      {min: 23, max: 26, label: 'Medium', color: 'orange'},
      {min: 27, max: 30, label: 'Easy', color: 'green'},
    ]
    for(let d of turnsDifficulties) {
      if(turns>=d.min && turns<=d.max) {
        setDifficulty(d)
      }
    }
  }, [turns])

  const handleTitleChange = ({currentTarget: {value}}) => {
    editTitle(value)
  }

  const handleTurnsChangeEnd = async (value) => {}

  return <Transition
    mounted={activeCard<0 || activeCard>=cards.length}
    transition="fade-right"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[1]} id="settings-panel">
      <Flex justify="space-between" w="100%">
        <Title order={3}>Exercise settings</Title>
          <Link to="/play/-1">
            <Button color="green" rightSection={<Icon.Play color="white" size="20"/>}>Play test</Button>
          </Link>
      </Flex>
      <TextInput
        label="Title"
        placeholder="Insert exercise title here"
        value={title}
        onChange={handleTitleChange}
        maxLength="40"
        error={!title && 'Title can\'t be empty'}
      />
      <Input.Wrapper
        label={'Total turns: '+turns}
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
          value={turns}
          onChange={(value) => setTurns(value)}
          onChangeEnd={handleTurnsChangeEnd}
        />
      </Input.Wrapper>
      <Fieldset legend={<Text fz="sm" fw={600}>Stats</Text>}>
        N. of cards: {cards.length}
      </Fieldset>
      <Fieldset legend={<Text fz="sm" fw={600}>Danger zone</Text>} variant="filled">
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
    </Flex>}
  </Transition>
}

function Editor({}) {
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState([])
  const [activeCard, setActiveCard] = useState(-1)
  const [page, setPage] = useState('loading')
  const ex_id = useParams().id

  const editTitle = async (title) => {
    setTitle(title)
    await API.editExercise({id: ex_id, name: title})
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

  const loadTitle = async() => {
    const ex = await API.getExercise(ex_id)
    if(!ex) setPage('invalid')
    else {
      setPage('loaded')
      setTitle(ex.name)
    }
  }

  useEffect(() => {
    loadTitle()
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
          cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard}
          loadCards={loadCards} createCard={createCard} title={title}
        />
        <CardEditPanel
          cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard}
          saveCard={saveCard}
        />
        <CardPreviewPanel
          cards={cards} activeCard={activeCard}
        />
        <SettingsPanel
          cards={cards} activeCard={activeCard}
          deleteCards={deleteCards} title={title} editTitle={editTitle}
        />
      </Flex>
    </>}
  </>
}

export default Editor