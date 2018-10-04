const Lab = require("lab"),
      Code = require('code'),
      Hapi = require('hapi'),
      cheerio = require('cheerio');

const lab = exports.lab = Lab.script();
const expect = Code.expect;

lab.experiment("Hapi Ending", () => {

    let html, server, serverResponse;
    let defaultRoute = {
        method: "GET",
        url: "/"
    };

    function documentation(html, endpoint) {

        const parent = html('h1[data-path="'+endpoint+'"]');

        return {
            title: parent.text(),
            tags: parent.nextUntil('h1', '.tags').find('.tag').map(function() { return html(this).text() }).get(),
            urlMapping: parent.nextUntil('h1', '.url-mapping').text(),
            description: parent.nextUntil('h1', '.endpoint-description').text(),
            query: table(html, parent.nextUntil('h1', '.query-table')),
            payload: table(html, parent.nextUntil('h1', '.payload-table')),
            params: table(html, parent.nextUntil('h1', '.params-table'))
        }
    }

    function table(html, parent) {

        let rows = [];

        parent.find('tbody tr').each(
            function(i, el) {
                rows.push({
                    key: html(this).find('td').slice(0,1).text(),
                    type: html(this).find('td').slice(1,2).text(),
                    description: html(this).find('td').slice(2,3).text(),
                    valid: html(this).find('td').slice(3,4).find('.valid').map(function() { return html(this).text() }).get(),
                });
            }
        );

        return {
            rows: rows
        }
    }

    lab.before(async () => {

        server = new Hapi.Server({
            host: 'localhost',
            port: 3000
        });

        server.route(require('./routes/example'));

        const serverOptions = {
            enabled: true,
            logoUrl: '/blah/ping.png'
        };

        await server.register([{
            plugin: require('../plugin'),
            options: serverOptions
        }]);

        serverResponse = await server.inject(defaultRoute);
        html = cheerio.load(serverResponse.result);
    });

    lab.test("logo url is correct", () => {
        expect(serverResponse.statusCode).to.equal(200);
        expect(html('.tocify-wrapper img').attr('src')).to.equal('/blah/ping.png');
    });

    lab.test("list endpoints", () => {
        expect(serverResponse.statusCode).to.equal(200);
        expect(html('h1').length).to.equal(4);
    });

    lab.test("query validation", () => {
        const docs = documentation(html, '/checkout');

        expect(docs.title).to.equal('/checkout');
        expect(docs.urlMapping).to.equal('get /checkout');
        expect(docs.tags[0]).to.equal('one');
        expect(docs.tags[1]).to.equal('two');
        expect(docs.tags[2]).to.equal('three');
        expect(docs.description).to.equal('Tests a checkout with items');

        expect(docs.payload.rows.length).to.equal(0);
        expect(docs.params.rows.length).to.equal(0);

        expect(docs.query.rows[0].key).to.equal('items');
        expect(docs.query.rows[0].type).to.equal('number');
        expect(docs.query.rows[0].description).to.equal('Number of items in the cart');
    });

    lab.test("payload validation", () => {
        const docs = documentation(html, '/choices/enders-game');

        expect(docs.description).to.equal("Don't put all your eggs in one basket");

        expect(docs.query.rows.length).to.equal(0);
        expect(docs.params.rows.length).to.equal(0);

        expect(docs.payload.rows[0].key).to.equal('eggs');
        expect(docs.payload.rows[0].type).to.equal('number');
        expect(docs.payload.rows[0].description).to.equal('Eggs to go into the basket');

        expect(docs.payload.rows[1].key).to.equal('basket');
        expect(docs.payload.rows[1].type).to.equal('string');
        expect(docs.payload.rows[1].description).to.equal('Basket type');
    });

    lab.test("params validation", () => {
        const docs = documentation(html, '/choices/{myParam}');

        expect(docs.query.rows.length).to.equal(0);
        expect(docs.payload.rows.length).to.equal(0);
        expect(docs.params.rows.length).to.equal(1);

        expect(docs.params.rows[0].key).to.equal('myParam');
        expect(docs.params.rows[0].type).to.equal('string');
        expect(docs.params.rows[0].description).to.equal('Your param');
        expect(docs.params.rows[0].valid.toString()).to.equal(['dogs', 'cats'].toString());
    });

});
