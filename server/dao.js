import sqlite from 'sqlite3'
// import fs from 'fs'

const db = new sqlite.Database('bpmn-game.db', (err) => {
    if(err) throw err
    else {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    desc TEXT NOT NULL
                )
            `, (err) => {
                if(err) {
                    console.error('Errore nella creazione della tabella:', err.message)
                }
            })
        })
    }
})

const exports = {}

exports.addCard = (card) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO cards(name,desc) VALUES(?,?)"
        db.run(sql, [card.name, card.desc], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.listCards = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cards"
        db.all(sql, [], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            // const cards = rows.map(c => {/*...*/})
            resolve(rows)
        })
    })
}

export default {...exports}