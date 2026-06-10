import express from 'express'
import cors from 'cors'
import dao from './dao.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.listen(PORT, () => {
    console.log('Server listening on http://localhost:'+PORT)
})



// TEST

app.get('/api/ping', async (req, res) => {
    const pong = 'pong'
    console.log(pong)
    res.status(200).send(pong)//.json({msg:pong})
})



// EXERCISES

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
        const id = await dao.addExercise(req.body)
        await dao.editExercise({...req.body, name: req.body.name+' '+id, id})
        console.log('Inserimento eseguito')
        res.status(200).send(id)
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



// CARDS

app.get('/api/cards', async (req, res) => {
    try {
        const cards = await dao.listCards()
        console.log(cards)
        res.status(200).json(cards)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.get('/api/cards/:ex_id', async (req, res) => {
    try {
        const cards = await dao.listExerciseCards(req.params.ex_id)
        console.log(cards)
        res.status(200).json(cards)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.get('/api/card/:id', async (req, res) => {
    try {
        const card = await dao.getCard({id: req.params.id})
        console.log(card)
        res.status(200).json(card)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.post('/api/card', async (req, res) => {
    try {
        const id = await dao.addCard(req.body)
        await dao.editCard({name: req.body.name+' '+id, id})
        console.log('Inserimento eseguito')
        res.status(200).send(id)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.put('/api/card/:id', async (req, res) => {
    try {
        await dao.editCard({...req.body, id: req.params.id})
        console.log('Aggiornamento eseguito')
        res.status(200).send('Card aggiornata nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/card/:id', async (req, res) => {
    try {
        await dao.deleteCard(req.params.id)
        console.log('Eliminazione eseguita')
        res.status(200).send('Card eliminata dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/cards/:ex_id', async (req, res) => {
    try {
        await dao.deleteExerciseCards(req.params.ex_id)
        console.log('Eliminazioni eseguite')
        res.status(200).send('Cards eliminate dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})