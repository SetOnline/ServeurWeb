var socket = io();


//Chargement de la page
function codeAddress() {
    var pseudo = $("#pseudoATrouver");
    var pseudot = pseudo.html();
    socket.emit('Voir liste trophees', pseudot);
    socket.emit('Voir liste medailles', pseudot);
    
    $(document).tooltip();
}


///////////////////
// Evenements Client - Serveur
///////////////////

///////////////////
// Evenements Serveur - Client
///////////////////

/*
    Réception évenement Reponse liste trophees
    @param infos : fichier Json de la forme:
    * name : nom    desc : description        pic : nom l’image
*/
socket.on('Reponse liste trophees', function (infos) {
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
socket.on('Reponse liste medailles', function (infos) {
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
