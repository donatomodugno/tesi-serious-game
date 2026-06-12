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



// GLOBAL

app.delete('/api/all', async (req, res) => {
    try {
        const promises = []
        const exercises = await dao.listExercises()
        const cards = await dao.listCards()
        const blocks = await dao.listBlocks()
        promises.push(
            exercises.map(e => dao.deleteExercise(e.id)),
            cards.map(c => dao.deleteCard(c.id)),
            blocks.map(b => dao.deleteBlock(b.id)),
        )
        await Promise.all(promises)
        console.log('Deletes done.')
        res.status(200).send('Exercise + cards + blocks eliminati dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
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
        const ex = await dao.getExercise(req.params.id)
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
        console.log('Insertion done.')
        res.status(200).send(id)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.put('/api/exercise/:id', async (req, res) => {
    try {
        await dao.editExercise({...req.body, id: req.params.id})
        console.log('Update done.')
        res.status(200).send('Exercise aggiornato nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/exercise/:id', async (req, res) => {
    try {
        await dao.deleteExercise(req.params.id)
        console.log('Delete done.')
        res.status(200).send('Exercise eliminato dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/exercise/all/:id', async (req, res) => {
    try {
        //     Modo 1
        // const cards = await dao.listExerciseCards(req.params.id)
        // const promises = cards.map(c => dao.deleteCardBlocks(c.id))
        // await Promise.all(promises)
        //     Modo 2
        // const cards = await dao.listExerciseCards(req.params.id)
        // await Promise.all(cards.map(c =>  dao.deleteCardBlocks(c.id)))
        //     Modo 3
        await Promise.all(
            (await dao.listExerciseCards(req.params.id))
            .map(c => dao.deleteCardBlocks(c.id))
        )
        //     Successivo
        await dao.deleteExerciseCards(req.params.id)
        await dao.deleteExercise(req.params.id)
        console.log('Deletes done.')
        res.status(200).send('Exercise + cards + blocks eliminati dal db.')
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
        const card = await dao.getCard(req.params.id)
        console.log(card)
        res.status(200).json(card)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.post('/api/card', async (req, res) => {
    try {
        const id = await dao.addCard(req.body)
        await dao.editCard({...req.body, name: req.body.name+' '+id, id})
        console.log('Insertion done.')
        res.status(200).send(id)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.put('/api/card/:id', async (req, res) => {
    try {
        await dao.editCard({...req.body, id: req.params.id})
        console.log('Update done.')
        res.status(200).send('Card aggiornata nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/card/:id', async (req, res) => {
    try {
        await dao.deleteCard(req.params.id)
        console.log('Delete done.')
        res.status(200).send('Card eliminata dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/card/all/:id', async (req, res) => {
    try {
        await dao.deleteCardBlocks(req.params.id)
        await dao.deleteCard(req.params.id)
        console.log('Deletes done.')
        res.status(200).send('Card + blocks eliminati dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/cards/:ex_id', async (req, res) => {
    try {
        await dao.deleteExerciseCards(req.params.ex_id)
        console.log('Deletes done.')
        res.status(200).send('Cards eliminate dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/cards/all/:ex_id', async (req, res) => {
    try {
        await Promise.all(
            (await dao.listExerciseCards(req.params.ex_id))
            .map(c => dao.deleteCardBlocks(c.id))
        )
        await dao.deleteExerciseCards(req.params.ex_id)
        console.log('Deletes done.')
        res.status(200).send('Cards + blocks eliminati dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})



// BLOCKS

app.get('/api/blocks', async (req, res) => {
    try {
        const blocks = await dao.listBlocks()
        console.log(blocks)
        res.status(200).json(blocks)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.get('/api/blocks/:c_id', async (req, res) => {
    try {
        const blocks = await dao.listCardBlocks(req.params.c_id)
        console.log(blocks)
        res.status(200).json(blocks)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.get('/api/block/:id', async (req, res) => {
    try {
        const block = await dao.getBlock(req.params.id)
        console.log(block)
        res.status(200).json(block)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.post('/api/block', async (req, res) => {
    try {
        const id = await dao.addBlock(req.body)
        await dao.editBlock({...req.body, id})
        console.log('Insertion done.')
        res.status(200).send(id)
    } catch(err) {
        res.status(503).json(err)
    }
})

app.put('/api/block/:id', async (req, res) => {
    try {
        await dao.editBlock({...req.body, id: req.params.id})
        console.log('Update done.')
        res.status(200).send('Block aggiornato nel db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/block/:id', async (req, res) => {
    try {
        await dao.deleteBlock(req.params.id)
        console.log('Delete done.')
        res.status(200).send('Block eliminato dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})

app.delete('/api/blocks/:c_id', async (req, res) => {
    try {
        await dao.deleteCardBlocks(req.params.c_id)
        console.log('Deletes done.')
        res.status(200).send('Blocks eliminati dal db.')
    } catch(err) {
        res.status(503).json(err)
    }
})