///////////////////
// Evenements Serveur - Client
///////////////////

var socket = io();

socket.emit('Demande classement');

/* Réception du classement */
socket.on('Reponse classement', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    console.log("classement");
    var tableau = document.getElementById("classement");
    
    var ligne = tableau.insertRow(-1);//ajout d'une ligne
    
    var colonne1 = ligne.insertCell(0);//1e cellule
    colonne1.innerHTML += "a";//ajout de son contenu
    
    var colonne2 = ligne.insertCell(1);//2e cellule
    colonne2.innerHTML += "b";

});
