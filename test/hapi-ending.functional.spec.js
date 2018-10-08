'use strict'

const { expect } = require('code')
const Hapi = require('hapi')
const cheerio = require('cheerio')

describe('hapi-ending.functional', () => {
  let html
  let server
  let serverResponse

  const defaultRoute = {
    method: 'GET',
    url: '/'
  }

  function documentation (html, endpoint) {
    const parent = html('h1[data-path="' + endpoint + '"]')

    return {
      title: parent.text(),
      tags: parent.nextUntil('h1', '.tags').find('.tag').map(function () { return html(this).text() }).get(),
      urlMapping: parent.nextUntil('h1', '.url-mapping').text(),
      description: parent.nextUntil('h1', '.endpoint-description').text(),
      query: table(html, parent.nextUntil('h1', '.query-table')),
      payload: table(html, parent.nextUntil('h1', '.payload-table')),
      params: table(html, parent.nextUntil('h1', '.params-table'))
    }
  }

  function table (html, parent) {
    let rows = []

    parent.find('tbody tr').each(
      function (i, el) {
        rows.push({
          key: html(this).find('td').slice(0, 1).text(),
          type: html(this).find('td').slice(1, 2).text(),
          description: html(this).find('td').slice(2, 3).text(),
          valids: html(this).find('td').slice(3, 4).find('.valid').map(function () { return html(this).text() }).get()
        })
      }
    )

    return {
      rows: rows
    }
  }

  before(async () => {
    server = new Hapi.Server({
      host: 'localhost',
      port: 3000
    })

    server.route(require('./routes/example'))

    const serverOptions = {
      enabled: true,
      logoUrl: '/blah/ping.png'
    }

    await server.register([{
      plugin: require('../lib/plugin'),
      options: serverOptions
    }])

    serverResponse = await server.inject(defaultRoute)
    html = cheerio.load(serverResponse.result)
  })

  it('has correct response status code', () => {
    expect(serverResponse.statusCode).to.equal(200)
  })

  it('has logo', () => {
    expect(html('.tocify-wrapper img').attr('src')).to.equal('/blah/ping.png')
  })

  it('four demo endpoints', () => {
    expect(html('h1').length).to.equal(4)
  })

  context('/checkout endpoint', () => {
    let docs

    beforeEach(() => {
      docs = documentation(html, '/checkout')
    })

    it('has correct title', () => {
      expect(docs.title).to.equal('/checkout')
    })

    it('has correct link', () => {
      expect(docs.urlMapping).to.equal('get /checkout')
    })

    it('has correct tags', () => {
      expect(docs.tags).to.equal(['one', 'two', 'three'])
    })

    it('has correct description', () => {
      expect(docs.description).to.equal('Tests a checkout with items')
    })

    it('does not contain payload info', () => {
      expect(docs.payload.rows).to.have.length(0)
    })

    it('does not contain params info', () => {
      expect(docs.params.rows).to.have.length(0)
    })

    it('contains items header', () => {
      expect(docs.query.rows[0].key).to.equal('items')
    })

    it('contains number header', () => {
      expect(docs.query.rows[0].type).to.equal('number')
    })

    it('contains description header', () => {
      expect(docs.query.rows[0].description).to.equal('Number of items in the cart')
    })
  })

  context('/choices/enders-game endpoint', () => {
    let docs

    beforeEach(() => {
      docs = documentation(html, '/choices/enders-game')
    })

    it('contains description', () => {
      expect(docs.description).to.equal("Don't put all your eggs in one basket")
    })

    it('does not contain query info', () => {
      expect(docs.query.rows).to.have.length(0)
    })

    it('does not contain params info', () => {
      expect(docs.params.rows).to.have.length(0)
    })

    it('contains first payload attribute header', () => {
      expect(docs.payload.rows[0].key).to.equal('eggs')
    })

    it('contains first payload attribute type', () => {
      expect(docs.payload.rows[0].type).to.equal('number')
    })

    it('contains first payload attribute description', () => {
      expect(docs.payload.rows[0].description).to.equal('Eggs to go into the basket')
    })

    it('contains second payload attribute header', () => {
      expect(docs.payload.rows[1].key).to.equal('basket')
    })

    it('contains second payload attribute type', () => {
      expect(docs.payload.rows[1].type).to.equal('string')
    })

    it('contains second payload attribute description', () => {
      expect(docs.payload.rows[1].description).to.equal('Basket type')
    })
  })

  context('/choices/{myParam} endpoint', () => {
    let docs

    beforeEach(() => {
      docs = documentation(html, '/choices/{myParam}')
    })

    it('does not contain query info', () => {
      expect(docs.query.rows).to.have.length(0)
    })

    it('does not contain payload info', () => {
      expect(docs.payload.rows).to.have.length(0)
    })

    it('contains params info', () => {
      expect(docs.params.rows).to.have.length(1)
    })

    it('contains first param name', () => {
      expect(docs.params.rows[0].key).to.equal('myParam')
    })

    it('contains first param type', () => {
      expect(docs.params.rows[0].type).to.equal('string')
    })

    it('contains first param description', () => {
      expect(docs.params.rows[0].description).to.equal('Your param')
    })

    it('contains first param valid attribute values', () => {
      expect(docs.params.rows[0].valids.toString()).to.equal(['dogs', 'cats'].toString())
    })
  })
})
