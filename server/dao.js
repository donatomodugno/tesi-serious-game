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
                    console.error('Error while creating table: ', err.message)
                }
            })
            db.run(`
                CREATE TABLE IF NOT EXISTS cards (
                    id INTEGER PRIMARY KEY,
                    ex_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    cost INTEGER NOT NULL
                )
            `, (err) => {
                if(err) {
                    console.error('Error while creating table: ', err.message)
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
                    console.error('Error while creating table: ', err.message)
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

exports.getExercise = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM exercises WHERE id=?"
        db.get(sql, [id], (err, row) => {
            if(err) {
                reject(err)
                return
            }
            resolve(row)
        })
    })
}

exports.addExercise = (exer) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO exercises(name) VALUES(?)"
        db.run(sql, [exer.name], function (err) {
            if(err) {
                reject(err)
                return
            }
            resolve(this.lastID)
        })
    })
}

exports.editExercise = (exer) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE exercises SET name=? WHERE id=?"
        db.run(sql, [exer.name, exer.id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteExercise = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM exercises WHERE id=?"
        db.run(sql, [id], (err) => {
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

exports.getCard = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM cards WHERE id=?"
        db.get(sql, [id], (err, row) => {
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
        const sql = "INSERT INTO cards(ex_id,name,cost) VALUES(?,?,?)"
        db.run(sql, [card.ex_id, card.name, card.cost], function (err) {
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
        const sql = "UPDATE cards SET name=?,cost=? WHERE id=?"
        db.run(sql, [card.name, card.cost, card.id], (err) => {
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



// BLOCKS (DAO)

exports.listBlocks = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM blocks"
        db.all(sql, [], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            resolve(rows)
        })
    })
}

exports.listCardBlocks = (c_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM blocks WHERE c_id=?"
        db.all(sql, [c_id], (err, rows) => {
            if(err) {
                reject(err)
                return
            }
            resolve(rows)
        })
    })
}

exports.getBlock = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM blocks WHERE id=?"
        db.get(sql, [id], (err, row) => {
            if(err) {
                reject(err)
                return
            }
            resolve(row)
        })
    })
}

exports.addBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO blocks(c_id,type,text) VALUES(?,?,?)"
        db.run(sql, [block.c_id, block.type, block.text], function (err) {
            if(err) {
                reject(err)
                return
            }
            resolve(this.lastID)
        })
    })
}

exports.editBlock = (block) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE blocks SET type=?,text=? WHERE id=?"
        db.run(sql, [block.type, block.text, block.id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteBlock = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM blocks WHERE id=?"
        db.run(sql, [id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

exports.deleteCardBlocks = (c_id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM blocks WHERE c_id=?"
        db.run(sql, [c_id], (err) => {
            if(err) {
                reject(err)
                return
            }
            resolve()
        })
    })
}

export default {...exports}