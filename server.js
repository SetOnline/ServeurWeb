//framework express
var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var myCookieParser = cookieParser('secret');
var SessionSockets = require('session.socket.io');
var FileStore = require('session-file-store')(expressSession);
var app = express();

// creation du serveur
var port = process.env.port || 1337; // port du serveur
var server = app.listen(port);

// creation comm client serveur
var io = require('socket.io')(server);


// socket io + session 
var sessionSockets = new SessionSockets(io, new FileStore(), myCookieParser);

app.use(myCookieParser);
app.use(expressSession({ secret: 'secret', store: new FileStore() }));

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
var tempsDePartie = 30000; // duree d'une partie (en ms)
var tempsRestant = 30; // temps restant sur la partie (en s)
var nbSetsTrouvablesPartieEnCours = 0; // nombre de set partie en cours
var classementTempsReel = 0; // contiendra le tableau du classement de la partie en cours
var nouveauJeu = 0; // contient le jeu

// declancher à chaque connexion d'un client
// socket est la variable associe à chacun des clients dans la fonction de callback
// dans cette fonction de callback on defini les fonctions qui vont modifier les variables propres à chaque client
sessionSockets.on('connection', function (err, socket, session) {
    session.utilisateur = session.utilisateur || 0;
    socket.nbPtsPartie = 0;
    socket.multiplicateur = 1;
    console.log('Un client est connecte. utilisateur : ');
    console.log(session.utilisateur);
    socket.nbSetsValidesRestants = nbSetsTrouvablesPartieEnCours;
    socket.nbPartiesAffilees = 0; // trophee 10, 20 parties d'affilées
    socket.setDejaJoue = [];
    
    /////////////////////////////////////////////////
    // GESTION DU JEU
    /////////////////////////////////////////////////

    // si un jeu est en cours en l'envoie quand il se connecte
    if (nouveauJeu != 0) {
        socket.emit('Nouvelle partie', nouveauJeu);
    }
    
    socket.on('Demande partie en cours', function () {
        socket.emit('Nouvelle partie', nouveauJeu);
    });

    // reinitialisation du nombre de set restant
    jeu.on('Nouvelle partie', function () {
        if (socket.nbPtsPartie != 0 && session.utilisateur != 0)
            bdd.addScoreUser(session.utilisateur.idUtilisateur, socket.nbPtsPartie);
        // s il a pas trouve de set a la partie d'avant
        if (socket.multiplicateur == 1) {
            socket.nbPartiesAffilees = 0;
        }
        socket.nbPtsPartie = 0;
        socket.multiplicateur = 1;
        socket.setDejaJoue = [];
        socket.nbSetsValidesRestants = nbSetsTrouvablesPartieEnCours;
    });

    // ecouteur de l'evennement Set d'un client, verifie si le set est valide
    socket.on('Set', function (setJoueur) {
        game.gestionSet(setJoueur, session.utilisateur.idUtilisateur, session.utilisateur.pseudo, classementTempsReel, socket, bdd);
    });

    /////////////////////////////////////////////////
    // GESTION DES UTILISATEURS
    /////////////////////////////////////////////////
    
    socket.on('Connexion', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var pseudo = compte[0].value;
        var mdp = compte[1].value;
        bdd.connexionUser(pseudo, mdp, socket, session, Utilisateur);
    });
    
    // creation compte
    socket.on('Creation compte', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var mail = compte[0].value;
        var pseudo = compte[1].value;
        var mdp = compte[2].value;
        
        var usr = new Utilisateur(mail, pseudo, mdp);
        usr.insereBdd(bdd, socket);
    });
    
    // deconnexion
    socket.on('Deco', function () {
        session.utilisateur = 0;
        session.save();
        console.log("deco");
    });
    
    socket.on('Est connecte', function () {
        if (session.utilisateur != 0)
            socket.emit('Resultat est connecte', session.utilisateur.pseudo);
        else
            socket.emit('Resultat est connecte', 0);
    }); 
    
    /////////////////////////////////////////////////
    // GESTION DES CLASSEMENTS
    /////////////////////////////////////////////////
    
    socket.on('Demande classement', function () {
        bdd.classement(socket);
    });
    
    socket.on('Demande classement jour', function () {
        bdd.classementJour(socket);
    });
    
    socket.on('Demande classement semaine', function () {
        bdd.classementSemaine(socket);
    });
    
    socket.on('Demande classement partie actuelle', function () {
        var classementJSON = game.classementTempsReelJSON(session.utilisateur.pseudo, classementTempsReel);
        socket.emit('Reponse classement partie actuelle', JSON.stringify(classementJSON));
    });
    

    
    /////////////////////////////////////////////////
    // GESTION DES AMIS
    /////////////////////////////////////////////////
    

    socket.on('Demande liste amis', function () {
        if (session.utilisateur != 0)
            bdd.listeAmis(session.utilisateur.pseudo, socket);
    });

    socket.on('Demander ami', function (nomAmiString) {
        bdd.ajouteAmi(session.utilisateur.pseudo, nomAmiString, socket);
    });

    socket.on('Accepter ami', function (nomAmiString) {
        bdd.accepteAmi(session.utilisateur.pseudo, nomAmiString, socket);
    });


    socket.on('Refuser ami', function (nomAmiString) {
        bdd.refuseAmi(session.utilisateur.pseudo, nomAmiString, socket);
    });

    socket.on('Demande liste demandes amis', function () {
        bdd.listeDemandesAmis(session.utilisateur.pseudo, socket);
    });

    /////////////////////////////////////////////////
    // GESTION DES TROPHEES
    /////////////////////////////////////////////////

    socket.on('Demande liste trophees', function () {
        bdd.tropheesByPseudo(session.utilisateur.pseudo, socket);
    });

    /////////////////////////////////////////////////
    // GESTION DES MEDAILLES
    /////////////////////////////////////////////////

    socket.on('Demande liste medailles', function () {
        bdd.medaillesByPseudo(session.utilisateur.pseudo, socket);
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
    nouveauJeu = game.genererNouvellePartieEnJSON();
    var infoPartie = JSON.parse(nouveauJeu);
    nbSetsTrouvablesPartieEnCours = infoPartie[12].value;
    console.log('Nouvelle partie ! ' + infoPartie[12].value);
    tempsRestant = tempsDePartie / 1000;
    classementTempsReel = [];
    jeu.emit('Nouvelle partie');
    io.sockets.emit('Nouvelle partie', nouveauJeu);
}, tempsDePartie);