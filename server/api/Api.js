const crypto = require('crypto');
const createError = require('http-errors');

const DataBaseControl = require('../DataBaseControl');

class Api {
  constructor(app) {
    this.prefix = '/api/';
    this.app = app;
    this.db = new DataBaseControl();
  }

  initialRouters() {
    this.app.get(`${this.prefix}list`, (request, response) => this.getList(request, response));
    this.app.get(`${this.prefix}list/:id`, (request, response) => this.getListById(request, response));
    this.app.get(`${this.prefix}list/:id/tasks`, (request, response) => this.getTaskListById(request, response));
    this.app.post(`${this.prefix}list`, (request, response) => this.createList(request, response));
    this.app.put(`${this.prefix}list/:id`, (request, response) => this.editList(request, response));
    this.app.delete(`${this.prefix}list/:id`, (request, response) => this.deleteList(request, response));

    this.app.get(`${this.prefix}task/:id`, (request, response) => this.getTaskById(request, response));
    this.app.post(`${this.prefix}task`, (request, response) => this.createTask(request, response));
    this.app.put(`${this.prefix}task/:id`, (request, response) => this.editTask(request, response));
    this.app.delete(`${this.prefix}task/:id`, (request, response) => this.deleteTask(request, response));

    this.app.use((error, req, res, next) => {
      res.status(error.status || 500);
      res.json({
        status: error.status,
        message: error.message,
        stack: error.stack,
      });
    });
  }

  getList(request, response) {
    const result = this.db.getItems('lists');

    response.send({
      list: result,
    });
  }

  getListById(request, response) {
    const result = this.db.getItemById(request.params.id, 'lists');

    response.send({
      list: result,
    });
  }

  getTaskListById(request, response) {
    const result = this.db.getItemsByFieldValue('listId', request.params.id, 'tasks');

    response.send({
      list: result,
    });
  }

  createList(request, response) {
    const { name, date } = request.body;

    if (!name || !name.length || !date || !date.length) {
      throw createError(400, 'Required field is not filled');
    }
    if (typeof (name) !== 'string' || typeof (date) !== 'string') {
      throw createError(400, 'Invalid data type');
    }

    const currentDate = new Date().toString();
    const id = crypto.randomBytes(16).toString('hex');

    this.db.addItem([id, name, date, currentDate, currentDate], 'lists');

    response.send('success');
  }

  editList(request, response) {
    const { id } = request.params;
    const { name, date } = request.body;

    if ((!id || !id.length)) {
      throw createError(400, 'Missing identifier');
    }

    if ((!name || !name.length) && (!date || !date.length)) {
      throw createError(400, 'There is no data');
    }

    if ((name && (typeof (name) !== 'string')) || (date && (typeof (date) !== 'string'))) {
      throw createError(400, 'Invalid data type');
    }

    const currentDate = new Date().toString();

    this.db.editItemById(id, [name && ['name', name], date && ['date', date], ['dateUpdate', currentDate]], 'lists');

    response.send('success');
  }

  deleteList(request, response) {
    this.db.deleteItem(request.params.id, 'lists');

    response.send('success');
  }

  getTaskById(request, response) {
    const result = this.db.getItemById(request.params.id, 'tasks');

    response.send({
      list: result,
    });
  }

  createTask(request, response) {
    const { text, listId } = request.body;

    if (!text || !text.length || !listId || !listId.length) {
      throw createError(400, 'Required field is not filled');
    }
    if (typeof (text) !== 'string' || typeof (listId) !== 'string') {
      throw createError(400, 'Invalid data type');
    }

    const currentDate = new Date().toString();
    const id = crypto.randomBytes(16).toString('hex');

    this.db.addItem([id, text, false, listId, currentDate, currentDate], 'tasks');

    response.send('success');
  }

  editTask(request, response) {
    const { id } = request.params;
    const { text, done } = request.body;

    if ((!id || !id.length)) {
      throw createError(400, 'Missing identifier');
    }

    if ((!text || !text.length)) {
      throw createError(400, 'There is no data');
    }

    if ((text && (typeof (text) !== 'string')) || (done !== undefined && (typeof (done) !== 'boolean'))) {
      throw createError(400, 'Invalid data type');
    }

    const currentDate = new Date().toString();

    this.db.editItemById(
        id, [
          text && ['text', text],
          (done !== undefined) && ['done', done],
          ['dateUpdate', currentDate],
        ], 'tasks');

    response.send('success');
  }

  deleteTask(request, response) {
    this.db.deleteItem(request.params.id, 'tasks');

    response.send('success');
  }
}

module.exports = Api;
