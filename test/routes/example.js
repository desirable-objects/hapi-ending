var Joi = require('joi');

function handler(request, reply) {
    return reply().code(200);
}

module.exports = [

{
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
},

{
    method: 'POST',
    path: '/choices/enders-game',
    config: {
        validate: {
            payload: {
                eggs: Joi.number().description('Eggs to go into the basket'),
                basket: Joi.string().description('Basket type')
            }
        },
        tags: ['dont', 'in-one', 'put'],
        description: "Don't put all your eggs in one basket",
        notes: [
            'sayings are said',
            'things are done'
        ]
    },
    handler: handler
}

];
