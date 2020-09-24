# Iniciando Rails API

Comece buildando
```
$ cd cnab-parser-api
$ docker-compose build
```


Então crie o banco de dados, as migrações e as sementes
```
$ docker-compose run app bundle exec rails db:create
$ docker-compose run app bundle exec rails db:migrate
$ docker-compose run app bundle exec rails db:seed
```

Finalmente, inicie a aplicação
```
$ docker-compose up --build
$ docker run -d --name app app
```

Obs: a `aplicação` estará rodando em `localhost:3000`, verifique se não há nenhum serviço rodando nesta porta.

# Abrindo aplicação Web

Abra o arquivo [Document reader app](./index.html) em um browser moderno com Internet!

Pronto!

----------------------------------------------------------
# Documentação
A documento da API pode ser vista em `localhost:3000/apipie`

Obs:
- Rotas `Públicas` são as que não precisam de autenticação do usuário
- Rotas `Privadas` necessitam de autenticação do usuário para comunicar com a api, sendo obrigatório a presença dos seguintes cabeçalhos em num requisição: 

```js
// Exemplo
new Headers({
  'access-token': <access-token>, 
  'expiry'; <expiry>, 
  'token-type': <token-type>, 
  'uid'; <uid>, 
  'client': <client>
})
```


## Autenticação

### Registro
### POST /auth (Pública)
#### @param {String} email
#### @param {String} password

Registra usuário na aplicação
```js
// Exemplo
fetch("http://localhost:3000/api/v1/auth", {
  "headers": {
    "accept": "application/json",
    "content-type": "application/json",
  },
  "body": "{\"email\":\"teste@teste.com\",\"password\":\"123456\"}",
  "method": "POST",
});

// @return
// {"success":true,"data":{"id":1, ...}}
```

### Login (Pública)
### POST /auth/sign_in
#### @param {String} email
#### @param {String} password

Autentica usuário na aplicação
```js
// Exemplo
fetch("http://localhost:3000/api/v1/auth/sign_in", {
  "headers": {
    "accept": "application/json",
    "content-type": "application/json",
  },
  "body": "{\"email\":\"teste@teste.com\",\"password\":\"123456\"}",
  "method": "POST",
});

// @return
// Headers
// {
//   "access-token": "EmRccQj_dDlE5I4FwGS4Lg",
//   "client": "7CDv1ykwnNCSszklc6EFnA",
//   "expiry": "1602134234",
//   "token-type": "Bearer",
//   "uid": "teste@teste.com"
// }
// {"success":true,"data":{"id":1, ...}}
```

### Logout (Privada)
### POST /auth/sign_out

Efetua logout na aplicação
```js
// Exemplo
fetch("http://localhost:3000/api/v1/auth/sign_out", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "application/json",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "body": null,
  "method": "DELETE",
});

// @return
// empty
```

### Validar Token (Privada)
### POST /auth/validate_token

Valida token do usuário na aplicação
```js
// Exemplo
fetch("http://localhost:3000/api/v1/auth/validate_token", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "application/json",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "method": "GET",
  "mode": "cors"
});

// @return
// {"success":true,"data":{"id":1, ...}}
```

----------------------------------------------------------------
## Cnab

Os `Documentos` carregados são lidos, normalizados e salvos,
assim, possibilitando sua manipulação

### Lista de registros
### GET /cnabs

Lista todos os `cnabs` (registros de transações) salvos
```js
// Exemplo
fetch("http://localhost:3000/api/v1/cnabs", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "application/json",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "method": "GET",
  "mode": "cors"
});

// @return
// { "data":[...] }
```

### Destruir registro
### DELETE /cnabs/:id
#### @param {Number} id Código do registro a ser deletado

```js
// Exemplo
fetch("http://localhost:3000/api/v1/cnabs/1", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "application/json",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "method": "DELETE"
});

// @return
// empty
```


-----------------------------------------------------
## Documento

Cada documento carregado por usuário é salvo, normalizado e extraído suas informações para que possam ser manipuladas
### Listar Documentos
### GET /documents 
```js


// @return
// { "data":[...] }
```

### Criar Documento
### POST /documents 
#### @param {FormData} file
```js
// Exemplo
fetch("http://localhost:3000/api/v1/documents", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryHokI80M95SAJk1CI",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "body": "------WebKitFormBoundaryHokI80M95SAJk1CI\r\nContent-Disposition: form-data; name=\"file\"; filename=\"CNAB.txt\"\r\nContent-Type: text/plain\r\n\r\n\r\n------WebKitFormBoundaryHokI80M95SAJk1CI--\r\n",
  "method": "POST"
});

// @return
// { "data":{"id":1,"name":"CNAB.txt","processed_at":"2020-09-24T05:30:05.339Z"} }
```

### Destruir documento
### DELETE /documents/:id
#### @param {Number} id Código do registro a ser deletado

```js
// Exemplo
fetch("http://localhost:3000/api/v1/documents/1", {
  "headers": {
    "accept": "application/json",
    "access-token": "O5VSQTvTX92WpjBZTnmROg",
    "client": "HOrdyMeG5VfTmhK6rnT_UA",
    "content-type": "application/json",
    "expiry": "1602134345",
    "token-type": "Bearer",
    "uid": "teste@teste.com"
  },
  "method": "DELETE"
});

// @return
// empty
```

----------------------------------------------------
# Testando

```
$ docker-compose run app rspec
$ docker cp app:/app/coverage .
$ xdg-open ./coverage/index.html
```