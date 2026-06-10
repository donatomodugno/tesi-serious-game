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

app.get('/api/exercises', async (req, res) => {
    try {
        const ex = await dao.listExercises()
        console.log(ex)
        res.status(200).json(ex)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.get('/api/exercise/:id', async (req, res) => {
    try {
        const ex = await dao.getExercise({id: req.params.id})
        console.log(ex)
        res.status(200).json(ex)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.post('/api/exercise', async (req, res) => {
    try {
        await dao.addExercise(req.body)
        console.log('Inserimento eseguito')
        res.status(200).send('Exercise inserito nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.put('/api/exercise/:id', async (req, res) => {
    try {
        await dao.editExercise({...req.body, id: req.params.id})
        console.log('Aggiornamento eseguito')
        res.status(200).send('Exercise aggiornato nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/exercise/:id', async (req, res) => {
    try {
        await dao.deleteExercise({id: req.params.id})
        console.log('Eliminazione eseguita')
        res.status(200).send('Exercise eliminato dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})