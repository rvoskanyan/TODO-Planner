export default class Postman {
  constructor(url, prefix) {
    this.apiUrl = `${url}${prefix}`;
  }

  get(apiMethod, data, meta) {
    return this.send(`${apiMethod}${data ? `/${data}` : ''}${meta ? this.parseQueryString(meta) : ''}`, {
      method: 'get',
    });
  }

  post(apiMethod, data) {
    return this.send(apiMethod, {
      method: 'post',
      body: JSON.stringify(data),
    });
  }

  put(apiMethod, data) {
    return this.send(apiMethod, {
      method: 'put',
      body: JSON.stringify(data),
    });
  }

  delete(apiMethod) {

  }

  send(apiMethod, options) {
    return fetch(`${this.apiUrl}${apiMethod}`, {
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      ...options,
    }).then((response) => response.json());
  }

  parseQueryString(data) {
    let queryString = '?';

    for (const key in data) {
      queryString = `${queryString}${key}=${data[key]}&`;
    }

    return queryString.slice(0, -1);
  }
}