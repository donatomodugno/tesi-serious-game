import { use, useState, useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import {
  Flex, Box, Space, Modal, Button, Title, Text,
  Loader, Progress, RingProgress, List, ColorSwatch
} from '@mantine/core'
import '@mantine/core/styles.css'
import './Gameboard.css'
import { Icon } from '../icons'
import API from '../API'

const stock_cards = {
  'C1': {type: 'coins', name: '1 🪙', cost: 0, bonus: 1, draws: 0, buys: 0, turns: 0},
  'C2': {type: 'coins', name: '2 🪙', cost: 1, bonus: 2, draws: 0, buys: 0, turns: 0},
  'C3': {type: 'coins', name: '3 🪙', cost: 2, bonus: 3, draws: 0, buys: 0, turns: 0},
}
const GRID = {
  SEP: 80,
  ROW1: {X: [], Y: 120},
  ROW2: {X: [], Y: 250},
  ROW3SEL: {X: [], Y: 470},
  ROW3: {X: [], Y: 520},
}
function shuffle(arr) {
  for(let icurr = arr.length-1; icurr>=0; icurr--) {
    let irand = Math.floor(Math.random()*(icurr+1)); // Semicolon required
    [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  }
  return arr
}

function Card({}) {}

function GameView({exercise, cards, setCards, deck, setDeck}) {
  return <>
    <Text>Cards: {cards.map((c, k) => <span>{c.name} </span>)}</Text>
    <Text>Deck: {cards.map((c, k) => <span>{c.name} </span>)}</Text>
  </>
}

function ProgressPanel({}) {}

function Gameboard({logged}) {
  const [exercise, setExercise] = useState({})
  const [cards, setCards] = useState([])
  const [deck, setDeck] = useState([])
  const [page, setPage] = useState('loading')
  const ex_id = useParams().id

  const loadExercise = async () => {
    const ex = await API.getExercise(ex_id)
    setExercise(ex)
    if(!ex) setPage('invalid')
    else setPage('loaded')
    // exerciseCards: cards loaded, then shuffled, then ordered to put 'action' type first
    const exerciseCards = shuffle(await API.getExerciseCards(ex_id)).reduce((acc, c) => {
      if(c.type=='action') return [c, ...acc]
      else return [...acc, c]
    }, [])
    console.log(exerciseCards)
    // Cards and Deck
    setCards(shuffle(exerciseCards))
    setDeck([
      ...Array(7).fill(stock_cards['C1']),
      ...exerciseCards.splice(0, Math.min(exerciseCards.filter(c => c.type=='action').length, 4))
    ])
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
      <Flex h="100%">
        <Box w={GRID.SEP+'%'}>
          <GameView exercise={exercise} cards={cards} setCards={setCards} deck={deck} setDeck={setDeck}/>
        </Box>
        <Box w={100-GRID.SEP+'%'}>
          <ProgressPanel logged={logged} exercise={exercise} cards={cards} deck={deck}/>
        </Box>
      </Flex>
    </>}
  </>
}

export default Gameboard