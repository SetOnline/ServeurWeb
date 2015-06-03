var socket = io();
var avatar;

//Chargement de la page
function codeAddress() {
    socket.emit('Est connecte');
}
window.onload = codeAddress();

///////////////////
// Evenements Serveur - Client
///////////////////

/*
    Réception évenement Compte pas cree (lorsque le compte envoyé au serveur pour sa création n'est pas valide)
    @param message : fichier Json de la forme:
    name: adresse_mail value: deja prise/invalide/true
    name: pseudo value: deja pris/invalide/true
    name: mdp value: invalide/true
    name: avatar value: invalide/true
*/

socket.on('Resultat inscription', function (message) {
    console.debug(message);
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    //vérification de chaque champ et affichage correspondant
    //adresse_mail
    if (info[0].value == "invalide") {
        swal("L'adresse mail n'est pas valide");
    }
    if (info[0].value == "deja prise") {
        swal("Cette adresse mail est déjà utilisée");
    }
    
    //pseudo
    if (info[1].value == "invalide") {
        swal("Le pseudo n'est pas valide");
    }
    if (info[1].value == "deja pris") {
        swal("Ce pseudo est déjà utilisé");
    }
    
    //mdp
    if (info[2].value == "invalide") {
        swal("Le mot de passe n'est pas valide");
    }
    
    //avatar
    /*if (info[3].value == "invalide") {
        swal("L'avatar choisi n'est pas valide");
    }*/

    if (info[0].value == "true" && info[1].value == "true" && info[2].value == "true"/*&& info[3].value=="true"*/) {
        swal("Inscription réussie!");

        //On connecte l'usr
        var donnees = [];
        var pseudo = $("#pseudo").val();
        var mdp = $("#mdp").val();
        donnees.push({ name: 'pseudo', value: pseudo });
        donnees.push({ name: 'mdp', value: mdp });
        
        //envoi au serveur
        socket.emit('Connexion', JSON.stringify(donnees));
        document.location.href = "/accueil";
    }
});

/*
    Fonction appellée automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connecté ou pas
    @param RsltConnexion : 0 si pas connecté, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion != 0) {
        document.location.href = "/accueil";
    } 
});

///////////////////
// Evenements Client - Serveur
///////////////////


/*
    Fonction appellée automatiquement lors de la validation du formulaire d'inscription
*/
function creationCompte() {
    
    //récupération des valeurs du formulaire
    var pseudo = $("#pseudo").val();
    var mail = $("#mail").val();
    var mdp = $("#mdp").val();
    avatar2 = avatar.substring(22);
    alert(avatar);
    console.log(avatar2);
    
    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'mail', value: mail });
    donnees.push({ name: 'pseudo', value: pseudo });
    donnees.push({ name: 'mdp', value: mdp });
    donnees.push({ name: 'avatar', value: avatar });
    
    //affichage debug
    console.debug(donnees);
    
    //envoi au serveur
    socket.emit('Creation compte', JSON.stringify(donnees));
}

