var Lab = require("lab"),
    Code = require('code'),
    cheerio = require('cheerio');
    lab = exports.lab = Lab.script();

var Hapi = require('hapi'),
    server = require("../plugin");

var expect = Code.expect;

lab.experiment("Hapi Ending", function() {

    var server = null;

    var defaultRoute = {
        method: "GET",
        url: "/",
        accepts: 'application/json'
    };

    function documentation(html, id) {

        var parent = html('.route').find('a[name="'+id+'"]').parent('.route');

        return {
            linkText: html('a[href="#'+id+'"]').text(),
            title: parent.find('.endpoint').text(),
            tags: parent.find('.tag').map(function() { return html(this).text() }).get(),
            description: parent.find('.endpoint-description').text(),
            query: table(html, parent, 'query-table'),
            payload: table(html, parent, 'payload-table'),
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
        server.route(require('./routes/example'));

        var serverOptions = {
            enabled: true
        };

        server.pack.register({
            plugin: require('../plugin'),
            options: serverOptions
        }, function() {
            done();
        });
    });

    lab.test("list endpoints", function(done) {

        server.inject(defaultRoute, function(response) {

            var html = cheerio.load(response.result);

            expect(response.statusCode).to.equal(200);
            expect(html('.route').length).to.equal(3);
            expect(html('.route-link').length).to.equal(3);

            done();
        });

    });

    lab.test("get endpoints", function(done) {

        server.inject(defaultRoute, function(response) {

            var html = cheerio.load(response.result);

            var docs = documentation(html, 'endpoint-get;/checkout');

            expect(docs.linkText).to.equal('/checkout');
            expect(docs.title).to.equal('get /checkout?items=<number>');
            expect(docs.tags[0]).to.equal('one');
            expect(docs.tags[1]).to.equal('two');
            expect(docs.tags[2]).to.equal('three');
            expect(docs.description).to.equal('Tests a checkout with items');

            expect(docs.query.rows[0].key).to.equal('items');
            expect(docs.query.rows[0].type).to.equal('number');
            expect(docs.query.rows[0].description).to.equal('Number of items in the cart');

            done();
        });

    });

    lab.test("payload validation", function(done) {

        server.inject(defaultRoute, function(response) {

            var html = cheerio.load(response.result);

            var docs = documentation(html, 'endpoint-post;/choices/enders-game');

            expect(docs.description).to.equal("Don't put all your eggs in one basket");

            expect(docs.query.rows.length).to.equal(0);

            expect(docs.payload.rows[0].key).to.equal('eggs');
            expect(docs.payload.rows[0].type).to.equal('number');
            expect(docs.payload.rows[0].description).to.equal('Eggs to go into the basket');

            expect(docs.payload.rows[1].key).to.equal('basket');
            expect(docs.payload.rows[1].type).to.equal('string');
            expect(docs.payload.rows[1].description).to.equal('Basket type');

            done();
        });

    })

});
