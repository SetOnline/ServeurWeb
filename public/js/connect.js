var socket = io(); 

//Chargement de la page
function codeAddress() {
    socket.emit('Est connecte');
}
window.onload = codeAddress();

///////////////////
// Evenements Serveur - Client
///////////////////

/*
    R�ception �venement Resultat connexion
    @param RsltConnexion : Entier permettant de savoir si la connexion est r�ussie ou pas (1 - r�ussie, 0 - invalide)
*/
socket.on('Resultat connexion', function (RsltConnexion) {
    if (RsltConnexion == 1) { //redirection
        alert('connexion r�ussie');
        document.location.href = "/accueil";
    } 
    else {
        alert('Donn�es invalides, veuillez r�essayer.');
    }
});

/*
    Fonction appell�e automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connect� ou pas
    @param RsltConnexion : 0 si pas connect�, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion == 0) { 
        document.getElementById('pasco').style.display = 'block';
    } 
    else {
        document.getElementById('co').style.display = 'block';
        document.getElementById('pseudoCo').innerHTML = RsltConnexion;
    }
});


///////////////////
// Evenements Client - Serveur
///////////////////

/*
    Fonction appell�e automatiquement lors de la validation du formulaire de connexion
    @param form le formulaire de connexion
*/
function connexion() {
    //r�cup�ration des valeurs du formulaire
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
    Fonction appell�e automatiquement lors de demande de d�connexion
*/
function deco() {
    socket.emit('Deco');
}