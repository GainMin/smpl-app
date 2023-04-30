const express = require('express')
const app = express()

const db = require('./mocks/data.json')

const _PORT_ = 3050

app.use(express.static('src'))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html')
})

app.get('/_api/elements', (req, res) => {
    res.send(JSON.stringify(db.data))
})

app.post('/_api/elements', (req, res) => {
    db.AI = Number(db.AI + 1)
    db.data.push({
        id: db.AI,
        ...req.body,
        bg: generateRandomGradientBG()
    })
    res.send({ message: `Element with id ${db.AI} was successfuly created` })
})

app.put('/_api/elements', (req, res) => {
    const index = db.data.findIndex(el => el.id === Number(req.body.id))
    if (index > -1){
        if (req.body.text){
            db.data[index] = { ...db.data[index], text: req.body.text }
        }

        if (req.body.index){
            let av = {...db.data[index]}
            db.data[index] = db.data[index + req.body.index]
            db.data[index + req.body.index] = av

        }
        
    }

    res.send(JSON.stringify(
        index < 0 ?
            { error: `No element with id ${req.body.id} found` } :
            { message: `Element with id ${req.body.id} was successfuly deleted` }
    ))
})

app.delete('/_api/elements', (req, res) => {
    const index = db.data.findIndex(el => el.id === Number(req.body.id))
    db.data.splice(index, 1)
    res.send(JSON.stringify(
        index < 0 ?
            { error: `No element with id ${req.body.id} found` } :
            { message: `Element with id ${req.body.id} was successfuly deleted` }
    ))
})

app.listen(_PORT_, () => console.log(`Server is listening on port ${_PORT_}`))


function generateRandomGradientBG(){
    return `linear-gradient(
        ${rnd(0, 360)}deg,
        rgb(${rnd(0, 255)}, ${rnd(0, 255)}, ${rnd(0, 255)}),
        rgb(${rnd(0, 255)}, ${rnd(0, 255)}, ${rnd(0, 255)})
    )`
}

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}