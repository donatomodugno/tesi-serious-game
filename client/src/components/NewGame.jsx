import '@mantine/core/styles.css'
import './NewGame.css'
import './Gameboard.css'
import { Flex, ScrollArea, Table, Modal,
  Title, Text, Space, Button, Fieldset,
  TextInput, Input, InputBase, Slider, ActionIcon,
  Combobox, useCombobox, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useEffect, useRef } from 'react'
import { IconDelete, iconTask, iconManual, iconUser, iconService, iconAnd, iconOr, iconXor } from '../icons'

const panels = ['20%', '40%', '20%']
const new_card = {title: '<New card>', cost: 1, blocks: [{type: 'task', text: 'First block'}, {type: 'gw-xor'}]}
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
    <Flex direction="column" gap="lg" w={panels[0]} id="list-panel">
      <Button color="green" onClick={() => addCard(new_card)}>Add card</Button>
      <ScrollArea h="80%" type="always">
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

function EditBlock({block, editBlock, deleteBlock, allowDelete}) {
  const combobox = useCombobox()
  function findLabel(value) {
    for(let g of block_types_groups) {
      for(let c of g.children) {
        if(c.value==value) return c.label
      }
    }
    return 'Invalid value'
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
            <IconDelete color={allowDelete ? 'black' : 'grey'} />
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
        onOptionSubmit={v => {
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
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
    {['task', 'task-m', 'task-u', 'task-s', 'pool', 'lane'].includes(block.type) && <TextInput
      label={
        block.type=='pool'
        ? 'Pool name'
        : block.type=='lane'
          ? 'Lane name'
          : 'Task text'
      }
      placeholder={
        ['pool', 'lane'].includes(block.type)
        ? 'Insert the name of the '+block.type
        : 'Insert the task to perform'
      }
      value={block.text}
      onChange={({currentTarget: {value}}) => editBlock({...block, text: value})}
    />}
  </Fieldset>
}

function CardEditPanel({cards, setCards, activeCard}) {
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
    <Flex direction="column" gap="md" w={panels[1]} id="edit-panel">
      <Title order={3}>Edit card</Title>
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
            maxLength="24"
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
              allowDelete={cards[activeCard].blocks.length>1}
            />
          ))}
          <Button color="green" onClick={addBlock}>Add block</Button>
        </Flex>
      </ScrollArea>
    </Flex>
  </>
}

function CardPreviewPanel({cards, activeCard}) {
  return activeCard>=0 && activeCard<cards.length && <>
    <Flex direction="column" gap="md" w={panels[2]}>
      <Title order={3}>Card preview</Title>
      <Flex id="card-preview" direction="column" justify="center" align="center" className="type-bpmn">
        <span>{cards[activeCard].title}</span>
        <span>{cards[activeCard].cost+'🪙'}</span>
      </Flex>
      {/* <Button onClick={() => console.log(cards)}>log cards</Button> */}
    </Flex>
  </>
}

function NewGame({}) {
  const [cards, setCards] = useState([])
  const [activeCard, setActiveCard] = useState(-1)

  // useEffect(() => {
  //   APIs...
  // }, [cards])

  return <>
    <Flex direction="row" h="100%" gap="60">
      <CardsListPanel cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard} />
      <CardEditPanel  cards={cards} setCards={setCards} activeCard={activeCard} />
      <CardPreviewPanel cards={cards} activeCard={activeCard} />
    </Flex>
  </>
}

export default NewGame