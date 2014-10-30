var Hapi = require("hapi");
var server = new Hapi.Server(3000, "localhost");

server.pack.register({
    plugin: require('./plugin.js'),
    options: {
        enabled: true
    }
    }, function(err) {
        if (err) { console.log(err); }

        server.route(require('./test/routes/example.js'));

        server.start(function() {
            console.log("Hapi server started @", server.info.uri);
        });
    })
