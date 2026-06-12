const BASE_URL = 'http://localhost:3001'

async function request(method, path, body) {
    try {
        const res = await fetch(BASE_URL+path, {
            method: method,
            // credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        let obj
        const type = res.headers.get('content-type')
        if(type && type.indexOf('application/json')!==-1) {
            obj = await res.json()
        } else {
            obj = await res.text()
        }
        if(res.ok) {
            return obj
        } else {
            throw obj
        }
    } catch(err) {
        throw err
    }
}

const get = async (path) => request('GET', path, undefined)
const post = async (path, obj) => request('POST', path, obj)
const put = async (path, obj) => request('PUT', path, obj)
const del = async (path) => request('DELETE', path, undefined)

const API = {}

// TEST

API.ping = async () => {
    const res = await get('/api/ping')
    console.log(res)
}



// EXERCISES (API)

API.getExercises = async () => {
    return await get('/api/exercises')
}

API.getExercise = async (id) => {
    return await get('/api/exercise/'+id)
}

API.createExercise = async (exer) => {
    return await post('/api/exercise', exer)
}

API.editExercise = async (exer) => {
    await put('/api/exercise/'+exer.id, exer)
}

API.deleteExercise = async (id) => {
    await del('/api/exercise/all/'+id)
}



// CARD (API)

API.getCards = async () => {
    return await get('/api/cards')
}

API.getExerciseCards = async (ex_id) => {
    return await get('/api/cards/'+ex_id)
}

API.getCard = async (id) => {
    return await get('/api/card/'+id)
}

API.createCard = async (card) => {
    return await post('/api/card', card)
}

API.editCard = async (card) => {
    return await put('/api/card/'+card.id, card)
}

API.deleteCard = async (id) => {
    return await del('/api/card/all/'+id)
}

API.deleteExerciseCards = async (ex_id) => {
    return await del('/api/cards/all/'+ex_id)
}



// BLOCKS (API)

API.getBlocks = async () => {
    return await get('/api/blocks')
}

API.getCardBlocks = async (c_id) => {
    return await get('/api/blocks/'+c_id)
}

API.getBlock = async (id) => {
    return await get('/api/block/'+id)
}

API.createBlock = async (block) => {
    return await post('/api/block', block)
}

API.editBlock = async (block) => {
    return await put('/api/block/'+block.id, block)
}

API.deleteBlock = async (id) => {
    return await del('/api/block/'+id)
}



export default {...API}