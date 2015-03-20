//Il manque "Compte pas cree"

///////////////////
// Evenements Serveur - Client
///////////////////

var socket = io(); //.connect('http://localhost:1337/game');

/*
    R�ception �venement Compte pas cree (lorsque le compte envoy� au serveur pour sa cr�ation n'est pas valide)
    @param message : fichier Json de la forme:
    name: adresse_mail value: deja prise/invalide/true
    name: pseudo value: deja pris/invalide/true
    name: mdp value: invalide/true
    name: avatar value: invalide/true
*/


socket.on('Compte pas cree', function (message) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(message);

    //affichage debug dans la console
    console.debug(info);
    
    //v�rification de chaque champ et affichage correspondant
    //adresse_mail
    if (info[0].value == "invalide") {
        alert("L'adresse mail n'est pas valide");
    }
    if (info[0].value == "deja prise") {
        alert("Cette adresse mail est d�j� utilis�e");
    }

    //pseudo
    if (info[1].value == "invalide") {
        alert("Le pseudo n'est pas valide");
    }
    if (info[1].value == "deja pris") {
        alert("Ce pseudo est d�j� utilis�");
    }

    //mdp
    if (info[2].value == "invalide") {
        alert("Le mot de passe n'est pas valide");
    }

    //avatar
    if (info[3].value == "invalide") {
        alert("L'avatar choisi n'est pas valide");
    }
});

/*
    R�ception �venement Resultat connexion
    @param nouveauJeu : Entier permettant de savoir si la connexion est r�ussie ou pas (0 - r�ussie, 1 - invalide)
*/
socket.on('Resultat connexion', function (RsltConnexion) {
    if (RsltConnexion == 0) { document.location.href = "accueil.ejs"; } //redirection
    else {
        alert('Donn�es invalides.');
    }
});


///////////////////
// Evenements Client - Serveur
///////////////////
/*
    Fonction appell�e automatiquement lors de la validation du formulaire d'inscription
    @param form le formulaire d'inscription
*/
function creationCompte(form) {
    //r�cup�ration des valeurs du formulaire
    var pseudo = form.pseudo.value;
    var mail = form.mail.value;
    var mdp = form.mdp.value;
    //var avatar = form.avatar.value;

    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'pseudo', value: pseudo });
    donnees.push({ name: 'mail', value: mail });
    donnees.push({ name: 'mdp', value: mdp });
    //donnees.push({ name: 'avatar', value: avatar });

    //affichage debug
    console.debug(donnees);

    //envoi au serveur
    socket.emit('Creation compte', JSON.stringify(donnees));
}

/*
    Fonction appell�e automatiquement lors de la validation du formulaire de connexion
    @param form le formulaire de connexion
*/
function connexion(form) {
    //r�cup�ration des valeurs du formulaire
    var pseudo = form.pseudo.value;
    var mdp = form.mdp.value;

    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'pseudo', value: pseudo });
    donnees.push({ name: 'mdp', value: mdp });

    //affichage debug
    console.debug(donnees);
    alert('test');

    //envoi au serveur
    socket.emit('Connexion', JSON.stringify(donnees));
}

/*
    Fonction appell�e automatiquement lors de demande de d�connexion
*/
function deco() {
    socket.emit('Deco');
}