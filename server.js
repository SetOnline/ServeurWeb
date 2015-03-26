//framework express
var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var myCookieParser = cookieParser('secret');
var SessionSockets = require('session.socket.io');
var app = express();

// creation du serveur
var port = process.env.port || 1337; // port du serveur
var server = app.listen(port);

// creation comm client serveur
var io = require('socket.io')(server);

//gestion cookie - session
var sessionStore = new expressSession.MemoryStore();

// socket io + session 
var sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);

app.use(myCookieParser);
app.use(expressSession({ secret: 'secret', store: sessionStore }));

// emetteur d'evenements
var EventEmitter = require('events').EventEmitter;
var jeu = new EventEmitter();

app.use(express.static(__dirname + "/public"));

var controllers = require('./controllers');
controllers.init(app);
var game = controllers.setGame;
var bdd = controllers.bdd;
var Utilisateur = controllers.utilisateur;
// GLOBALES
var tempsDePartie = 5000; // duree d'une partie (en ms)
var tempsRestant = 0; // temps restant sur la partie (en s)
var nbSetsTrouvablesPartieEnCours = 0; // nombre de set partie en cours


// declancher à chaque connexion d'un client
// socket est la variable associe à chacun des clients dans la fonction de callback
// dans cette fonction de callback on defini les fonctions qui vont modifier les variables propres à chaque client
sessionSockets.on('connection', function (err, socket, session) {
    
    session.utilisateur = session.utilisateur || 0;  // si l'utilisateur n'est pas co on met 0
    session.foo = session.foo + 1;
    session.save();
    console.log('Un client est connecte. utilisateur : ');
    console.log(session.utilisateur);
    socket.nbSetsValidesRestants = 0;

    // reinitialisation du nombre de set restant
    jeu.on('Nouvelle partie', function (nouvelleCombi) {
        socket.nbSetsValidesRestants = 0;
    });

    // ecouteur de l'evennement Set d'un client, verifie si le set est valide
    socket.on('Set', function (setJoueur) {
        var setPropose = JSON.parse(setJoueur);
        if (game.estUnSetValide(setPropose[0].value, setPropose[1].value, setPropose[2].value)) {
            socket.nbSetsValidesRestants -= 1;
            if (socket.nbSetsValidesRestants < 0)
                socket.nbSetsValidesRestants = nbSetsTrouvablesPartieEnCours - 1;
            setPropose.push({ name: 'nbSetsRestants', value: socket.nbSetsValidesRestants });
            socket.emit('Set valide', JSON.stringify(setPropose));
        } else {
            socket.emit('Set invalide', setJoueur);
        }
    });

    // creation compte
    socket.on('Creation compte', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var mail = compte[0].value;
        var pseudo = compte[1].value;
        var mdp = compte[2].value;

        var usr = new Utilisateur(mail, pseudo, mdp);
        usr.insereBdd(bdd);

        var resultat = [];
        resultat.push({ name: 'adresse_mail', value: 'true' });
        resultat.push({ name: 'pseudo', value: 'true' });
        resultat.push({ name: 'mdp', value: 'true' });
        socket.emit('Resultat inscription',  JSON.stringify(resultat));
    });
    
    
    // connexion
    socket.on('Connexion', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var pseudo = compte[0].value;
        var mdp = compte[1].value;
        bdd.connexionUser(pseudo, mdp, socket, session, Utilisateur);
    });

    // profil
    socket.on('Demande mon profil', function () {
        console.log('Demande mon profil');
        socket.emit('Reponse mon profil', 0); // ici on ne sait pas encore ce qu'on va envoyer
    });

    // desinscription
    socket.on('Desinscription', function () {
        var compte = JSON.parse(compteJSON);
        console.log("Desinscription");
        var pseudo = compte[0].value;
        var mdp = compte[1].value;
        console.log("desinscription du compte : " + pseudo + " " + mdp);
    });

    // modification profil
    socket.on('Modifier profil', function (profilJSON) {
        var profil = JSON.parse(profilJSON);
        console.log('Modifier profil');
        var ancienmdp = profil[0].value;
        var nouveaumdp = profil[0].value;
        var nvelavatar = profil[0].value;
        console.log("modif profil fini");
    });

    socket.on('Deco', function (profilJSON) {
        console.log("deco");
    });
});

// informations envoyées à tout les joueurs 

// definition du declanchement de la fonction timer chaque seconde
setInterval(function () {
    tempsRestant--;
    io.sockets.emit('timer', tempsRestant);
}, 1000);

// definition du declanchement de la nouvelle partie chaque tempsDePartie (variable globale definie en haut du fichier)
setInterval(function () {
    var nouveauJeu = game.genererNouvellePartieEnJSON();
    
    var infoPartie = JSON.parse(nouveauJeu);
    console.log('Nouvelle partie ! ' + infoPartie[12].value);
    tempsRestant = tempsDePartie / 1000;
    io.sockets.emit('Nouvelle partie', nouveauJeu);
}, tempsDePartie);