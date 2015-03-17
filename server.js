//framework express
var express = require('express');
var app = express();

// creation du serveur
var port = process.env.port || 1337; // port du serveur
var server = app.listen(port);

// creation comm client serveur
var io = require('socket.io')(server);

// emetteur d'evenements
var EventEmitter = require('events').EventEmitter;
var jeu = new EventEmitter();

// GLOBALES
var tempsDePartie = 60000; // duree d'une partie (en ms)
var tempsRestant = 0; // temps restant sur la partie (en s)
var nbSetsTrouvablesPartieEnCours = 0; // nombre de set partie en cours


app.use(express.static(__dirname + "/public"));

// definition de la route de base (accueil)
app.get('/', function (req, res) {
    res.setHeader('content-Type', 'text/plain');
    res.end('Vous êtes à l\'accueil');
});

// definition de la route du jeu
app.get('/game', function (req, res) {
    res.render('game.ejs');
});

// definition du declanchement de la fonction timer chaque seconde
setInterval(function () {
    tempsRestant--;
    console.log(tempsRestant);
    io.sockets.emit('timer', tempsRestant);
}, 1000);

// fonction utilise pour generer aleatoirement les 12 cartes distribues
// @param low : borne -
// @param high : borne +
// @return : retourne un entier compris entre low et high
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


// abcd
// avec
// a : couleur (1 : R, 2 : V, 3 : B)
// b : remplissage (1 : plein, 2 : raye, 3 : vide)
// c : quantite (1, 2, 3)
// d : forme (1 : eclair, 2 : sphère, 3 : triangle)





// genere une combinaison correspondant au code d'une carte
// @return : retourne une chaine de 4 caractères correspondant au code de la carte genere
function genererCombinaison() {
    var combi = '';
    var i;
    for (i = 0; i != 4; ++i) {
        combi += randomInt(1, 4);
    }
    return combi;
}


// verifie si une carte n'a pas ete tiree
// @param tab : tableau contenant les codes des cartes dejà tirees
// @param carte : le code carte à verifier
// @return : vrai si la carte est dejà tiree, faux sinon
function carteDejaTiree(tab, carte) {
    var i;
    for (i = 0; i != tab.length; ++i) {
        if (tab[i].value == carte) {
            //console.log('-' + tab[i] + '- == -' + carte + '-');
            return true;
        } else {
            //console.log('-' + tab[i] + '- != -' + carte + '-');
        }
    }

    return false;
}

// generation des 12 cartes et remplissage du fichier JSON
// @return : un string correspondant au fichier JSON contenant les 12 cartes (un JSON stringifie)
function genererNouvellePartieEnJSON() {
    var tabCartes = [];
    var i;
    nbSetsTrouvablesPartieEnCours = 0;

    while (nbSetsTrouvablesPartieEnCours == 0) {
        tabCartes.length = 0; // on delete tout
        for (i = 0; i != 12; ++i) {
            var carteTiree = genererCombinaison();
            if (carteDejaTiree(tabCartes, carteTiree)) {
                i--;
            } else {
                //result.push({ name: name, goals: goals[name] });
                tabCartes.push({ name: 'carte' + i, value: carteTiree });
            }
        }
        nbSetsTrouvablesPartieEnCours = getNbSolutions(JSON.stringify(tabCartes));
    }

    tabCartes.push({ name: 'nbSets', value: nbSetsTrouvablesPartieEnCours });

    return JSON.stringify(tabCartes);
}


// determine le nombre de solution d'un jeu
// @return : le nombre de solution
function getNbSolutions(partie) {
    var tabCartes = JSON.parse(partie);
    var res = 0;

    for (var i = 0; i != 10; ++i) {
        for (var j = i + 1; j != 11; ++j) {
            for (var k = j + 1; k != 12; ++k) {
                if (estUnSetValide(tabCartes[i].value, tabCartes[j].value, tabCartes[k].value)) {
                    res++;
                }
            }
        }
    }
    return res;
}

// definition du declanchement de la nouvelle partie chaque tempsDePartie (variable globale definie en haut du fichier)
setInterval(function () {
    var nouveauJeu = genererNouvellePartieEnJSON();

    var infoPartie = JSON.parse(nouveauJeu);
    console.log('Nouvelle partie ! ' + infoPartie[12].value);
    tempsRestant = tempsDePartie / 1000;
    io.sockets.emit('Nouvelle partie', nouveauJeu);
}, tempsDePartie);


// declancher à chaque connexion d'un client
// socket est la variable associe à chacun des clients dans la fonction de callback
// dans cette fonction de callback on defini les fonctions qui vont modifier les variables propres à chaque client
io.sockets.on('connection', function (socket) {

    console.log('Un client est connecte !');
    socket.nbSetsValidesRestants = 0;

    // reinitialisation du nombre de set restant
    jeu.on('Nouvelle partie', function (nouvelleCombi) {
        socket.nbSetsValidesRestants = 0;
    });

    // ecouteur de l'evennement Set d'un client, verifie si le set est valide
    socket.on('Set', function (setJoueur) {
        var setPropose = JSON.parse(setJoueur);
        if (estUnSetValide(setPropose[0].value, setPropose[1].value, setPropose[2].value)) {
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
        console.log("creation d'un compte");
        var mail = compte['adresse_mail'];
        var pseudo = compte['pseudo'];
        var mdp = compte['mdp'];
        console.log("creation du compte : " + mail + " " + pseudo + " " + mdp);
        var resultat = [];
        resultat.push({ adresse_mail: 'invalide', pseudo: 'true', mdp: 'true'});
        socket.emit('Resultat inscription',  JSON.stringify(resultat));
    });

    // connexion
    socket.on('Connexion', function (compteJSON) {
        var compte = JSON.parse(compteJSON);
        console.log("connexion à un compte");
        var pseudo = compte['pseudo'];
        var mdp = compte['mdp'];
        console.log("connexion au compte : " + pseudo + " " + mdp);
        socket.emit('Resultat connexion', 0);
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
        var pseudo = compte['pseudo'];
        var mdp = compte['mdp'];
        console.log("desinscription du compte : " + pseudo + " " + mdp);
    });

    // modification profil
    socket.on('Modifier profil', function (profilJSON) {
        var profil = JSON.parse(profilJSON);
        console.log('Modifier profil');
        var ancienmdp = profil['ancienmdp'];
        var nouveaumdp = profil['nouveaumdp'];
        var nvelavatar = profil['nvelavatar'];
        console.log("modif profil fini");
    });
});

// validation d'une propriete
// @param prop1 : propriete de la carte 1
// @param prop2 : propriete de la carte 2
// @param prop3 : propriete de la carte 3
// @return : vrai si les 3 valeurs de proprietes sont soit toutes differentes soit toutes identiques, faux sinon
function propriete(prop1, prop2, prop3) {
    if ((prop1 == prop2) && (prop2 == prop3) && (prop1 == prop3)) {
        return true;
    }
    else if ((prop1 != prop2) && (prop2 != prop3) && (prop1 != prop3)) {
        return true;
    }
    else {
        return false;
    }

}

// validation d'un set
// @param carte1 : code de la carte 1
// @param carte2 : code de la carte 2
// @param carte3 : code de la carte 3
// @return : vrai si let set est valide, faux sinon
function estUnSetValide(carte1, carte2, carte3) {
    var setCorrect = true;
    for (var i = 0; i < 4; i++) {
        var propCorrect = propriete(carte1.charAt(i), carte2.charAt(i), carte3.charAt(i));
        if (!propCorrect) {
            setCorrect = false;
        }
    }
    return setCorrect;
}

