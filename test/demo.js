var Hapi = require("hapi");
var server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: 3000
});

server.register({
  register: require('../plugin'),
  options: { enabled: true }
  }, function(err) {
        if (err) { console.log(err); }

        server.route(require('./routes/example.js'));

        server.start(function() {
            console.log("Hapi server started @", server.info.uri);
        });
    })
