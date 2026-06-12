import '@mantine/core/styles.css'
import './NewGame.css'
import './Gameboard.css'
import { Flex, ScrollArea, Table, Modal,
  Title, Text, Space, Button, Fieldset,
  TextInput, Input, InputBase, Slider, ActionIcon,
  Combobox, useCombobox, Tooltip, Transition } from '@mantine/core'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { Icon, iconTask, iconManual, iconUser, iconService, iconAnd, iconOr, iconXor } from '../icons'
import API from '../API'

const panels = ['20%', '40%', '20%']
const new_card = {name: 'Card', cost: 1}
const new_block = {type: 'task', text: 'New block'}
const block_types_groups = [
  {group: 'Tasks', children: [
    {value: 'task', label: <Flex align="center" gap="xs">{iconTask} Task</Flex>},
    {value: 'task-m', label: <Flex align="center" gap="xs">{iconManual} Manual task</Flex>},
    {value: 'task-u', label: <Flex align="center" gap="xs">{iconUser} User task</Flex>},
    {value: 'task-s', label: <Flex align="center" gap="xs">{iconService} Service task</Flex>},
  ]},
  {group: 'Gateways', children: [
    {value: 'gw-and', label: <Flex align="center" gap="xs">{iconAnd} Parallel gateway</Flex>},
    {value: 'gw-or', label: <Flex align="center" gap="xs">{iconOr} Inclusive gateway</Flex>},
    {value: 'gw-xor', label: <Flex align="center" gap="xs">{iconXor} Exclusive gateway</Flex>},
  ]},
  {group: 'Events', children: [
    {value: 'ev-msg-s', label: 'Send message'},
    {value: 'ev-msg-r', label: 'Receive message'},
    {value: 'ev-timer', label: 'Timer/Delay'},
  ]},
  {group: 'Pools', children: [
    {value: 'pool', label: 'Pool'},
    {value: 'lane', label: 'Lane'},
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
    await loadCards()
    setActiveCard(-1)
    // const cards_tmp = [...cards]
    // cards_tmp.splice(key, 1)
    // setCards(cards_tmp)
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
            {block_types_groups.map(({group, children}, k) => (
              <Combobox.Group key={k} label={group} index={group}>
                {children.map(({value, label}, k) => (
                  <Combobox.Option key={k} value={value} index={value}>
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
      // onChange={({currentTarget: {value}}) => editBlock({...block, text: value})}
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

  // const editBlock = async (key, new_block) => {
  //   await API.editBlock({...blocks[key], c_id})
  //   setBlocks(blocks.toSpliced(key, 1, new_block))
  // }

  // function editBlock(key, new_block) {
    // const cards_tmp = [...cards]
    // cards_tmp[activeCard].blocks[key] = new_block
    // setCards(cards_tmp)
  // }

  // function deleteBlock(key) {
    // const cards_tmp = [...cards]
    // cards_tmp[activeCard].blocks.splice(key, 1)
    // setCards(cards_tmp)
  // }

  useEffect(() => {
    if(activeCard>=0 && activeCard<cards.length)
      loadBlocks()
  }, [activeCard])
  
  const handleTitleChange = ({currentTarget: {value}}) => {
    // const cards_tmp = [...cards]
    // cards_tmp[activeCard] = {...cards_tmp[activeCard], name: value}
    // setCards(cards_tmp)
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], name: value}))
  }

  const handleTitleBlur = async ({currentTarget: {value}}) => {
    await saveCard()
  }

  const handleCostChange = (value) => {
    // const cards_tmp = [...cards]
    // cards_tmp[activeCard].cost = value
    // setCards(cards_tmp)
    setCards(cards.toSpliced(activeCard, 1, {...cards[activeCard], cost: value}))
  }

  const handleCostChangeEnd = async (value) => { // Just to prevent too many requests
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
          <TextInput
            label="Title"
            placeholder="Insert card title here"
            error={!cards[activeCard].name && 'Title can\'t be empty'}
            value={cards[activeCard].name}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            maxLength="80"
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
              // block={b}
              // editBlock={(nb) => editBlock(k, nb)}
              // deleteBlock={() => deleteBlock(k)}
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
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[2]} id="preview-panel">
      <Title order={3}>Card preview</Title>
      <Flex id="card-preview" direction="column" justify="center" align="center" className="type-bpmn">
        <Text ta="center" fz="xl" p="20">{cards[activeCard]?.name}</Text>
        <Text ta="center" fz="xl" p="20">{cards[activeCard]?.cost+'🪙'}</Text>
      </Flex>
      {/* <Button onClick={() => console.log(cards)}>log cards</Button> */}
    </Flex>}
  </Transition>
}

function SettingsPanel({cards, activeCard, title, editTitle, deleteCards}) {
  const [openedModalDelete, setOpenedModalDelete] = useState(false)

  const handleTitleChange = ({currentTarget: {value}}) => {
    editTitle(value)
  }

  return <Transition
    mounted={activeCard<0 || activeCard>=cards.length}
    transition="fade-right"
    timingFunction="cubic-bezier(0,0,0,1)"
    duration={400}
    exitDuration={0}
  >
    {(s) => <Flex style={s} direction="column" gap="md" w={panels[1]} id="settings-panel">
      <Title order={3}>Exercise settings</Title>
      <TextInput
        label="Title"
        placeholder="Insert exercise title here"
        value={title}
        onChange={handleTitleChange}
        maxLength="40"
        error={!title && 'Title can\'t be empty'}
      />
      N. of cards: {cards.length}
      <Fieldset legend="Danger zone" variant="filled">
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

function NewGame({}) {
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState([])
  const [activeCard, setActiveCard] = useState(-1)
  const ex_id = useParams().id

  const editTitle = async (title) => {
    setTitle(title)
    await API.editExercise({id, name: title})
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
    setTitle((await API.getExercise(ex_id)).name)
  }

  useEffect(() => {
    loadTitle()
  }, [])

  return <>
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
  </>
}

export default NewGame