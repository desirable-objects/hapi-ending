const Hapi = require("hapi");

const server = Hapi.server({
    host: 'localhost',
    port: 3000
});

const init = async () => {
    try {
        await server.register([{
            plugin: require('../plugin'),
            options: {enabled: true}
        }]);
    } catch (err) {
        if (err) {
            console.log('Failed to register the plugin:', err);
            process.exit(1);
        }
    }

    server.route(require('./routes/example.js'));

    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
};

init();