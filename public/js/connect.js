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
    Réception évenement Resultat connexion
    @param RsltConnexion : Entier permettant de savoir si la connexion est réussie ou pas (1 - réussie, 0 - invalide)
*/
socket.on('Resultat connexion', function (RsltConnexion) {
    if (RsltConnexion == 1) { //redirection
        swal({
            title: "Connexion réussie",
            showConfirmButton: false
        });
        document.location.href = "/accueil";
    } 
    else {
        if (RsltConnexion == 2) {
            swal("Vous êtes déjà connecté ailleurs sous ce pseudo...");
        }
        else {
            swal('Données invalides, veuillez réessayer.');
        }
    }
});

/*
    Fonction appellée automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connecté ou pas
    @param RsltConnexion : 0 si pas connecté, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion == 0) {
        document.getElementById('pasco').style.display = 'block';
    } 
    else {
        document.getElementById('co').style.display = 'block';
        document.getElementById('pseudoCo').innerHTML = RsltConnexion;
        document.getElementById('profil').style.display = 'inline';
    }
});


///////////////////
// Evenements Client - Serveur
///////////////////

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

    //envoi au serveur
    socket.emit('Connexion', JSON.stringify(donnees));
}

/*
    Fonction appellée automatiquement lors de demande de déconnexion
*/
function deco() {
    socket.emit('Deco');
    document.location.href = "/accueil";
}