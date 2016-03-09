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

        //console.log(server.table()[0]);
        //console.log(server.table()[0].table[0].public.settings.validate);

        server.start(function() {
            console.log("Hapi server started @", server.info.uri);
        });
    })
