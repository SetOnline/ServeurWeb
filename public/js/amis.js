///////////////////
// Evenements Serveur - Client
///////////////////
//var socket = io(); //.connect('http://localhost:1337/game');

/*
    Réception évenement Reponse mon profil
    @param infos : fichier Json de la forme:... à voir plus tard
*/
/*socket.on('Reponse mon profil', function (infos) {
    //récupération des données du serveur
    var info = JSON.parse(message);

    //affichage debug dans la console
    console.debug(info);
    alert('test');
});*/

///////////////////
// Evenements Client - Serveur
///////////////////
/*
    Fonction appellée automatiquement lors de l'ouverture de la page monprofil.ejs
*/
function demandeMonProfil() {
    //envoi au serveur
    socket.emit('Demande mon profil');
}

/*
    Fonction appellée automatiquement lors du click sur le bouton "desinscription"
*/
function desinscription() {
    socket.emit('Desinscription');
}

/*
    Fonction appellée automatiquement lors de demande de déconnexion
    @param form le formulaire de modification des données personnelles
*/
function ModifierProfil(form) {
    //récupération des valeurs du formulaire
    var ancien_mdp = $("#Ancien_mdp").val();
    var nouveau_mdp = $("#Nouveau_mdp").val();
    var avatar = $("#avatar").val();
    
    //mise dans un tableau
    var donnees = [];
    donnees.push({ name: 'ancienmdp', value: ancien_mdp });
    donnees.push({ name: 'nouveaumdp', value: nouveau_mdp });
    donnees.push({ name: 'nvelavatar', value: avatar });
    
    //affichage debug
    console.debug(donnees);
    alert("test");
    
    //envoi au serveur
    socket.emit('Modifier profil', JSON.stringify(donnees));
}