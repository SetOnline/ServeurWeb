module.exports.set = function (app) {
    app.get('/', function (req, res) {
        res.setHeader('content-Type', 'text/plain');
        res.end('Vous êtes à l\'accueil');
    });
    
    // definition de la route du jeu
    app.get('/game', function (req, res) {
        res.render('game.ejs');
    });
    
    // definition de la route de l'accueil
    app.get('/accueil', function (req, res) {
        req.session.foo = req.session.foo || 3;
        res.render('accueil.ejs');
    });
    
    // definition de la route du jeu
    app.get('/inscription', function (req, res) {
        res.render('inscription.ejs');
    });
    
    // definition de la route du jeu
    app.get('/profil', function (req, res) {
        res.render('profil.ejs');
    });
}