var Joi = require('joi');

function handler(request, reply) {
    return reply().code(200);
}

module.exports = [{
    method: 'GET',
    path: '/checkout',
    config: {
        validate: {
            query: {
                items: Joi.number().description('Number of items in the cart')
            }
        },
        tags: ['one', 'two', 'three'],
        description: 'Tests a checkout with items',
        notes: ['tests get request']
    },
    handler: handler
}];
