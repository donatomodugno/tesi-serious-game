import { use, useState, useEffect } from 'react'
import { Flex } from '@mantine/core'
import './Gameboard.css'
import API from '../API'

const cards = {
  'V1': {y: 100, x: 200, type: 'bpmn', cost: 3, value: 1, title: '1 🧩'},
  'V3': {y: 100, x: 300, type: 'bpmn', cost: 5, value: 3, title: '3 🧩'},
  'V6': {y: 100, x: 400, type: 'bpmn', cost: 8, value: 6, title: '6 🧩'},
  'M1': {y: 100, x: 500, type: 'money', cost: 0, value: 1, title: '1 🪙'},
  'M2': {y: 100, x: 600, type: 'money', cost: 1, value: 2, title: '2 🪙'},
  'M3': {y: 100, x: 700, type: 'money', cost: 2, value: 3, title: '3 🪙'},
  'A1': {y: 260, x: 200, type: 'action', cost: 3, value: 0, title: 'Draw a card'},
  'A2': {y: 260, x: 300, type: 'action', cost: 5, value: 0, title: 'Draw two cards'},
  'A3': {y: 260, x: 400, type: 'action', cost: 7, value: 0, title: 'Draw three cards'},
  'A4': {y: 260, x: 500, type: 'action', cost: 7, value: 2, title: 'Do a thing'},
  'A5': {y: 260, x: 600, type: 'action', cost: 7, value: 2, title: 'Do another thing'},
}

// function _Card({y, x, z=0, title, cost, value, flipped, valid, clickable, task}) {
//   return <div className="card-hitbox" style={{
//     position:'absolute',
//     top: y,
//     left: x,
//     zIndex: z,
//     visibility: 'visible',
//     transition: '0.5s',
//   }} onClick={clickable && valid ? task : () => {}}>
//     <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
//       <div className="card-front"></div>
//       <div className="card-back">
//         <span className="title">{title}<br/></span>
//         {'[+'+value+']'}<br/>
//         ({cost}🪙)
//       </div>
//     </div>
//   </div>
// }

function Card({card, x=card.x, y=card.y, z=0, task=()=>{}, flipped, clickable, valid}) {
  return <div className="card-hitbox" style={{
    position: 'absolute',
    top: y,
    left: x,
    zIndex: z,
    transition: '0.5s',
  }} onClick={clickable && valid ? task : () => {}}>
    <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
      <Flex className="card-back"></Flex>
      <Flex className={'card-front type-'+card.type} direction="column">
        <span className="title">{card.title}</span>
        <span>{'[+'+card.value+']'}</span>
        <span>({card.cost}🪙)</span>
      </Flex>
    </div>
  </div>
}

function Gameboard({}) {
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
    setDeck(shuffle(deckStart))
    placeDeck()
  }
  
  useEffect(() => {
    initDeck()
  }, [])

  function placeDeck() {
    setDeck(deck => deck.map(c => ({...c, y: 500, x: 50})))
  }

  function buyCard(id) {
    setBuys(buys-1)
    setDeck(deck => [...deck, cards[id]])
    console.log('carta comprata', id)
    console.log('carte', ...Object.keys(cards))
    setTimeout(() => placeDeck(), 1) // Delay of 1 millisecond just to render the card animation
  }

  useEffect(() => {
    setCoins(deck.slice(0, 5).map(c => c.value).reduce((sum, n) => sum+n, 0))
  }, [deck])

  return <>
    <div id="game-bg">
      <div id="hud">
        <span>Coins: {coins}🪙</span>
        <span>Buys: {buys}🔁</span>
        <span>Turns: {turns}✋🏻</span>
      </div>
      {/* {Object.keys(cards).map((id, k) => <Card
        key={k}
        y={cards[id].y}
        x={cards[id].x}
        z={2}
        title={cards[id].title}
        cost={cards[id].cost}
        value={cards[id].value}
        flipped
        clickable
        valid={cards[id].cost<=coins}
        task={() => buyCard(id)}
      />)} */}
      {Object.keys(cards).map((id, k) => <Card
        key={k}
        card={cards[id]}
        z={2}
        flipped
        clickable
        valid={cards[id].cost<=coins}
        task={() => buyCard(id)}
      />)}
      {/* {deck.slice(0, 5).map((c, i) => <Card
        key={i}
        y={500}
        x={200+i*100}
        title={c.title}
        cost={c.cost}
        value={c.value}
        flipped
      />)} */}
      {deck.slice(0, 5).map((c, i) => <Card
        key={i}
        card={c}
        y={500}
        x={200+i*100}
        flipped
      />)}
      {/* {deck.slice(5).map((c, i) => <Card
        key={i}
        y={c.y}//{500}
        x={c.x}//{50}
        z={2}
        title={c.title}
        cost={c.cost}
        value={c.value}
        clickable
        flipped={c.y!=500 && c.x!=50}
        valid={c.cost<=coins}
      />)} */}
      {deck.slice(5).map((c, i) => <Card
        key={i}
        card={c}
        z={2}
        clickable
        flipped={c.y!=500 && c.x!=50}
        valid={c.cost<=coins}
      />)}
      {/* log */}
      <button onClick={() => {
        console.log('cards', cards)
        console.log('coins:', deck.slice(0, 5).map(c => c.value).reduce((sum, n) => sum+n))
        console.log('deck', deck)
      }}>log</button>
      {/* shuffle */}
      <button onClick={() => {
        setDeck(shuffle([...deck]))
      }}>shuffle</button>
      {/* reset */}
      <button onClick={() => {
        initDeck()
      }}>reset</button>
      {/* place */}
      <button onClick={placeDeck}>place</button>
    </div>
  </>
}

export default Gameboard