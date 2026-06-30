const BASE_URL = 'http://localhost:3001'

async function request(method, path, body) {
    try {
        const res = await fetch(BASE_URL+path, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        let obj = {status: res.status}
        const type = res.headers.get('content-type')
        if(type && type.indexOf('application/json')!==-1) {
            obj = await res.json()
        } else {
            obj = await res.text()
        }
        if(res.ok) {
            return obj
        } else if(res.status==404) {
            return {status: res.status}
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
    const res = await get('/api/exercise/'+id)
    return res.status==404 ? null : res
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
    return await del('/api/card/'+id)
}

API.deleteExerciseCards = async (ex_id) => {
    return await del('/api/cards/'+ex_id)
}



// RESULTS (API)

API.getResults = async () => {
    return await get('/api/results')
}

API.getExerciseResults = async (ex_id) => {
    return await get('/api/results/'+ex_id)
}

API.getResult = async (id) => {
    const res = await get('/api/result/'+id)
    return res.status==404 ? null : res
}

API.createResult = async (res) => {
    return await post('/api/result', res)
}

API.editResult = async (res) => {
    return await put('/api/result/'+res.id, res)
}

API.deleteResult = async (id) => {
    return await del('/api/result/'+id)
}

API.deleteExerciseResults = async (ex_id) => {
    return await del('/api/results/'+ex_id)
}



// USER (API)

API.getUserById = async (id) => {
    const res = await fetch(BASE_URL+'/api/user/'+id, { credentials: 'include' })
    const user = await res.json()
    if(res.ok) return user
    else throw user
}

API.login = async (credentials) => {
    const res = await fetch(BASE_URL+'/api/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    })
    if(res.ok) {
        const user = await res.json()
        return user.name
    }
    else {
        const errDetail = await res.json()
        throw errDetail.message
    }
}

API.logout = async () => {
    await fetch(BASE_URL+'/api/sessions/current', {method: 'DELETE', credentials: 'include'})
}

API.getUserInfo = async () => {
    const res = await fetch(BASE_URL+'/api/sessions/current', {credentials: 'include'})
    const userInfo = await res.json()
    if(res.ok) {
        return userInfo
    } else {
        throw userInfo
    }
}

API.getUserAuth = async () => {
    const res = await fetch(BASE_URL+'/api/sessions/current', {credentials: 'include'})
    const userInfo = await res.json()
    if(res.ok) return true
    else if(res.status==404) return false
    else throw userInfo
}



export default API