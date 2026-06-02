import '@mantine/core/styles.css'
import './NewGame.css'
import { Flex, ScrollArea, Table, Modal,
  Title, Text, Space, Button, Fieldset,
  TextInput, Input, InputBase, Slider, ActionIcon,
  Combobox, useCombobox, TreeSelect } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useEffect, useRef } from 'react'
import { IconDelete, iconTask, iconManual, iconUser, iconService, iconAnd, iconOr, iconXor } from '../icons'

const new_card = {title: '<New card>', cost: 1, blocks: [{type: 'task', text: 'First block'}, {type: 'gw-xor'}]}
// const block_types = [
//   {value: 'task', name: <Flex align="center" gap="xs">{iconTask} Task</Flex>},
//   {value: 'task-m', name: <Flex align="center" gap="xs">{iconManual} Manual task</Flex>},
//   {value: 'task-u', name: <Flex align="center" gap="xs">{iconUser} User task</Flex>},
//   {value: 'task-s', name: <Flex align="center" gap="xs">{iconService} Service task</Flex>},
//   {value: 'gw-and', name: <Flex align="center" gap="xs">{iconAnd} Parallel gateway</Flex>},
//   {value: 'gw-or', name: <Flex align="center" gap="xs">{iconOr} Inclusive gateway</Flex>},
//   {value: 'gw-xor', name: <Flex align="center" gap="xs">{iconXor} Exclusive gateway</Flex>},
//   {value: 'ev-msg-s', name: 'Send message'},
//   {value: 'ev-msg-r', name: 'Receive message'},
//   {value: 'ev-timer', name: 'Timer/Delay'},
// ]
// const data = [
//   {value: 't', label: 'Tasks', children: [
//     {value: 'task', label: <Flex align="center" gap="xs">{iconTask} Task</Flex>},
//     {value: 'task-m', label: <Flex align="center" gap="xs">{iconManual} Manual task</Flex>},
//     {value: 'task-u', label: <Flex align="center" gap="xs">{iconUser} User task</Flex>},
//     {value: 'task-s', label: <Flex align="center" gap="xs">{iconService} Service task</Flex>},
//   ]},
//   {value: 'g', label: 'Gateways', children: [
//     {value: 'gw-and', label: <Flex align="center" gap="xs">{iconAnd} Parallel gateway</Flex>},
//     {value: 'gw-or', label: <Flex align="center" gap="xs">{iconOr} Inclusive gateway</Flex>},
//     {value: 'gw-xor', label: <Flex align="center" gap="xs">{iconXor} Exclusive gateway</Flex>},
//   ]},
//   {value: 'e', label: 'Events', children: [
//     {value: 'ev-msg-s', label: 'Send message'},
//     {value: 'ev-msg-r', label: 'Receive message'},
//     {value: 'ev-timer', label: 'Timer/Delay'},
//   ]},
// ]
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
]

function ModalDelete({opened, close, deleteCard}) {
  return <Modal
    opened={opened}
    onClose={close}
    title={
      <Flex align="center" gap="sm">
        <IconDelete color="red"/>
        <Text span fw="700"> Delete card</Text>
      </Flex>
    }
    overlayProps={{
      backgroundOpacity: 0.5,
      blur: 3,
    }}
    transitionProps={{transition: 'rotate-left'}}
    size="xs"
  >
    <Flex>
      <Text>Are you sure to delete this card?</Text>
    </Flex>
    <Space h="xl" />
    <Flex justify="flex-end" gap="md">
      <Button color="gray" variant="light" onClick={close}>Cancel</Button>
      <Button color="red" variant="light" onClick={() => {
        close()
        deleteCard()
      }}>Delete</Button>
    </Flex>
  </Modal>
}

