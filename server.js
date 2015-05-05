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
var tempsRestant = 0; // temps restant sur la partie (en s)
var nbSetsTrouvablesPartieEnCours = 0; // nombre de set partie en cours
var classementTempsReel = 0; // contiendra le tableau du classement de la partie en cours

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

    // reinitialisation du nombre de set restant
    jeu.on('Nouvelle partie', function () {
        if (socket.nbPtsPartie != 0 && session.utilisateur != 0)
            bdd.addScoreUser(session.utilisateur.idUtilisateur, socket.nbPtsPartie);
        socket.nbPtsPartie = 0;
        socket.multiplicateur = 1;
        socket.nbSetsValidesRestants = nbSetsTrouvablesPartieEnCours;
    });

    // ecouteur de l'evennement Set d'un client, verifie si le set est valide
    socket.on('Set', function (setJoueur) {
        var setPropose = JSON.parse(setJoueur);
        if (game.estUnSetValide(setPropose[0].value, setPropose[1].value, setPropose[2].value)) {
            // on ajoute le multiplicateur au score 
            socket.nbPtsPartie += socket.multiplicateur;
            // puis on double le multiplicateur (x2 pour le set suivant)
            socket.multiplicateur = socket.multiplicateur * 2;
            if (socket.utilisateur != 0) {
                classementTempsReel[session.utilisateur.pseudo] = socket.nbPtsPartie;
            }
            // il reste un set de moins à trouver
            socket.nbSetsValidesRestants -= 1;
            setPropose.push({ name: 'nbSetsRestants', value: socket.nbSetsValidesRestants });
            setPropose.push({ name: 'nbPtsGagne', value: (socket.multiplicateur / 2) });
            setPropose.push({ name: 'nbPtsTotal', value: (socket.nbPtsPartie) });
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
        usr.insereBdd(bdd, socket);  
    });
    
    // classement
    socket.on('Demande classement', function () {
        bdd.classement(socket);
    });
    
    socket.on('Demande classement jour', function () {
        bdd.classementJour(socket);
    });
    
    socket.on('Demande classement semaine', function () {
        bdd.classementSemaine(socket);
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
    
    // deconnexion
    socket.on('Deco', function (profilJSON) {
        session.utilisateur = 0;
        session.save();
        console.log("deco");
    });

    socket.on('Demande classement partie actuelle', function () {
        var classementJSON = game.classementTempsReelJSON(session.utilisateur.pseudo, classementTempsReel);
        socket.emit('Reponse classement partie actuelle', JSON.stringify(classementJSON));
    });

    socket.on('Est connecte', function () {
        if (session.utilisateur != 0)
            socket.emit('Resultat est connecte', session.utilisateur.pseudo);
        else
            socket.emit('Resultat est connecte', 0);
    });

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
    nbSetsTrouvablesPartieEnCours = infoPartie[12].value;
    console.log('Nouvelle partie ! ' + infoPartie[12].value);
    tempsRestant = tempsDePartie / 1000;
    classementTempsReel = [];
    jeu.emit('Nouvelle partie');
    io.sockets.emit('Nouvelle partie', nouveauJeu);
}, tempsDePartie);