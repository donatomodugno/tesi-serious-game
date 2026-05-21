import { use, useState } from 'react'
import './Gameboard.css'
import API from '../API'

function Gameboard({}) {
  const [cards, setCards] = useState([
    {title: 'aaaa', type: 'task', y:150, x:200},
    // {title: 'bbbb', type: 'task'},
    // {title: 'cccc', type: 'task'},
  ])
  const [coins, setCoins] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const positions = [
    {y:150,x:200},
    {y:150,x:450},
    {y:250,x:300},
  ]
  const [posActive, setPosActive] = useState(0)

  return(<>
    <div id="game-bg">
      {/*
        <button onClick={() => API.card({name:'aa',desc:'aa'})}>scrivi</button>
        <button onClick={() => API.cards()}>leggi</button>
      */}
      <div>Coins: {coins}, posActive: {posActive}</div>
      <button onClick={() => setPosActive((posActive+1)%positions.length)}>Sposta</button>
      {cards.map((c,i) => (
        <div key={i} className="card-hitbox" style={{
          position:'relative',
          top:positions[posActive].y,
          left:positions[posActive].x,
          visibility: 'visible',
          transition: 0.5,
        }}>
          <div className="card" style={{transform: posActive==2 && 'rotateY(180deg)'}}>
            <div className="card-front">{c.type}</div>
            <div className="card-back">{c.title}</div>
          </div>
        </div>
      ))}
    </div>
  </>)
}

export default Gameboard