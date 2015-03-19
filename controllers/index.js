
module.exports.init = function (app) {
    // initialisation des routes
    var routes = require('./routes.js');
    routes.set(app);
}

module.exports.setGame = require('./setGame.js').setGame;