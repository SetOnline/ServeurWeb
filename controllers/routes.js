module.exports.set = function (app) {
    app.get('/', function (req, res) {
        res.setHeader('content-Type', 'text/plain');
        res.end('Vous �tes � l\'accueil');
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
        if (req.session.utilisateur != 0) {
            res.render('profil.ejs');
        }
        else {
            res.setHeader('content-Type', 'text/plain');
            res.end('Vous �tes � l\'accueil');
        }  
    });

    // definition de la route du classement
    app.get('/classement', function (req, res) {
        res.render('classement.ejs');
    });
}