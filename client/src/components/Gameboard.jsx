import { use, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Flex, Box, Space, Title, Progress, RingProgress, List, ColorSwatch, Modal, Button } from '@mantine/core'
import './Gameboard.css'
import API from '../API'

const cards = {
  'V1': {y: 100, x: 200, type: 'bpmn', cost: 3, value: 1, title: '1 🧩'},
  'V3': {y: 100, x: 300, type: 'bpmn', cost: 5, value: 3, title: '3 🧩'},
  'V6': {y: 100, x: 400, type: 'bpmn', cost: 8, value: 6, title: '6 🧩'},
  'M1': {y: 100, x: 500, type: 'coins', cost: 0, bonus: 1, title: '1 🪙'},
  'M2': {y: 100, x: 600, type: 'coins', cost: 1, bonus: 2, title: '2 🪙'},
  'M3': {y: 100, x: 700, type: 'coins', cost: 2, bonus: 3, title: '3 🪙'},
  'A1': {y: 260, x: 200, type: 'action', cost: 2, bonus: +0, title: <>+1 🃏</>},
  'A2': {y: 260, x: 300, type: 'action', cost: 3, bonus: +0, title: <>+2 🃏</>},
  'A3': {y: 260, x: 400, type: 'action', cost: 5, bonus: +0, title: <>+1 🃏<br/>+1 🛒</>},
  'A4': {y: 260, x: 500, type: 'action', cost: 6, bonus: +2, title: <>+1 🃏</>},
  'A5': {y: 260, x: 600, type: 'action', cost: 6, bonus: +2, title: <>+1 🛒</>},
  'A6': {y: 260, x: 600, type: 'action', cost: 5, bonus: -2, title: <>+1 ✋🏻</>},
  'A7': {y: 260, x: 400, type: 'action', cost: 7, bonus: +2, title: <>+2 🛒</>},
}

function Card({card, x=card.x, y=card.y, z=0, task=()=>{}, flipped=false, clickable, valid, showCost=true}) {
  return <div className="card-hitbox" style={{
    position: 'absolute',
    top: y,
    left: x,
    zIndex: z,
    transition: '0.8s',
  }} onClick={clickable && valid ? task : () => {}}>
    <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
      <Flex className="card-back"></Flex>
      <Flex className={'card-front type-'+card.type} direction="column" justify="space-between">
        <span className="title">{card.title}</span>
        <span>{card.text}</span>
        {card.type=='action' && (
          card.bonus>=0
          ? <span className="bonus">[+{card.bonus}🪙]</span>
          : <span className="malus">[{card.bonus}🪙]</span>
        )}
        <Space/>
        {showCost && <span>(cost: {card.cost}🪙)</span>}
      </Flex>
    </div>
  </div>
}