function CardsListPanel({cards, setCards, activeCard, setActiveCard}) {
  const [cardToDelete, setCardToDelete] = useState(-1)

  function addCard(card_new) {
    setActiveCard(cards.length)
    setCards([...cards, card_new])
  }

  function deleteCard(key) {
    const cards_tmp = [...cards]
    cards_tmp.splice(key, 1)
    setCards(cards_tmp)
    setTimeout(() => setActiveCard(-1), 1) // How to achieve this without timeout??
  }

  return <>
    <ModalDelete
      opened={cardToDelete>=0}
      close={() => setCardToDelete(-1)}
      deleteCard={() => deleteCard(cardToDelete)}
    />
    <Flex direction="column" gap="lg" w="25%">
      <Button color="green" onClick={() => addCard(new_card)}>Add card</Button>
      <ScrollArea h="80%">
        <Table verticalSpacing="sm" striped={false} highlightOnHover withTableBorder={false}>
          <Table.Tbody>
            {cards.map((c, k) => (
              <Table.Tr
                key={k}
                onClick={() => setActiveCard(k)}
                className={'list-item' + (k==activeCard ? ' active' : '')}
              >
                <Table.Td>{c.title || (activeCard!=k && '<Untitled card>')}&nbsp;</Table.Td>
                <Table.Td w="0" className="trash">
                  {k==activeCard && <ActionIcon size="lg" color="green" visibility="hidden" onClick={() => setCardToDelete(k)}>
                    <IconDelete color="white" />
                  </ActionIcon>}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Flex>
  </>
}

function EditBlock({block, editBlock, deleteBlock}) {
  const combobox = useCombobox()
  // const [value, setValue] = useState(block.type)
  // const _options = block_types.map(({value, name}) => (
  //   <Combobox.Option value={value} key={value}>
  //     {name}
  //   </Combobox.Option>
  // ))
  function findLabel(value) {
    for(let g of block_types_groups) {
      for(let c of g.children) {
        if(c.value==value) return c.label
      }
    }
    // block_types_groups.forEach(g => {
    //   g.children.forEach(c => {
    //     if(c.value==value) return c.label
    //   })
    // }) // Why won't work with forEach cycles??
    return 'Invalid value'
  }

  return <Fieldset
    legend={
      <Flex justify="space-between">
        Block
        <ActionIcon variant="default" onClick={deleteBlock}>
          <IconDelete />
        </ActionIcon>
      </Flex>
    }
    variant="filled"
    classNames={{legend: 'fieldset-legend'}}
  >
    {/* <TreeSelect
      // Molto bello il TreeSelect, ma non posso mostrare nell'input un nodo personalizzato, solo stringhe...
      label="Block type"
      // placeholder="Pick a block type"
      data={data}
      expandOnClick
      withLines={false}
      allowDeselect={false}
      defaultValue={'task'}
      value={value}
      comboboxProps={{
        // transitionProps: { transition: 'scale-y', duration: 200 },
      }}
      onChange={setValue}
    /> */}
    <Input.Wrapper label="Block type">
      <Combobox
        store={combobox}
        onOptionSubmit={v => {
          // setValue(v)
          editBlock({...block, type: v})
          combobox.closeDropdown()
        }}
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
            {/*
              block_types.find(t => t.value==value)
              ? block_types.find(t => t.value==value).name
              : <Input.Placeholder>Pick a block type</Input.Placeholder>
            */}
            {findLabel(block.type)}
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
            {block_types_groups.map(({group, children}) => (
              <Combobox.Group label={group} key={group}>
                {children.map(({value, label}) => (
                  <Combobox.Option value={value} key={value}>
                    {label}
                  </Combobox.Option>
                ))}
              </Combobox.Group>
            ))}
            {/* {_options} */}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
    {['task', 'task-m', 'task-u', 'task-s'].includes(block.type) && <TextInput
      label="Task text"
      placeholder="Insert the task to perform"
      value={block.text}
      onChange={({currentTarget: {value}}) => editBlock({...block, text: value})}
    />}
  </Fieldset>
}

function CardsEditPanel({cards, setCards, activeCard}) {
  const [inputTitleError, setInputTitleError] = useState(false)

  useEffect(() => {
    setInputTitleError(activeCard>=0 && (cards[activeCard].title=='' ? 'Title can\'t be empty' : false))
  }, [activeCard])

  const handleTitleChange = ({currentTarget: {value}}) => {
    const cards_tmp = [...cards]
    cards_tmp[activeCard] = {...cards_tmp[activeCard], title: value}
    setCards(cards_tmp)
    if(value!='') setInputTitleError(false)
  }
  const handleTitleBlur = ({currentTarget: {value}}) => {
    if(value=='') setInputTitleError('Title can\'t be empty')
  }

  const handleCostChange = ({value}) => {
    const cards_tmp = [...cards]
    cards_tmp[activeCard] = {...cards_tmp[activeCard], cost: value}
    setCards(cards_tmp)
  }

  const addBlock = () => {
    const cards_tmp = [...cards]
    cards_tmp[activeCard].blocks.push({type: 'task'})
    setCards(cards_tmp)
  }

  function editBlock(key, new_block) {
    const cards_tmp = [...cards]
    cards_tmp[activeCard].blocks[key] = new_block
    setCards(cards_tmp)
  }

  function deleteBlock(key) {
    const cards_tmp = [...cards]
    cards_tmp[activeCard].blocks.splice(key, 1)
    setCards(cards_tmp)
  }

  return activeCard>=0 && activeCard<cards.length && <>
    <Flex direction="column" gap="md" w="40%">
      <Title order={3}>Card: {cards[activeCard].title /* Edit card */}</Title>
      <ScrollArea h="80%">
        <Flex direction="column" gap="md" id="edit-area">
          <TextInput
            label="Title"
            placeholder="Insert card title here"
            error={inputTitleError}
            value={cards[activeCard].title==new_card.title ? '' : cards[activeCard].title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            pattern="\d*" // Does not work...
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
            />
          </Input.Wrapper>
          <Space />
          {cards[activeCard].blocks.map((b, k) => (
            <EditBlock
              key={k}
              block={b}
              editBlock={(nb) => editBlock(k, nb)}
              deleteBlock={() => deleteBlock(k)}
            />
          ))}
          <Button color="green" onClick={addBlock}>Add block</Button>
        </Flex>
      </ScrollArea>
    </Flex>
  </>
}

function NewGame({}) {
  const [cards, setCards] = useState([])
  const [activeCard, setActiveCard] = useState(-1)

  return <>
    <Flex direction="row" h="100%" gap={80} id="main-view">
      <CardsListPanel cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard} />
      <CardsEditPanel cards={cards} setCards={setCards} activeCard={activeCard} />
      <Button onClick={() => console.log(cards)}>cards</Button>
    </Flex>
  </>
}

export default NewGame