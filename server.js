const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')

const availableLanguages = require('./alphabets/index.json')

const server = new http.Server((request, response) => {
  const requestUrl = url.parse(request.url, true).pathname
  const requestQuery = url.parse(request.url, true).query

  if (requestUrl === '/') {
    response.writeHead(200, { 'Content-Type': 'text/json' })
    response.write(JSON.stringify(availableLanguages))
  } else if (requestUrl === '/language') {
    const queryLanguage = requestQuery.language
    const queryAlphabet = requestQuery.alphabet

    if (
      !/^([a-z]{0,50}$)/.test(queryLanguage) ||
      !/^([a-z]{0,50}$)/.test(queryAlphabet)
    ) {
      response.writeHead(404)
      response.end()
      return
    }

    const language = availableLanguages.find((language) => {
      return language.name === queryLanguage
    })

    const alphabet = language ? language.alphabets.find((alphabet) => {
      return alphabet.name === queryAlphabet
    }) : null

    if (language && alphabet) {
      const filePath = path.join(
        __dirname,
        'alphabets',
        language.name,
        alphabet.name + '.zip'
      )

      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.writeHead(404)
          response.end()
        } else {
          response.setHeader('Status', 200)
          response.setHeader('Content-Type', 'application/zip');
          response.setHeader('Content-length', data.buffer.byteLength);
          response.end(data)
        }
      })
    } else {
      response.writeHead(404)
      response.end()
    }
  } else {
    response.writeHead(404)
    response.end()
  }
})

server.listen(process.env.PORT || 5000);
