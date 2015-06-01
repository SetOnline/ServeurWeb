module.exports.set = function (app) {
    app.get('/', function (req, res) {
        req.session.foo = req.session.foo || 3;
        res.render('accueil.ejs');
    });
    
    app.get('/test', function (req, res) {
        res.render('test.ejs');
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
    
    // definition de la route de la page d'inscription
    app.get('/inscription', function (req, res) {
        res.render('inscription.ejs');
    });
    
    // definition de la route du profil
    app.get('/profil', function (req, res) {
        res.render('profil.ejs');
    });
    
    // definition de la route du profil des autres joueurs
    app.get('/profilJoueur/:pseudo', function (req, res) {
        res.render('profilPseudo.ejs', { pseudo: req.params.pseudo });
    });

    // definition de la route du classement
    app.get('/classement', function (req, res) {
        res.render('classement.ejs');
    });
}