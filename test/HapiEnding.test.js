var Lab = require("lab"),
    Code = require('code'),
    cheerio = require('cheerio');
    lab = exports.lab = Lab.script();

var Hapi = require('hapi'),
    server = require("../plugin");

var expect = Code.expect;

lab.experiment("Hapi Ending", function() {

    var server = null,
        serverResponse,
        html;

    var defaultRoute = {
        method: "GET",
        url: "/",
        accepts: 'application/json'
    };

    function documentation(html, endpoint) {

        var parent = html('h1[data-path="'+endpoint+'"]');

        return {
            title: parent.text(),
            tags: parent.next('.tags .tag').map(function() { return html(this).text() }).get(),
            urlMapping: parent.next('p.url-mapping').text()
            // description: parent.find('.endpoint-description').text(),
            // query: table(html, parent, 'query-table'),
            // payload: table(html, parent, 'payload-table'),
        }
    };

    function table(html, parent, kind) {

        var rows = [];
        var row = parent.find('.'+kind).find('tbody tr').each(
            function(i, el) {
                rows.push({
                    key: html(this).find('.key').text(),
                    type: html(this).find('.type').text(),
                    description: html(this).find('.description').text()
                });
            }
        );

        return {
            rows: rows
        }
    }

    lab.before(function(done) {

        server = new Hapi.Server();
        server.connection({
            host: 'localhost',
            port: 3000
        });

        server.route(require('./routes/example'));

        var serverOptions = {
            enabled: true,
            logoUrl: '/blah/ping.png'
        };

        server.register({
            register: require('../plugin'),
            options: serverOptions
        }, function() {


          server.inject(defaultRoute, function(response) {
            serverResponse = response;
            html = cheerio.load(response.result);
            done();
          });

        });
    });

    lab.test("logo url is correct", function(done) {

        expect(serverResponse.statusCode).to.equal(200);
        expect(html('.tocify-wrapper img').attr('src')).to.equal('/blah/ping.png');

        done();

    });

    lab.test("list endpoints", function(done) {

        expect(serverResponse.statusCode).to.equal(200);
        expect(html('h1').length).to.equal(2);

        done();

    });

    lab.test("get endpoints", function(done) {

        var docs = documentation(html, '/checkout');

        expect(docs.title).to.equal('/checkout')
      //  expect(docs.urlMapping).to.equal('get /checkout?items=<number>');
        // expect(docs.tags[0]).to.equal('one');
        // expect(docs.tags[1]).to.equal('two');
        // expect(docs.tags[2]).to.equal('three');
        // expect(docs.description).to.equal('Tests a checkout with items');
        //
        // expect(docs.query.rows[0].key).to.equal('items');
        // expect(docs.query.rows[0].type).to.equal('number');
        // expect(docs.query.rows[0].description).to.equal('Number of items in the cart');

        done();

    });
    //
    // lab.test("payload validation", function(done) {
    //
    //     server.inject(defaultRoute, function(response) {
    //
    //         var html = cheerio.load(response.result);
    //
    //         var docs = documentation(html, 'endpoint-post;/choices/enders-game');
    //
    //         expect(docs.description).to.equal("Don't put all your eggs in one basket");
    //
    //         expect(docs.query.rows.length).to.equal(0);
    //
    //         expect(docs.payload.rows[0].key).to.equal('eggs');
    //         expect(docs.payload.rows[0].type).to.equal('number');
    //         expect(docs.payload.rows[0].description).to.equal('Eggs to go into the basket');
    //
    //         expect(docs.payload.rows[1].key).to.equal('basket');
    //         expect(docs.payload.rows[1].type).to.equal('string');
    //         expect(docs.payload.rows[1].description).to.equal('Basket type');
    //
    //         done();
    //     });
    //
    // })

});
