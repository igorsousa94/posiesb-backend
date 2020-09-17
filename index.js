const express = require("express");
const { response } = require("express");
const app =  express();
const uuid = require('uuid').v4;
const jwt = require('jsonwebtoken');
const secret = 'backendiesb';

let tasks = [];

/*Iniciando servidor*/
app.listen(10000, () => {
    console.log("servidor iniciado");
});

/*Configurando respostas do servidor como json e configurando toker para todas rotas, exceto login e url inicial*/
app.use(express.json());
app.use((req, resp, next) => {
    const token  = req.headers['token'];
    if(req.url === "/" || req.url === "/login"){
        next();
        return;
    }
    try{
        jwt.verify(token, secret);
    } catch (error) {
        resp.status(401).send({message:"token inválido"});
        return;
    };
    next();
});

/**Requisicao para url inicial do sistema */
app.get("/", (request, response) => {
    response.send({'message':'ok'});
});

/**Requisicao para login */
app.post("/login", (request, response) => {

    const usuario = request.body.username; 
    const senha = request.body.password;

    if(usuario === "usuario" && senha === "123456"){
        var token = jwt.sign({ username: 'usuario', role: 'admin'}, secret, {
            expiresIn: '1h'
        });
        response.status(200).send({token});
    } else {
        response.status(401).send({message: 'Error in username or password'});
    }
});

/*Requisicao para listar as tarefas*/
app.get('/tasks', (request, response) => {
    response.status(200).send(tasks);
});

/**Requisicao buscando item pelo id na lista*/
app.get('/tasks/:id', (request, response) => {
    let tarefa = tasks.find(t => t.id == request.params.id);
    if(tarefa){
        response.status(200).send(tarefa);
    } else {
        response.status(404).send({message: "Tarefa não encontrada"});
    }
});

/*Requisicao para cadastrar tarefa*/
app.post('/tasks', (request, response) => {
    const body = request.body
    const task = {
        id: uuid(),
        title: body.title,
        description: body.description,
        isDone: body.isDone || false,
        isPriority: body.isPriority || false
    }
    /**valida dados do request, caso contrario bad request */
    if(task){
        tasks.push(task);
        response.status(201).send(task);
    } else {
        response.status(400).send({message: "requisição inválida"});
    }
});

/**Requisicao alterando item da lista de tarefas */
app.put('/tasks/:id', (request, response) => {
    let foundIndex = tasks.findIndex(x => x.id == request.params.id);
    tasks[foundIndex] = {
        id: request.params.id,
        ...request.body
    };
    if(tasks[foundIndex]){
        response.status(200).send(tasks[foundIndex]);
    } else {
        response.status(404).send({message: "Tarefa não encontrada"});
    }
});

/**Requisicao apagando item da lista de tarefas */
app.delete('/tasks/:id', (request, response) => {
    let task = tasks.find(t => t.id == request.params.id);
    if (task) {
        tasks = tasks.filter(t => t.id != request.params.id);
        response.status(200).send(task);
    } else {
        response.status(404).send({message: "Não foi possível excluir a tarefa informada"});
    }
});