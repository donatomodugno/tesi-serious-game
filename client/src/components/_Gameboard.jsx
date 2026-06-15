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
const stock_cards = {
  'C1': {type: 'coins', name: '1 🪙', cost: 0, bonus: 1, draws: 0, buys: 0, turns: 0},
  'C2': {type: 'coins', name: '2 🪙', cost: 1, bonus: 2, draws: 0, buys: 0, turns: 0},
  'C3': {type: 'coins', name: '3 🪙', cost: 2, bonus: 3, draws: 0, buys: 0, turns: 0},
}
const GRID = {
  ROW1: {x: [], y: 120},
  ROW2: {x: [], y: 250},
  ROW3SEL: {x: [], y: 470},
  ROW3: {x: [], y: 520},
}

function shuffle(arr) {
  let icurr = arr.length
  while(icurr!=0) {
    let irand = Math.floor(Math.random()*icurr)
    icurr--
    [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  }
  // for(let icurr = arr.length-1; icurr>=0; icurr--) {
  //   let irand = Math.floor(Math.random()*(icurr+1))
  //   [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  // }
  return arr
}



function Card({card, setCards, x, y, z=0, task=()=>{}, flipped=false, clickable, valid, showCost=true}) {
  // const [myX, setMyX] = useState(null)
  // const [myY, setMyY] = useState(null)
  // const [myRole, setMyRole] = useState(role)
  // const task = () => {
  //   console.log(role, myRole)
  //   if(myRole=='hand' && card.type=='coins') {
  //     setMyY(y-50)
  //     setMyRole('selected')
  //   }
  // }

  return <>
    <div className="card-hitbox" style={{
      position: 'absolute',
      top: y,
      left: x,
      zIndex: z,
      transition: '0.5s',
    }} onClick={clickable && valid ? task : () => {}}>
      <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
        <Flex className="card-back"></Flex>
        <Flex
          className={'card-front type-'+card.type}
          direction="column" justify="space-between" align="center"
        >
          {card.type!='coins' && <Text fw="700" ta="center">{card.name}</Text>}
          {card.type=='coins' && <Title order={3} ta="center" py="20">{card.bonus}🪙</Title>}
          {card.type=='action' && <div>
            {card.draws>0 && <Text>+{card.draws}🃏</Text>}
            {card.buys>0 && <Text mt="-8">+{card.buys}🛒</Text>}
            {card.turns>0 && <Text mt="-8">+{card.turns}✋🏻</Text>}
            {card.bonus>=0 && <Text fz="sm" c="green">[+{card.bonus}🪙]</Text>}
            {card.bonus<0 && <Text fz="sm" c="red">[{card.bonus}🪙]</Text>}
          </div>}
          <Text ta="center" fz="sm" p="0">{showCost && <>Cost: {card.cost}🪙</>}</Text>
        </Flex>
      </div>
    </div>
  </>
}

// function Card({card, x=card.x, y=card.y, z=0, task=()=>{}, flipped=false, clickable, valid, showCost=true}) {
//   return <div className="card-hitbox" style={{
//     position: 'absolute',
//     top: y,
//     left: x,
//     zIndex: z,
//     transition: '0.8s',
//   }} onClick={clickable && valid ? task : () => {}}>
//     <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
//       <Flex className="card-back"></Flex>
//       <Flex className={'card-front type-'+card.type} direction="column" justify="space-between">
//         <span className="title">{card.title}</span>
//         <span>{card.text}</span>
//         {card.type=='action' && (
//           card.bonus>=0
//           ? <span className="bonus">[+{card.bonus}🪙]</span>
//           : <span className="malus">[{card.bonus}🪙]</span>
//         )}
//         <Space/>
//         {showCost && <span>(cost: {card.cost}🪙)</span>}
//       </Flex>
//     </div>
//   </div>
// }

function ModalGameAlert({opened, text, confirmText, confirm}) {
  return <Modal
    opened={opened}
    onClose={() => {}}
    overlayProps={{backgroundOpacity: 0.5}}
    transitionProps={{transition: 'slide-up'}}
    centered
    withCloseButton={false}
    size="auto"
  >
    <Flex direction="column" gap="lg">
      <Text ta="center">{text}</Text>
      <Button color="green" onClick={confirm}>{confirmText}</Button>
    </Flex>
  </Modal>
}

function GameView({exercise, cards, setCards, deck, setDeck}) {
  const [avCoins, setAvCoins] = useState(0)
  const [selCoins, setSelCoins] = useState(0)
  const [hand, setHand] = useState([])
  const [buys, setBuys] = useState(1)
  const [turns, setTurns] = useState(10)
  const [totalTurns, setTotalTurns] = useState(exercise.turns)
  const [turn, setTurn] = useState(1)
  // const [flipped, setFlipped] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const new_hand = shuffle(deck).splice(0, 5)
    setHand(new_hand)
    setAvCoins(new_hand.map(c => c.bonus).reduce((sum, n) => sum+n, 0))
    setSelCoins(0)
  }, [deck])

  useEffect(() => {
    setSelCoins(
      hand
      .filter(c => c.selected || c.type!='coins')
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
  }, [hand])

  useEffect(() => {
    const new_hand = shuffle(deck).slice(0, 5)
    setHand(new_hand)
    setAvCoins(new_hand.map(c => c.bonus).reduce((sum, n) => sum+n, 0))
    setSelCoins(
      new_hand
      .filter(c => c.type!='coins')
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
    if(turn==totalTurns) setModal({text: 'Game finished!', confirmText: 'See results'})
    else if(turn>1) setModal({text: 'Next turn!', confirmText: 'Go!'})
    else setModal(null)
  }, [turn])

  useEffect(() => {
    if(buys==0) {
      setBuys(1)
      setTurn(turn+1)
    }
  }, [buys])

  // useEffect(() => {
  //   if(buys==0) {
  //     setBuys(1)
  //     setTurns(turns-1)
  //   }
  // }, [buys])

  // function shuffle(arr) {
  //   let icurr = arr.length
  //   while(icurr!=0) {
  //     let irand = Math.floor(Math.random()*icurr)
  //     icurr--
  //     [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  //   }
  //   return arr
  // }

  // function initDeck() {
  //   const deckStart = []
  //   for(let i=0; i<7; i++) {
  //     deckStart.push(cards['M1'])
  //   }
  //   deckStart.push(cards['V1'])
  //   deckStart.push(cards['A1'])
  //   deckStart.push(cards['A2'])
  //   setDeck(deckStart)
  //   shuffleDeck()
  //   placeDeck()
  //   setBuys(1)
  //   setTurns(10)
  // }
  
  // useEffect(() => {
  //   initDeck()
  // }, [])

  // function placeDeck() {
  //   setDeck(deck => deck.map(c => ({...c, y: 500, x: 50})))
  // }

  // function shuffleDeck() {
  //   setDeck(deck => shuffle(deck))
  // }

  // function buyCard(id) {
  //   if(buys>0) {
  //     setBuys(buys-1)
  //     setCoins(coins-cards[id].cost)
  //     setDeck(deck => [...deck, cards[id]])
  //     console.log('carta comprata', id)
  //     console.log('carte', ...Object.keys(cards))
  //     setTimeout(() => placeDeck(), 1) // Delay of 1 millisecond just to render the card animation
  //   }
  // }

  // useEffect(() => {
  //   setCoins(deck.slice(0, 5).map(c => (c.bonus || 0)).reduce((sum, n) => sum+n, 0))
  // }, [deck])

  // useEffect(() => {
  //   shuffleDeck()
  //   setCoins(deck.slice(0, 5).map(c => (c.bonus || 0)).reduce((sum, n) => sum+n, 0))
  //   if(turns==0) {
  //     alert('Game finished!')
  //   }
  // }, [turns])

  return <>
    <ModalGameAlert opened={modal!=null} text={modal?.text} confirmText={modal?.confirmText} confirm={() => setModal(null)} />
    <div id="game-bg">
      <Flex justify="center" align="center" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '80%',
        height: '92%',
        pointerEvents: 'none',
      }}>
        <Icon.Logo size="200" fill="#0D0" stroke="#0F05" sw="5"/>
      </Flex>
      <Flex id="hud" gap="20">
        <Text ml="20">Turn: {10-turns+1}/10✋🏻</Text>
        <Text>Remaining buys: {buys}🛒</Text>
        <Text>Available coins: {avCoins}🪙</Text>
        <Text>Selected coins: {selCoins}🪙</Text>
      </Flex>
      {Object.keys(stock_cards).map((id, k) => <Card
        // Coins da comprare
        key={k}
        card={stock_cards[id]}
        x={500+100*k}
        y={GRID.ROW1.y}
        clickable
        valid={selCoins>=stock_cards[id].cost}
      />)}
      {cards.filter(c => c.type=='action').slice(0, 2).map((c, k) => <Card
        // Actions da comprare
        key={k}
        card={c}
        x={200+100*k}
        y={GRID.ROW1.y}
        clickable
        valid={selCoins>=c.cost}
        task={() => {
          console.log('deck', ...deck.map(c => Object.values(c)))
          console.log('spliced',cards.toSpliced(cards.indexOf(x => x.id==c.id), 1))
          setBuys(buys-1)
          setDeck([...deck, c])
          setCards(cards.toSpliced(cards.indexOf(x => x.id==c.id), 1))
        }}
      />)}
      {deck.map((c, k) => <Card
        // Il mazzo coperto
        key={k}
        card={c}
        x={50}
        y={GRID.ROW3.y}
        flipped
      />)}
      {hand.map((c, k) => <Card
        // Mano di gioco
        key={k}
        card={c}
        x={c.x ?? 200+(500/hand.length)*k}
        y={c.y ?? c.selected ? GRID.ROW3SEL.y : GRID.ROW3.y}
        clickable
        valid
        showCost={false}
        task={() => {
          if(c.type=='coins')
            setHand(hand.toSpliced(k, 1, {...c, selected: !c?.selected}))
        }}
      />)}
      {/* {Object.keys(cards).map((id, k) => <Card
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
      />)} */}
      {/* log */}
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
        <Text>&nbsp;+N 🃏<br/>Draw N cards</Text>
        <Text>&nbsp;+N 🛒<br/>Add N buys in a turn</Text>
        <Text>&nbsp;+N ✋🏻<br/>Add N turns</Text>
      </Flex>
      <Button onClick={() => {
        console.log('cards', ...cards)
        // console.log('coins:', deck.slice(0, 5).map(c => c.value).reduce((sum, n) => sum+n))
        console.log('deck', ...deck)
        console.log(...hand)
      }}>log</Button>
    </div>
  </>
}

