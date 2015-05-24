
// module d'index pour acceder aux autres modules

module.exports.init = function (app) {
    // initialisation des routes
    var routes = require('./routes.js');
    routes.set(app);
}

module.exports.setGame = require('./setGame.js').setGame;

module.exports.bdd = require('./bdd.js').bdd;

module.exports.utilisateur = require('./utilisateur.js').utilisateur;