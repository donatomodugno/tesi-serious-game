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

API.ping = async () => {
    const res = await get('/api/ping')
    console.log(res)
}

// API.cards = async () => {
//     const res = await get('/api/cards')
//     return res
// }

// API.card = async (card) => {
//     const res = await post('/api/card', card)
//     return res
// }

API.getExercises = async () => {
    return await get('/api/exercises')
}

API.getExercise = async (ex) => {
    return await get('/api/exercise/'+ex.id)
}

API.createExercise = async (ex) => {
    return await post('/api/exercise', ex)
}

API.editExercise = async (ex) => {
    await put('/api/exercise/'+ex.id, ex)
}

API.deleteExercise = async (ex) => {
    await del('/api/exercise/'+ex.id)
}

export default {...API}