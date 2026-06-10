import sqlite from 'sqlite3'

// CLRUD Create List Read Update Delete
// ALGER Add List Get Edit Remove

const db = new sqlite.Database('bpmn-game.db', (err) => {
    if(err) throw err
    else {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS exercises (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL
                )
            `, (err) => {
                if(err) {
                    console.error('Errore nella creazione della tabella:', err.message)
                }
            })
            db.run(`
                CREATE TABLE IF NOT EXISTS cards (
                    id INTEGER PRIMARY KEY,
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
                    id INTEGER PRIMARY KEY,
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



// EXERCISES (DAO)

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
        db.run(sql, [ex.name], function (err) {
            if(err) {
                reject(err)
                return
            }
            resolve(this.lastID)
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



// CARDS (DAO)

exports.listCards = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cards"
        db.all(sql, [], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            resolve(rows)
        })
    })
}

exports.listExerciseCards = (ex_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cards WHERE ex_id=?"
        db.all(sql, [ex_id], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            resolve(rows)
        })
    })
}

exports.getCard = (card) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cards WHERE id=?"
        db.get(sql, [card.id], (err, row) => {
            if(err) {
                reject(err)
                return
            }
            resolve(row)
        })
    })
}

exports.addCard = (card) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO cards(ex_id,name) VALUES(?,?)"
        db.run(sql, [card.ex_id, card.name], function (err) {
            if(err) {
                reject(err)
                return
            }
            resolve(this.lastID)
        })
    })
}

exports.editCard = (card) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE cards SET name=? WHERE id=?"
        db.run(sql, [card.name, card.id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteCard = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM cards WHERE id=?"
        db.run(sql, [id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteExerciseCards = (ex_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM cards WHERE ex_id=?"
        db.run(sql, [ex_id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

export default {...exports}