import express from 'express'
import cors from 'cors'
import dao from './dao.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/api/ping', async (req, res) => {
    const pong = 'pong'
    console.log(pong)
    res.status(200).send(pong)//.json({msg:pong})
})

app.get('/api/cards', async (req, res) => {
    try {
        const cards = await dao.listCards()
        console.log(cards)
        res.status(200).json(cards)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.post('/api/card', async (req, res) => {
    try {
        await dao.addCard(req.body)
        res.status(200).send('Card inserita nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})