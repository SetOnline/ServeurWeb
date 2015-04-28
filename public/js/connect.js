///////////////////
// Evenements Serveur - Client
///////////////////

var socket = io(); //.connect('http://localhost:1337/game');

/*
    Réception évenement Compte pas cree (lorsque le compte envoyé au serveur pour sa création n'est pas valide)
    @param message : fichier Json de la forme:
    name: adresse_mail value: deja prise/invalide/true
    name: pseudo value: deja pris/invalide/true
    name: mdp value: invalide/true
    name: avatar value: invalide/true
*/


socket.on('Resultat inscription', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    //vérification de chaque champ et affichage correspondant
    //adresse_mail
    if (info[0].value == "invalide") {
        alert("L'adresse mail n'est pas valide");
    }
    if (info[0].value == "deja prise") {
        alert("Cette adresse mail est déjà utilisée");
    }

    //pseudo
    if (info[1].value == "invalide") {
        alert("Le pseudo n'est pas valide");
    }
    if (info[1].value == "deja pris") {
        alert("Ce pseudo est déjà utilisé");
    }

    //mdp
    if (info[2].value == "invalide") {
        alert("Le mot de passe n'est pas valide");
    }

    //avatar
    /*if (info[3].value == "invalide") {
        alert("L'avatar choisi n'est pas valide");
    }*/

    if (info[1].value == "true" && info[2].value == "true" /*&& info[3].value=="true"*/) {
        alert("Inscription réussie!");
        document.location.href = "/accueil";
    }
});

/*
    Réception évenement Resultat connexion
    @param nouveauJeu : Entier permettant de savoir si la connexion est réussie ou pas (1 - réussie, 0 - invalide)
*/
socket.on('Resultat connexion', function (RsltConnexion) {
    if (RsltConnexion == 1) { //redirection
        alert('connexion réussie');
       document.location.href = "/accueil";
    } 
    else {
        alert('Données invalides.');
    }
});


///////////////////
// Evenements Client - Serveur
///////////////////
/*
    Fonction appellée automatiquement lors de la validation du formulaire d'inscription
    @param form le formulaire d'inscription
*/
function creationCompte() {

    //récupération des valeurs du formulaire
    var pseudo = $("#pseudo").val();
    var mail = $("#mail").val();
    var mdp = $("#mdp").val();
    //var avatar = $("#avatar").val();

    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'mail', value: mail });
    donnees.push({ name: 'pseudo', value: pseudo });
    donnees.push({ name: 'mdp', value: mdp });
    //donnees.push({ name: 'avatar', value: avatar });

    //affichage debug
    console.debug(donnees);

    //envoi au serveur
    socket.emit('Creation compte', JSON.stringify(donnees));
}

/*
    Fonction appellée automatiquement lors de la validation du formulaire de connexion
    @param form le formulaire de connexion
*/
function connexion() {
    //récupération des valeurs du formulaire
    var pseudo = $("#pseudo").val();
    var mdp = $("#mdp").val();

    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'pseudo', value: pseudo });
    donnees.push({ name: 'mdp', value: mdp });

    //affichage debug
    console.debug(donnees);
    //envoi au serveur
    socket.emit('Connexion', JSON.stringify(donnees));
}

/*
    Fonction appellée automatiquement lors de demande de déconnexion
*/
function deco() {
    socket.emit('Deco');
}

//PAGE INSCRIPTION
$('#createCompte').submit(function () {
    alert('a');
   // var message = $('#message').val();
   // preventDefault();
   // creationCompte(this);
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});