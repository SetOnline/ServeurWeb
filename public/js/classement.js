﻿var socket = io();

function codeAddress() { //demande des classements au serv dés le chargemt de la page
    socket.emit('Est connecte');
    socket.emit('Demande classement');
    socket.emit('Demande classement jour');
    socket.emit('Demande classement semaine');
    
    $("#tabs").tabs();
}
window.onload = codeAddress();

///////////////////
// Evenements Serveur - Client
///////////////////

/* Réception du classement général
 *      @param message: name: pseudo value: nombre de points (liste)
 * */
socket.on('Reponse classement', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classement");

    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += "<a href='profilJoueur/" + val['name'] + " '>" + val['name'] + "</a>";//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});

/* Réception du classement du jour
 * @param message: name: pseudo value: nombre de points (liste)
 * */
socket.on('Reponse classement jour', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classementJour");
    
    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += "<a href='profilJoueur/" + val['name'] + " '>" + val['name'] + "</a>";//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});

/* Réception du classement de la semaine
 * @param message: name: pseudo value: nombre de points (liste)*/
socket.on('Reponse classement semaine', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    var tableau = document.getElementById("classementSemaine");
    
    $.each(info, function (key, val) {
        console.log(val);
        var ligne = tableau.insertRow(-1);//ajout d'une ligne
        var colonne1 = ligne.insertCell(0);//1e cellule
        colonne1.innerHTML += "<a href='profilJoueur/" + val['name'] + " '>" + val['name'] + "</a>";//ajout de son contenu
        var colonne2 = ligne.insertCell(1);//2e cellule
        colonne2.innerHTML += val['value'];
    })
});


/*
    Fonction appellée automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connecté ou pas
    @param RsltConnexion : 0 si pas connecté, pseudo sinon
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

/*
    Fonction appellée automatiquement lors de demande de déconnexion
*/
function deco() {
    socket.emit('Deco');
    document.location.href = "/accueil";
}