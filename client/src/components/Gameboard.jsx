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
  DIST: 100,
  XDCK: 50, X1: 200, X2: 500, XWST: 750,
  Y1:   120,
  Y2:   280,
  YSEL: 470,
  Y3:   520,
}
function shuffle(arr) {
  for(let icurr = arr.length-1; icurr>=0; icurr--) {
    let irand = Math.floor(Math.random()*(icurr+1)); // Semicolon required
    [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  }
  return arr
}

function Card({card, x, y, task=()=>{}, flipped=false, clickable, valid, showCost=true}) {
  return <>
    <div
      className="card-hitbox"
      style={{
        position: 'absolute',
        top: y,
        left: x,
        transition: '0.5s',
      }}
      onClick={clickable && valid ? task : () => {}}
    >
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

function GameView({exercise, finishGame, cards, setCards, deck, setDeck, progress}) {
  const settingsPerTurn = {
    bpmn: 2,
    action: 2,
    hand: 5,
    buys: 3,
  }
  const [avCoins, setAvCoins] = useState(0)
  const [selCoins, setSelCoins] = useState(0)
  const [buys, setBuys] = useState(settingsPerTurn.buys)
  const [totalTurns, setTotalTurns] = useState(exercise.turns)
  const [turn, setTurn] = useState(1)
  const [hand, setHand] = useState(settingsPerTurn.hand)
  const [waste, setWaste] = useState(0)
  const [modal, setModal] = useState(null)
  
  useEffect(() => {
    setWaste(0)
    // Shuffle deck
    setDeck(shuffle(deck).map(c => ({...c, selected: false})))
  }, [turn])

  useEffect(() => {
    // Win scenario
    if(progress>=100) setModal(
      {text: 'Game finished!', confirmText: 'See results', confirm: finishGame}
    )
    // Next turn when buys finish
    if(buys==0) {
      // Modal shows during game
      if(turn>=totalTurns) setModal(
        {text: 'Game finished!', confirmText: 'See results', confirm: finishGame}
      )
      else setModal(
        {text: 'Next turn!', confirmText: 'Go!', confirm: () => setTurn(turn+1)}
      )
      setBuys(settingsPerTurn.buys)
    }
    // Reset selections
    setDeck(deck.map(c => ({...c, selected: false})))
    // Recount available coins
    setAvCoins(
      deck
      .slice(0, hand)
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
  }, [buys])

  useEffect(() => {
    setSelCoins(
      deck
      .slice(0, hand)
      .filter(c => c.type!='coins' || (c.type=='coins' && c.selected))
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
  }, [deck])

  return cards.bpmn && cards.action && <>
    <ModalGameAlert
      opened={modal!=null}
      text={modal?.text}
      confirmText={modal?.confirmText}
      confirm={() => {
        modal?.confirm()
        setModal(null)
      }}
      // confirm={modal?.confirm||(() => setModal(null))}
    />
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
        <Text ml="20">Turn: {turn}/{totalTurns}✋🏻</Text>
        <Text>Remaining buys: {buys}🛒</Text>
        <Text>Available coins: {avCoins}🪙</Text>
        <Text>Selected coins: {selCoins}🪙</Text>
      </Flex>
      <Flex id="legend" direction="column" w="170" gap="lg">
        <Title order={4} ta="center">Legend</Title>
        <Text>&nbsp;+N 🃏<br/>Draw N cards</Text>
        <Text>&nbsp;+N 🛒<br/>Add N buys in a turn</Text>
        <Text>&nbsp;+N ✋🏻<br/>Add N turns</Text>
      </Flex>
      <button onClick={() => setTurn(totalTurns-2)}>cheat!</button>
      {Object.keys(stock_cards).map((id, k) => <Card
        // Carte coins da comprare
        key={k}
        card={stock_cards[id]}
        x={GRID.X2+k*GRID.DIST}
        y={GRID.Y1}
        clickable
        valid={selCoins>=stock_cards[id].cost}
        task={() => {
          setDeck((deck) => [...deck, {...stock_cards[id], x: GRID.X2+k*GRID.DIST, y: GRID.Y1, flipped: false}])
          setTimeout(() => {
            setDeck((deck) => deck.toSpliced(-1, 1, {...stock_cards[id], x: undefined, y: undefined, flipped: undefined}))
          }, 1) // Delay of 1 millis just to render the animation
          setBuys(buys-1)
        }}
      />)}
      {cards.bpmn.slice(0, settingsPerTurn.bpmn).map((c, k) => <Card
        // Carte bpmn da comprare
        key={k}
        card={c}
        x={GRID.X1+k*GRID.DIST}
        y={GRID.Y1}
        clickable
        valid={selCoins>=c.cost}
        task={() => {
          setDeck((deck) => [...deck, {...c, x: GRID.X1+k*GRID.DIST, y: GRID.Y1, flipped: false}])
          setTimeout(() => {
            setDeck((deck) => deck.toSpliced(-1, 1, {...c, x: undefined, y: undefined, flipped: undefined}))
          }, 1) // Delay of 1 millis just to render the animation
          setCards({...cards, bpmn: cards.bpmn.toSpliced(k, 1)})
          setBuys(buys-1)
        }}
      />)}
      {cards.action.slice(0, settingsPerTurn.action).map((c, k) => <Card
        // Carte action da comprare
        key={k}
        card={c}
        x={GRID.X1+k*GRID.DIST}
        y={GRID.Y2}
        clickable
        valid={selCoins>=c.cost}
        task={() => {
          if(c.type=='bpmn' || c.type=='action') {
            setWaste(deck.filter(c => c.selected).length)
            setDeck([
              ...deck
                .reduce((acc, c) => {
                  if(c.selected) return [...acc, c]
                  else return [c, ...acc]
                }, [])
                .map(c => ({...c, selected: false})),
              c
            ])
          }
          setCards({...cards, action: cards.action.toSpliced(k, 1)})
          setBuys(buys-1)
        }}
      />)}
      {deck.slice(hand, deck.length).map((c, k) => <Card
        // Mazzo capovolto
        key={k}
        card={c}
        x={c.x ?? GRID.XDCK}
        y={c.y ?? GRID.Y3}
        clickable
        valid={false}
        flipped={c.flipped ?? true}
      />)}
      {deck.slice(0, hand).map((c, k) => <Card
        // Mano di marte del caz... mano di carte del mazzo
        key={k}
        card={c}
        x={GRID.X1+k*500/hand}
        y={c.selected ? GRID.YSEL : GRID.Y3}
        clickable={c.type!='bpmn'}
        valid
        task={() => {
          if(c.type=='coins') {
            setDeck(deck.toSpliced(k, 1, {...c, selected: !c?.selected}))
          }
        }}
        showCost={false}
      />)}
      {deck.slice(-waste, 0).map((c, k) => <Card
        // Carte scartate (usate)
        key={k}
        card={c}
        x={c.x ?? GRID.XWST}
        y={c.y ?? GRID.Y3}
        clickable={false}
        flipped={c.flipped ?? true}
      />)}
    </div>
  </>
}

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

function ProgressPanel({logged, exercise, cards, deck, progress=0}) {
  return cards.bpmn && cards.action && <>
    <Flex id="panel" h="92%" direction="column" gap="sm" px="40" pt="40">
      <Flex direction="column">
        <Title size="md" order={3}>Exercise</Title>
        <Title order={3} c="#005">{exercise.name}</Title>
      </Flex>
        {logged && <Link to={'/edit/'+exercise.id}><Button w="100%" color="green">Edit exercise</Button></Link>}
      <Title size="md" order={3} mt="30">Your progress</Title>
      <Progress.Root size="30">
        <Progress.Section value={progress} color="green">
          <Progress.Label>{Math.round(progress)}%</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <Title size="md" order={3} mt="30">Deck composition</Title>
      <Text>N. of cards: {deck.length}</Text>
      <RingProgress
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
  const [progress, setProgress] = useState(0)
  const [page, setPage] = useState('loading')
  const ex_id = useParams().id

  const loadExercise = async () => {
    // Exercise and page status
    const ex = await API.getExercise(ex_id)
    setExercise(ex)
    if(!ex) setPage('invalid')
    else setPage('loaded')
    // Cards and Deck
    const exercise_cards = shuffle(await API.getExerciseCards(ex_id))
    const loaded_cards = {
      bpmn: exercise_cards.filter(c => c.type=='bpmn'),
      action: exercise_cards.filter(c => c.type=='action'),
      coins: exercise_cards.filter(c => c.type=='coins'),
    }
    setCards(loaded_cards)
    setDeck([
      ...Array(7).fill(stock_cards['C1']),
      ...loaded_cards.action.splice(0, Math.min(loaded_cards.action.length, 3))
    ])
  }
  
  useEffect(() => {
    if(cards.bpmn) setProgress(
      // Calculating 100*deck_bpmn/total_bpmn (the total is the sum of cards already in deck and cards not obtained yet)
      100*deck.filter(c => c.type=='bpmn').length/(deck.filter(c => c.type=='bpmn').length+cards.bpmn.length)
    )
  }, [deck])

  useEffect(() => {
    loadExercise()
  }, [])

  return <>
    {page=='invalid' && <Navigate to="/"/>}
    {page=='finished' && <Navigate to={'/play/'+ex_id+'/results'}/>}
    {page=='loading' && <>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Loader color="green" size="xl"/>
      </Flex>
    </>}
    {page=='loaded' && <>
      <Flex h="100%">
        <Box w={GRID.SEP+'%'}>
          <GameView
            exercise={exercise} finishGame={() => setPage('finished')}
            cards={cards} setCards={setCards}
            deck={deck} setDeck={setDeck}
            progress={progress}
          />
        </Box>
        <Box w={100-GRID.SEP+'%'}>
          <ProgressPanel
            logged={logged} progress={progress}
            exercise={exercise} cards={cards} deck={deck}
          />
        </Box>
      </Flex>
    </>}
  </>
}

export default Gameboard