const express = require('express');

const app = express();
app.use(express.json());

const employees= [
    {
        id: 1,
        name: 'Sandeep', 
        age:27
    },
    {
        id: 2,
        name: 'Pooja',
        age:24
    }
];

app.get('/', (req, resp) => {
    resp.send("Welcome to express");
})

app.get('square/:n', (req, resp) => {
    var n = Number(req.params.n);
    resp.send(`Square of ${n}: ${n*n}`);
})

app.get('/employees', (req, resp) => {
    resp.json(employees);
})

app.post('/employees', (req, resp) => {
    var e = {
        id: Number(req.body.id),
        name: req.body.name,
        age: Number(req.body.age)
    };

    employees.push(e);
    resp.json(employees);
})

app.listen(9000, () => {
    console.log("Server Started listening")
});