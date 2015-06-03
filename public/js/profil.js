var socket = io();


//Chargement de la page
function codeAddress() {
    var pseudo = $("#pseudoATrouver");
    var pseudot = pseudo.html();
    socket.emit('Voir liste trophees', pseudot);
    socket.emit('Voir liste medailles', pseudot);
    socket.emit('Demande nom avatar', pseudot);
    socket.emit('Est connecte');
    $(document).tooltip();
}


///////////////////
// Evenements Client - Serveur
///////////////////

///////////////////
// Evenements Serveur - Client
///////////////////
/*
    Fonction appellée automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connecté ou pas
    @param RsltConnexion : 0 si pas connecté, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion == 0) {
        document.location.href = "/accueil";
    }
    else {
        document.getElementById('pseudoConnecte').innerHTML = RsltConnexion;
        document.getElementById('co').style.display = 'block';
        document.getElementById('profil').style.display = 'inline';
    }
});

/*
    Réception évenement Reponse liste trophees
    @param infos : fichier Json de la forme:
    * name : nom    desc : description        pic : nom l’image
*/
socket.on('Reponse voir liste trophees', function (infos) {
    //récupération des données du serveur
    var info = JSON.parse(infos);
    console.debug(info);
    var noeudP;
    var myNode = document.getElementById("trophes");
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<img class='miniature' alt='trophe' src='/img/" + info[i].pic + ".png' title=\"" + info[i].desc + "\"/><span>" + info[i].name + "</span>";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    Réception évenement Reponse liste medailles
    @param infos : fichier Json de la forme:
    * name : nom    desc : description        pic : nom l’image
*/
socket.on('Reponse voir liste medailles', function (infos) {
    //récupération des données du serveur
    var info = JSON.parse(infos);
    console.debug(info);
    var noeudP;
    var myNode = document.getElementById("medailles");
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<img class='miniature' alt='medaille' src='/img/" + info[i].pic + ".png' title=\"" + info[i].desc + "\"/><span>" + info[i].name + "</span>";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    Réception évènement Reponse nom avatar
    @param source: string ac la source
*/
socket.on('Reponse nom avatar', function (source) {
    document.getElementById("avatarProfil").src = "/img/" + source + ".jpg";
});

/*
    Fonction appellée automatiquement lors de demande de déconnexion
*/
function deco() {
    socket.emit('Deco');
    document.location.href = "/accueil";
}