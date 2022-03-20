const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  let user = users.find(f => f.username === username);
  if (!user)
    return response.status(404).json({
      error: 'Usuário não encontrado'
    });

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;
  if (!name || !username) return response.status(400).send({
    error: 'Campos obrigatórios ausentes'
  });

  let user = users.find(f => f.username === username);
  if(user) return response.status(400).send({
    error: 'Usuário já existe'
  });

  let newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.json(newUser);


});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const user = request.user;
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  if (!title || !deadline) return response.status(400).send({
    error: 'Campos obrigatórios ausentes'
  });

  const user = request.user;

  let newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = request.user;

  let todo = user.todos.find(f => f.id === id);
  if (todo) {

    if (title) todo.title = title;
    if (deadline) todo.deadline = deadline;
    return response.json(todo);

  }

  return response.status(404).json({
    error: 'Todo não encontrado'
  });

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  let todo = user.todos.find(f => f.id === id);
  if (todo) {

    todo.done = true;
    return response.json(todo);

  }

  return response.status(404).json({
    error: 'Todo não encontrado'
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  let todo = user.todos.find(f => f.id === id);
  if (todo) {

    user.todos = user.todos.filter(f => f.id !== id);
    return response.sendStatus(204);

  }

  return response.status(404).json({
    error: 'Todo não encontrado'
  });
});

module.exports = app;