const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  userAccount = users.find(user => user.username === username);

  if(!userAccount) {
    return response.status(400).json({error: "User account doesn't exist."});
  }

  request.userAccount = userAccount;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const costumerExists = users.some(user => user.username === username);

  if(costumerExists) {
    return response.status(400).json({error: "Username already exist."});
  }

  const costumer = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  users.push(costumer);

  return response.status(201).json(costumer);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;

  return response.send(userAccount.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { title, deadline } = request.body;
   const { userAccount } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userAccount.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { userAccount } = request;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo doesn't exist."})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo doesn't exist."})
  }

  todo.done = true;
  
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const todo = userAccount.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo doesn't exist."})
  }

  userAccount.todos.splice(userAccount.todos.indexOf(todo), 1);

  return response.status(204).json(userAccount);
});

module.exports = app;