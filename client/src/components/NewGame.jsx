import '@mantine/core/styles.css'
import './NewGame.css'
import { Flex, Button, Title, Text, Space, Table, TextInput, Input, Slider, ActionIcon, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useEffect, useRef } from 'react'
import { IconDelete } from '../icons'

const newCard = {title: '<New card>', cost: 1, blocks: [{type: 'activity', text: 'Open Uber app'}, {type: 'xor'}]}

function ModalDelete({opened, close, deleteCard}) {
    return <Modal
        opened={opened}
        onClose={close}
        title={<Flex align="center" gap="sm">
            <IconDelete color="red"/>
            <Text span fw="700"> Delete card</Text>
        </Flex>}
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
    // const [opened, {open, close}] = useDisclosure(false)
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
        <ModalDelete opened={cardToDelete>=0} close={() => setCardToDelete(-1)} deleteCard={() => deleteCard(cardToDelete)}/>
        <Flex direction="column" gap="lg" w="25%">
            <Button color="green" onClick={() => addCard(newCard)}>Add card</Button>
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
                                {k==activeCard && <ActionIcon size="lg" color="green" visibility="hidden" onClick={() => setCardToDelete(k)}/*onClick={open}*/>
                                    <IconDelete color="white" />
                                </ActionIcon>}
                                {/* <ModalDelete opened={opened} close={close} deleteCard={() => deleteCard(k)}/> */}
                            </Table.Td>
                            {/* {k==activeCard && <Table.Td w="0" className="trash">
                                {iconDelete}
                            </Table.Td>} */}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Flex>
    </>
}

function CardsEditPanel({cards, setCards, activeCard}) {
    const [inputTitleError, setInputTitleError] = useState(false)
    // const refContainer = useRef(null)

    useEffect(() => {
        // setTimeout(() => refContainer.current.focus(), 5)
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

    return activeCard>=0 && activeCard<cards.length && <>
        <Flex direction="column" gap="md" w="40%">
            <Title order={3}>Create new card</Title>
            <TextInput
                label="Title"
                placeholder="Insert card title here"
                error={inputTitleError}
                value={cards[activeCard].title==newCard.title ? '' : cards[activeCard].title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                pattern="\d*" // Does not work...
                // ref={refContainer}
            />
            {/* <TextInput
                onFocus={() => console.log('ciao')}
                label="Title"
                placeholder="Insert card title here"
                error={cards[activeCard].title=='' && 'Title can\'t be empty'}
                value={inputTitle}
                onChange={({currentTarget: {value}}) => {setInputTitle(value)}}
                onBlur={({currentTarget: {value}}) => {changeTitle(value)}}
            /> */}
            <Input.Wrapper label="Cost">
                <Slider
                    domain={[0.8, 4.2]}
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
        </Flex>
    </>
}

function NewGame({}) {
    const [cards, setCards] = useState([
        // {cost: 1, title: 'Uber first step', blocks: [{type: 'activity', text: 'Open Uber app'}, {type: 'xor'}]},
        // {cost: 1, title: 'Uber first step', blocks: [{type: 'activity', text: 'Open Uber app'}, {type: 'xor'}]},
        // {cost: 1, title: 'Uber first step', blocks: [{type: 'activity', text: 'Open Uber app'}, {type: 'xor'}]},
    ])
    const [activeCard, setActiveCard] = useState(-1)

    return <>
        <Flex direction="row" h="100%" gap={80} id="main-view">
            <CardsListPanel cards={cards} setCards={setCards} activeCard={activeCard} setActiveCard={setActiveCard} />
            <CardsEditPanel cards={cards} setCards={setCards} activeCard={activeCard} />
        </Flex>
    </>
}

export default NewGame