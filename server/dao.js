import sqlite from 'sqlite3'

// CLRUD Create List Read Update Delete
// ALGER Add List Get Edit Remove

const db = new sqlite.Database('bpmn-game.db', (err) => {
    if(err) throw err
    else {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS exercises (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                )
            `, (err) => {
                if(err) {
                    console.error('Errore nella creazione della tabella:', err.message)
                }
            })
            db.run(`
                CREATE TABLE IF NOT EXISTS cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ex_id INTEGER NOT NULL,
                    name TEXT NOT NULL
                )
            `, (err) => {
                if(err) {
                    console.error('Errore nella creazione della tabella:', err.message)
                }
            })
            db.run(`
                CREATE TABLE IF NOT EXISTS blocks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    c_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    text TEXT
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

exports.listExercises = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM exercises"
        db.all(sql, [], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            resolve(rows)
        })
    })
}

exports.getExercise = (ex) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM exercises WHERE id=?"
        db.get(sql, [ex.id], (err, row) => {
            if(err) {
                reject(err)
                return
            }
            resolve(row)
        })
    })
}

exports.addExercise = (ex) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO exercises(name) VALUES(?)"
        db.run(sql, [ex.name], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.editExercise = (ex) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE exercises SET name=? WHERE id=?"
        db.run(sql, [ex.name, ex.id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteExercise = (ex) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM exercises WHERE id=?"
        db.run(sql, [ex.id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

// exports.editExercise = ...

exports.addCard = (card) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO cards(ex_id,name) VALUES(?,?)"
        db.run(sql, [card.ex_id, card.name], (err) => {
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