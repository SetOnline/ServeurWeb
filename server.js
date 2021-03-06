﻿//framework express
var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var myCookieParser = cookieParser('secret');
var SessionSockets = require('session.socket.io');
var fs = require('fs');
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
var utilisateursConnectes = []; // contient les gens connectés

// declancher à chaque connexion d'un client
// socket est la variable associe à chacun des clients dans la fonction de callback
// dans cette fonction de callback on defini les fonctions qui vont modifier les variables propres à chaque client
sessionSockets.on('connection', function (err, socket, session) {
    // contient l'objet utilisateur quand l'utilisateur est connecté
    session.utilisateur = session.utilisateur || 0;
    // gestion du tableau des utilisateurs connectés
    if(session.utilisateur != 0) {
        utilisateursConnectes[session.utilisateur.pseudo] = 1;
    }
    socket.nbPtsPartie = 0;
    socket.multiplicateur = 1;
    
    socket.nbSetsValidesRestants = nbSetsTrouvablesPartieEnCours;
    socket.nbPartiesAffilees = 0; // trophee 10, 20 parties d'affilées
    socket.setDejaJoue = [];
    
    /////////////////////////////////////////////////
    // GESTION DU JEU
    /////////////////////////////////////////////////
    
    socket.on('disconnect', function () {
        if (session.utilisateur != 0) {
            utilisateursConnectes[session.utilisateur.pseudo] = 0;
        }
    });

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
        game.gestionSet(setJoueur, session.utilisateur, classementTempsReel, socket, bdd);
    });

    /////////////////////////////////////////////////
    // GESTION DES UTILISATEURS
    /////////////////////////////////////////////////
    
    // connexion
    socket.on('Connexion', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var pseudo = compte[0].value.toLowerCase();
        var mdp = compte[1].value.toLowerCase();
        if (utilisateursConnectes[pseudo] != 1)
            bdd.connexionUser(pseudo, mdp, socket, session, Utilisateur, utilisateursConnectes);
        else
            socket.emit('Resultat connexion', 2);
    });

    // creation compte
    socket.on('Creation compte', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        var mail = compte[0].value.toLowerCase();
        var pseudo = compte[1].value.toLowerCase();
        var mdp = compte[2].value.toLowerCase();
        var temp = compte[3].value;
        var nomImg = "avatar";
        if (temp != "") {
            nomImg = "profil_" + pseudo;
            var img = new Buffer(temp, 'base64');
            fs.writeFile('public/img/profil_' + pseudo + '.jpg', img, function (err) {
                if (err) throw err;
                console.log('It\'s saved!');
            });
        }

        var usr = new Utilisateur(mail, pseudo, mdp, nomImg);
        usr.insereBdd(bdd, socket);
    });
    
    socket.on('Demande nom avatar', function (pseudo){
        if (pseudo == "") {
            socket.emit('Reponse nom avatar', session.utilisateur.img);
        }
        else {
            bdd.nomAvatar(pseudo, socket);
        }
    })

    socket.on('Demande avatar', function (pseudo) {
        fs.readFile('public/img/profil_' + pseudo + '.jpg', function (err, data) {
            if (err) {
                fs.readFile('public/img/avatar.jpg', function (err, data) {
                    var image = new Buffer(data).toString('base64');
                    socket.emit('Reponse avatar', image);
                });
            }
            else {
                var image = new Buffer(data).toString('base64');
                socket.emit('Reponse avatar', image);
            }
        });
    });
    
    // deconnexion
    socket.on('Deco', function () {
        utilisateursConnectes[session.utilisateur.pseudo] = 0;
        session.utilisateur = 0;
        session.save();
    });
    
    // est connecte
    socket.on('Est connecte', function () {
        if (session.utilisateur != 0)
            socket.emit('Resultat est connecte', session.utilisateur.pseudo);
        else
            socket.emit('Resultat est connecte', 0);
    });
    
    socket.on('Modifier profil', function (donneesJSON) {
        var donnees = JSON.parse(donneesJSON);
        var ancienmdp = donnees[0].value.toLowerCase();
        var nouveaumdp = donnees[1].value.toLowerCase();
        var temp = donnees[2].value;
        if (temp != "") {
            var img = new Buffer(temp, 'base64');
            fs.writeFile('public/img/profil_' + session.utilisateur.pseudo + '.jpg', img, function (err) {
                if (err) throw err;
                console.log('It\'s saved!');
                socket.emit('Reponse image profil');
            });
        }
        if (ancienmdp == session.utilisateur.mdp && nouveaumdp != "") {
            bdd.modifierMdpUser(nouveaumdp, session.utilisateur.pseudo);
        }
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
            bdd.listeAmis(session.utilisateur.pseudo, socket, utilisateursConnectes);
    });

    socket.on('Demander ami', function (nomAmiString) {
        bdd.ajouteAmi(session.utilisateur.pseudo, nomAmiString.toLowerCase(), socket);
    });

    socket.on('Accepter ami', function (nomAmiString) {
        bdd.accepteAmi(session.utilisateur.pseudo, nomAmiString.toLowerCase(), socket);
    });


    socket.on('Refuser ami', function (nomAmiString) {
        bdd.refuseAmi(session.utilisateur.pseudo, nomAmiString.toLowerCase(), socket);
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
    
    socket.on('Voir liste trophees', function (pseudo) {
        bdd.voirTropheesByPseudo(pseudo, socket);
    });

    /////////////////////////////////////////////////
    // GESTION DES MEDAILLES
    /////////////////////////////////////////////////

    socket.on('Demande liste medailles', function () {
        bdd.medaillesByPseudo(session.utilisateur.pseudo, socket);
    });

    socket.on('Voir liste medailles', function (pseudo) {
        bdd.voirMedaillesByPseudo(pseudo, socket);
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

//debug
setInterval(function () {
    console.log(utilisateursConnectes);
},5000);