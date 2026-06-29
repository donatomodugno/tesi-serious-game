import { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import {
  Flex, Box, Space, Modal, Button, Title, Text, Splitter,
  Loader, Progress, RingProgress, List, ColorSwatch,
  Tooltip
} from '@mantine/core'
import '@mantine/core/styles.css'
import './Gameboard.css'
import { Icon } from '../icons'
import API from '../API'
import { BpmnModeler, BpmnViewer } from './'
import { default as Modeler } from 'bpmn-js/lib/Modeler'
import emptyBpmnXml from '../assets/empty2.bpmn?raw'

const stock_cards = {
  'C1': {type: 'coins', name: '1 🪙', cost: 0, bonus: 1, draws: 0, buys: 0, turns: 0},
  'C2': {type: 'coins', name: '2 🪙', cost: 1, bonus: 2, draws: 0, buys: 0, turns: 0},
  'C3': {type: 'coins', name: '3 🪙', cost: 2, bonus: 3, draws: 0, buys: 0, turns: 0},
}
const GRID = {
  SEP: 80,
  DIST: 100,
  XDCK: 50, X1: 200, X2: 500, /* XWST: 850, */ XWST: 50,
  Y1:   50,
  Y2:   230,
  YSEL: 420,
  Y3:   470,
}
function shuffle(arr) {
  for(let icurr = arr.length-1; icurr>=0; icurr--) {
    let irand = Math.floor(Math.random()*(icurr+1)); // Semicolon required
    [arr[icurr], arr[irand]] = [arr[irand], arr[icurr]]
  }
  return arr
}

function Card({ref, card, x, y, task=()=>{}, flipped=false, clickable, valid, showCost=true}) {
  return <>
    <div
      ref={ref}
      className="card-hitbox"
      style={{
        position: 'absolute',
        top: y,
        left: x,
        transition: '0.5s',
      }}
      onClick={clickable && (valid || card.type=='bpmn') ? task : () => {}}
    >
      <div className={'card' + (flipped ? ' flipped' : '') + (clickable ? valid ? ' valid' : ' invalid' : '')}>
        <Flex className="card-back"></Flex>
        <Flex
          className={'card-front type-'+card.type}
          direction="column" justify="space-between" align="center"
        >
          {card.type=='coins' && <Title order={3} ta="center" py="20">{card.bonus}🪙</Title>}
          {card.type=='bpmn' && <Title order={3} ta="center" py="10">{card.name}</Title>}
          {card.type=='action' && <Text fw="700" ta="center">{card.name}</Text>}
          {card.type=='action' && <div>
            {card.draws>0 && <Text>+{card.draws}🃏</Text>}
            {card.buys>0 && <Text mt="-8">+{card.buys}🛒</Text>}
            {card.turns>0 && <Text mt="-8">+{card.turns}✋🏻</Text>}
            {card.bonus>=0 && <Text fz="sm" c="green">[+{card.bonus}🪙]</Text>}
            {card.bonus<0 && <Text fz="sm" c="red">[{card.bonus}🪙]</Text>}
          </div>}
          {card.type=='bpmn' && <Text ta="center" fz="90%">BPMN elem.</Text>}
          <Text ta="center" fz="sm" p="0">{showCost && <>Cost: {card.cost}🪙</>}</Text>
        </Flex>
      </div>
    </div>
  </>
}

function GameView({exercise, finishGame, cards, setCards, bpmnToSpawn, setBpmnToSpawn, deck, setDeck, progress}) {
  const settingsPerTurn = {
    bpmn: 2,
    action: 2,
    hand: 5,
    buys: 1,
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
    setHand(settingsPerTurn.hand)
    setWaste(0)
    // Shuffle deck
    setDeck(shuffle(deck).map(c => ({...c, selected: false})))
  }, [turn])

  useEffect(() => {
    // Test
    // console.log(deck.slice(deck.length-waste, deck.length))
    // Win scenario
    if(progress>=100) setModal(
      {
        // title: 'Game finished!',
        text: <>
          <Title order={3}>Game finished!</Title>
          <b>Results:</b>
          You collected all the BPMN elements! (100%)
        </>,
        confirmText: 'Edit BPMN diagram',
        confirm: finishGame
      }
    )
    // Next turn when buys finish
    if(buys==0) {
      // Modal shows during game
      if(turn>=totalTurns) setModal(
        {
          // title: 'Game finished!',
          text: <>
            <Title order={3}>Game finished!</Title>
            <b>Results:</b>
            You collected <b>{deck.filter(c => c.type=='bpmn').length}</b> BPMN elements
            out of <b>{deck.filter(c => c.type=='bpmn').length+cards.bpmn.length}</b>
            {' '}({Math.round(progress)}%)
          </>,
          confirmText: 'Edit BPMN diagram',
          confirm: finishGame
        }
      )
      else setModal(
        {text: 'Next turn!', confirmText: 'Go!', confirm: () => setTurn(turn+1)}
      )
      setBuys(settingsPerTurn.buys)
    }
    // Reset selections
    setDeck(deck.map(c => ({...c, selected: false})))
    // Recount available coins
    setAvCoins(() =>
      deck
      .slice(0, hand)
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
    setAvCoins((coins) => coins>0 ? coins : 0)
  }, [buys])

  useEffect(() => {
    setAvCoins(
      deck
      .slice(0, hand)
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
    setAvCoins((coins) => coins>0 ? coins : 0)
    setSelCoins(
      deck
      .slice(0, hand)
      .filter(c => c.type!='coins' || (c.type=='coins' && c.selected))
      .map(c => c.bonus)
      .reduce((sum, n) => sum+n, 0)
    )
    setSelCoins((coins) => coins>0 ? coins : 0)
  }, [deck])

  return cards.bpmn && cards.action && <>
    <ModalGameAlert
      opened={modal!=null}
      title={modal?.title}
      text={modal?.text}
      confirmText={modal?.confirmText}
      confirm={() => {
        modal?.confirm()
        setModal(null)
      }}
      cancel={modal?.cancel || null}
      disabled={modal?.disabled || false}
      // confirm={modal?.confirm||(() => setModal(null))}
      hideConfirm={modal?.hideConfirm || false}
    />
    <div id="game-bg">
      <Flex justify="center" align="center" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
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
      <button onClick={() => setTurn(totalTurns-1)}>cheat!</button>
      <Button
        color="green" variant="default" w="170" m="10"
        onClick={() => setBuys(0)}
      >End turn</Button>
      {/* <button onClick={() => console.log(deck.slice(deck.length-waste, deck.length))}>waste</button> */}
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
      {cards.bpmn.slice(0, settingsPerTurn.bpmn).map((c, k) => <Tooltip
        key={k} label="Click to preview" position="bottom"
      ><Card
        // Carte bpmn da comprare
        card={c}
        x={GRID.X1+k*GRID.DIST}
        y={GRID.Y1}
        clickable
        valid
        task={() => {
          setModal({
            title: 'BPMN preview',
            text: <BpmnViewer bpmn={c.bpmn}/>,
            confirmText: 'Buy card',
            confirm: () => {
              setBpmnToSpawn(c.bpmn)
              setDeck((deck) => [...deck, {...c, x: GRID.X1+k*GRID.DIST, y: GRID.Y1, flipped: false}])
              setTimeout(() => {
                setDeck((deck) => deck.toSpliced(-1, 1, {...c, x: undefined, y: undefined, flipped: undefined}))
              }, 1) // Delay of 1 millis just to render the animation
              setCards({...cards, bpmn: cards.bpmn.toSpliced(k, 1)})
              setBuys(buys-1)
            },
            cancel: () => setModal(null),
            disabled: selCoins<c.cost
          })
        }}
      /></Tooltip>)}
      {cards.action.slice(0, settingsPerTurn.action).map((c, k) => <Card
        // Carte action da comprare
        key={k}
        card={c}
        x={GRID.X1+k*GRID.DIST}
        y={GRID.Y2}
        clickable
        valid={selCoins>=c.cost}
        task={() => {
          setDeck((deck) => [...deck, {...c, x: GRID.X1+k*GRID.DIST, y: GRID.Y2, flipped: false}])
          setTimeout(() => {
            setDeck((deck) => deck.toSpliced(-1, 1, {...c, x: undefined, y: undefined, flipped: undefined}))
          }, 1) // Delay of 1 millis just to render the animation
          // if(c.type=='bpmn' || c.type=='action') {
          //   setWaste(deck.filter(c => c.selected).length)
          //   setDeck([
          //     ...deck
          //       .reduce((acc, c) => {
          //         if(c.selected) return [...acc, c]
          //         else return [c, ...acc]
          //       }, [])
          //       .map(c => ({...c, selected: false})),
          //     c
          //   ])
          // }
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
        x={GRID.X1+(hand>6 ? k*600/hand : k*GRID.DIST)}
        y={c.selected ? GRID.YSEL : GRID.Y3}
        clickable
        valid={c.type!='action' || (c.draws || c.buys || c.turns)}
        task={() => {
          if(c.type=='coins') {
            // Just select it
            setDeck(deck.toSpliced(k, 1, {...c, selected: !c?.selected}))
          }
          if(c.type=='action') {
            // Run its effect immediately
            setWaste(waste+1)
            setHand(hand-1+c?.draws)
            if(c.buys) setBuys(buys+c.buys)
            if(c.turns) setTotalTurns(totalTurns+c.turns)
            setDeck((deck) => [...deck.toSpliced(k, 1), {...c, x: GRID.X1+k*GRID.DIST, y: GRID.Y3, flipped: false}])
            setTimeout(() => {
              setDeck((deck) => deck.toSpliced(-1, 1, {...c, x: undefined, y: undefined, flipped: undefined}))
            }, 100) // Delay of 1 millis just to render the animation
          }
          if(c.type=='bpmn') {
            // Preview BPMN elements
            setModal({
              title: 'BPMN preview',
              text: <BpmnViewer bpmn={c.bpmn}/>,
              cancel: () => setModal(null),
              hideConfirm: true
            })
          }
        }}
        showCost={false}
      />)}
      {deck.slice(deck.length-waste, deck.length).map((c, k) => <Card
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

function ModalGameAlert({opened, title='', text, confirmText, confirm, cancel, disabled, hideConfirm}) {
  return <Modal
    opened={opened}
    onClose={cancel || (() => {})}
    title={title && <Title order={3}>{title}</Title>}
    overlayProps={{backgroundOpacity: 0.5}}
    transitionProps={{transition: 'slide-up'}}
    centered
    withCloseButton={title}
    size="auto"
  >
    <Flex justify="center" direction="column" ta="center">{text}</Flex>
    <Flex justify="center" gap="md" mt="20">
      {cancel && <Button color="grey" onClick={cancel}>Back</Button>}
      {!hideConfirm && <Tooltip label="Not enough coins selected" withArrow arrowSize={7} events={{hover: disabled}}>
        <Button color="green" onClick={confirm} disabled={disabled}>{confirmText}</Button>
      </Tooltip>}
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
      <Text>Obtained cards: {deck.length}</Text>
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
        <List.Item icon={<ColorSwatch color="#1AB" size={16}/>}>{deck.filter(c => c.type=='action').length} Actions</List.Item>
        <List.Item icon={<ColorSwatch color="#FC0" size={16}/>}>{deck.filter(c => c.type=='coins').length} Coins</List.Item>
        <List.Item icon={<ColorSwatch color="#D48" size={16}/>}>{deck.filter(c => c.type=='bpmn').length} BPMN elements</List.Item>
      </List>
    </Flex>
  </>
}

function GameModeler({bpmnToSpawn, setBpmnToSpawn, w='100%', h='500'}) {
  const containerRef = useRef(null)
  const modelerRef = useRef(null)
  
  const init = async () => {
    await modelerRef.current?.importXML(emptyBpmnXml)
    const canvas = modelerRef.current.get('canvas')
    canvas.zoom('fit-viewport')
  }

  const spawn = async () => {
    console.log(bpmnToSpawn)
    if(bpmnToSpawn) {
      const tempModeler = new Modeler()
      await tempModeler.importXML(bpmnToSpawn)
      const tempElementRegistry = tempModeler.get('elementRegistry')
      const tempCP = tempModeler.get('copyPaste')
      const tempClip = tempModeler.get('clipboard')
      const mainCP = modelerRef.current.get('copyPaste')
      const mainClip = modelerRef.current.get('clipboard')
      const elementsToSpawn = tempElementRegistry.filter(
        e => e.type!=='bpmn:Process' && e.type!=='bpmn:Collaboration' && !e.labelTarget
      )
      if(elementsToSpawn.length==0) { return }
      tempCP.copy(elementsToSpawn)
      mainClip.set(tempClip.get())
      mainCP.paste({
        element: modelerRef.current.get('canvas').getRootElement(),
        point: {
          x: 300,
          y: 100+Math.floor(Math.random()*400)
        },
      })
      tempModeler.destroy()
    }
  }

  useEffect(() => { spawn() }, [bpmnToSpawn])
  
  useEffect(() => {
    modelerRef.current = new Modeler({container: containerRef.current})
    init()
    return () => {
      if(modelerRef.current) modelerRef.current.destroy()
    }
  }, [])
  
  return <Flex direction="column" w={w} h={h} justify="center" align="center">
    <div
      ref={containerRef}
      style={{ 
        width: '100%',
        height: '100%',
        backgroundColor: '#CDF'
      }}
    />
  </Flex>
}

function Gameboard({logged}) {
  const [exercise, setExercise] = useState({})
  const [cards, setCards] = useState([])
  const [deck, setDeck] = useState([])
  const [progress, setProgress] = useState(0)
  const [page, setPage] = useState('loading')
  const [collapsed, setCollapsed] = useState(-1)
  const [bpmnToSpawn, setBpmnToSpawn] = useState('')
  const {ex_id} = useParams()

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
    {/* {page=='finished' && <Navigate to={'/play/'+ex_id+'/results'}/>} */}
    {page=='finished' && <Results
      logged={logged} reload={() => {
        setPage('loading')
        loadExercise()
      }}
      progress={progress} cards={cards} deck={deck}
    />}
    {page=='loading' && <>
      <Flex w="100%" h="100%" justify="center" align="center">
        <Loader color="green" size="xl"/>
      </Flex>
    </>}
    {page=='loaded' && <>
      <Splitter
        h="92%"
        shiftStep={5}
        handleColor={collapsed>=0 ? ['#090','orange'][collapsed] : '#006'}
        lineSize={15}
        onCollapseChange={(index, collapsed) => setCollapsed(collapsed ? index : -1)}
      >
        <Splitter.Pane defaultSize={70} min={70} collapsible>
          <Flex h="100%">
            <Box w={GRID.SEP+'%'}>
              <GameView
                exercise={exercise} finishGame={() => setPage('finished')}
                cards={cards} setCards={setCards}
                bpmnToSpawn={bpmnToSpawn} setBpmnToSpawn={setBpmnToSpawn}
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
        </Splitter.Pane>
        <Splitter.Pane defaultSize={30} min={10} collapsible>
          <GameModeler
            w="100%" h="100%"
            bpmnToSpawn={bpmnToSpawn} setBpmnToSpawn={setBpmnToSpawn}
          />
        </Splitter.Pane>
      </Splitter>
    </>}
  </>
}

function Results({logged, reload, progress, cards, deck}) {
  const {ex_id} = useParams()
  return <Flex w="100%" h="70%" justify="space-evenly" align="center" direction="column">
    <Title>Results</Title>
    <Title order={3}>
      You collected {deck.filter(c => c.type=='bpmn').length} BPMN elements
      out of {deck.filter(c => c.type=='bpmn').length+cards.bpmn.length}
      {' '}({Math.round(progress)}%)
    </Title>
    <Flex gap="md">
      <Link to="/home">
        <Button color="green" size="lg">Choose another exercise</Button>
      </Link>
      <Link to={'/play/'+ex_id}>
        <Button color="green" size="lg" onClick={reload}>Try again</Button>
      </Link>
      {logged && <Link to={'/edit/'+ex_id}>
        <Button color="green" size="lg">Edit exercise</Button>
      </Link>}
    </Flex>
  </Flex>
}

export default Gameboard