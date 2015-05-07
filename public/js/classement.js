var socket = io();

function codeAddress() {
    socket.emit('Est connecte');
    socket.emit('Demande classement');
    socket.emit('Demande classement jour');
    socket.emit('Demande classement semaine');
}
window.onload = codeAddress();

///////////////////
// Evenements Serveur - Client
///////////////////

/* R�ception du classement */
socket.on('Reponse classement', function (message) {
    //r�cup�ration des donn�es du serveur
    console.log("classement");
    console.log(message);
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classement");

    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += val['name'];//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});

/* R�ception du classement */
socket.on('Reponse classement jour', function (message) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classementJour");
    
    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += val['name'];//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});

/* R�ception du classement */
socket.on('Reponse classement semaine', function (message) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classementSemaine");
    
    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += val['name'];//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});


/*
    Fonction appell�e automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connect� ou pas
    @param RsltConnexion : 0 si pas connect�, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion == 0) {
    }
    else {
        document.getElementById('co').style.display = 'block';
        document.getElementById('pseudoConnecte').innerHTML = RsltConnexion;
        document.getElementById('profil').style.display = 'inline';
    }
});