function ProgressPanel({logged, exercise, cards, deck}) {
  return <>
    <Flex id="panel" h="92%" direction="column" gap="sm" px="40" pt="40">
      <Flex direction="column">
        <Title size="md" order={3}>Exercise</Title>
        <Title order={3} c="#005">{exercise.name}</Title>
      </Flex>
        {logged && <Link to={'/edit/'+exercise.id}><Button w="100%" color="green">Edit exercise</Button></Link>}
      <Title size="md" order={3} mt="30">Your progress</Title>
      <Progress.Root size="30">
        <Progress.Section value={100*deck.filter(c => c.type=='bpmn').length/cards.filter(c => c.type=='bpmn').length} color="green">
          <Progress.Label>{100*deck.filter(c => c.type=='bpmn').length/cards.filter(c => c.type=='bpmn').length}%</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <Title size="md" order={3} mt="30">Deck composition</Title>
      <span>N. of cards: {deck.length} (cards: {cards.length})</span>
      <RingProgress
        // styles={{root:{background:'radial-gradient(closest-side,grey 20%,transparent 60%)'}}}
        label={<Title ta="center" pt="10"><Icon.Logo size="50" sw="20" fill="white" stroke="lightgrey"/></Title>}
        sections={[
          {color: '#1AB', value: deck.filter(c => c.type=='action').length/deck.length*100},
          {color: '#FC0', value: deck.filter(c => c.type=='coins').length/deck.length*100},
          {color: '#D48', value: deck.filter(c => c.type=='bpmn').length/deck.length*100},
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
  const [exercise, setExercise] = useState({})
  const [cards, setCards] = useState([])
  const [deck, setDeck] = useState([])
  const [page, setPage] = useState('loading')
  const ex_id = useParams().id
  const SEP = 80 //70
    
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
    const new_deck = [
      ...Array(7).fill(stock_cards['C1']),
      ...exerciseCards.splice(0, Math.min(exerciseCards.filter(c => c.type=='action').length, 3))
    ]
    setCards(shuffle(exerciseCards))
    setDeck(new_deck)
    // setDeck([
    //   ...Array(7).fill(stock_cards['C1']),
    //   ...exerciseCards.filter(c => c.type=='action').splice(0, 3)
    // ])
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
        <Box w={SEP+"%"}>
          <GameView exercise={exercise} cards={cards} setCards={setCards} deck={deck} setDeck={setDeck}/>
        </Box>
        <Box w={100-SEP+"%"}>
          <ProgressPanel logged={logged} exercise={exercise} cards={cards} deck={deck}/>
        </Box>
      </Flex>
    </>}
  </>
}

export default Gameboard