function GameView({}) {
  const [deck, setDeck] = useState([])
  const [coins, setCoins] = useState(0)
  const [buys, setBuys] = useState(1)
  const [turns, setTurns] = useState(10)
  const [flipped, setFlipped] = useState(false)

  function shuffle(arr) {
    let icurr = arr.length
    while(icurr != 0) {
      let irand = Math.floor(Math.random() * icurr)
      icurr--
      [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
    }
    return arr
  }

  function initDeck() {
    const deckStart = []
    for(let i=0; i<7; i++) {
      deckStart.push(cards['M1'])
    }
    deckStart.push(cards['V1'])
    deckStart.push(cards['A1'])
    deckStart.push(cards['A2'])
    setDeck(deckStart)
    shuffleDeck()
    placeDeck()
    setBuys(1)
    setTurns(10)
  }
  
  useEffect(() => {
    initDeck()
  }, [])

  function placeDeck() {
    setDeck(deck => deck.map(c => ({...c, y: 500, x: 50})))
  }

  function shuffleDeck() {
    setDeck(deck => shuffle(deck))
  }

  function buyCard(id) {
    if(buys>0) {
      setBuys(buys-1)
      setCoins(coins-cards[id].cost)
      setDeck(deck => [...deck, cards[id]])
      console.log('carta comprata', id)
      console.log('carte', ...Object.keys(cards))
      setTimeout(() => placeDeck(), 1) // Delay of 1 millisecond just to render the card animation
    }
  }

  useEffect(() => {
    setCoins(deck.slice(0, 5).map(c => (c.bonus || 0)).reduce((sum, n) => sum+n, 0))
  }, [deck])

  useEffect(() => {
    if(buys==0) {
      setBuys(1)
      setTurns(turns-1)
    }
  }, [buys])

  useEffect(() => {
    shuffleDeck()
    setCoins(deck.slice(0, 5).map(c => (c.bonus || 0)).reduce((sum, n) => sum+n, 0))
    if(turns==0) {
      alert('Game finished!')
    }
  }, [turns])

  return <>
    <div id="game-bg">
      <div id="hud">
        <span>Turns: {10-turns+1}/10✋🏻</span>
        <span>Buys: {buys}🛒</span>
        <span>Available coins: {coins}🪙</span>
      </div>
      {Object.keys(cards).map((id, k) => <Card
        key={k}
        card={cards[id]}
        clickable
        valid={cards[id].cost<=coins}
        task={() => buyCard(id)}
      />)}
      {deck.slice(0, 5).map((c, i) => <Card
        key={i}
        card={c}
        y={500}
        x={200+i*100}
        clickable
        showCost={false}
      />)}
      {deck.slice(5).map((c, i) => <Card
        key={i}
        card={c}
        z={2}
        flipped={c.y==500 && c.x==50}
        valid={c.cost<=coins}
      />)}
      {/* log */}
      {/* <button onClick={() => {
        console.log('cards', cards)
        console.log('coins:', deck.slice(0, 5).map(c => c.value).reduce((sum, n) => sum+n))
        console.log('deck', deck)
      }}>log</button> */}
      {/* shuffle */}
      {/* <button onClick={() => {
        setDeck(shuffle([...deck]))
      }}>shuffle</button> */}
      {/* reset */}
      {/* <button onClick={() => {
        initDeck()
      }}>reset</button> */}
      {/* place */}
      {/* <button onClick={placeDeck}>place</button> */}
      <Flex id="legend" direction="column" w="170" gap="lg">
        <Title order={4} ta="center">Legend</Title>
        <span>&nbsp;+N 🃏<br/>Draw N cards</span>
        <span>&nbsp;+N 🛒<br/>Add N buys in a turn</span>
        <span>&nbsp;+N ✋🏻<br/>Add N turns</span>
      </Flex>
    </div>
  </>
}

function ProgressPanel({logged, progress=50}) {
  const {id} = useParams()
  return <>
    <Modal opened={false} overlayProps={{backgroundOpacity: 0.5}}>Game finished!</Modal>
    <Modal opened={false} overlayProps={{backgroundOpacity: 0.5}}>Next turn!</Modal>
    <Flex id="panel" h="100%" direction="column" gap="sm">
      <Title order={3}>Exercise: {id}</Title>
      {logged && <Link to={'/edit/'+id}><Button w="100%" color="green">Edit exercise</Button></Link>}
      <Title size="md" order={3} mt="30">Your progress</Title>
      <Progress.Root size="30">
        <Progress.Section value={progress} color="green">
          <Progress.Label>{progress}%</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <Title size="md" order={3} mt="30">Deck composition</Title>
      <RingProgress
        label={<Title ta="center">🃏</Title>}
        sections={[
          {value: 40, color: '#1AB'},
          {value: 15, color: '#FC0'},
          {value: 15, color: '#D48'},
        ]}
        mt="-10" mb="-5"
      />
      <List>
        <List.Item icon={<ColorSwatch color="#1AB" size={16}/>}>Actions</List.Item>
        <List.Item icon={<ColorSwatch color="#FC0" size={16}/>}>Coins</List.Item>
        <List.Item icon={<ColorSwatch color="#D48" size={16}/>}>BPMN elements</List.Item>
      </List>
    </Flex>
  </>
}

function Gameboard({logged}) {
  const SEP = 80 // 70
  return <>
    <Flex h="100%">
      <Box w={SEP+"%"}>
        <GameView/>
      </Box>
      <Box w={100-SEP+"%"}>
        <ProgressPanel logged={logged}/>
      </Box>
    </Flex>
  </>
}

export default Gameboard