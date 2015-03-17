///////////////////
// Evenements Serveur - Client
///////////////////
//var socket = io(); //.connect('http://localhost:1337/game');

/*
    R�ception �venement Reponse mon profil
    @param infos : fichier Json de la forme:... � voir plus tard
*/
socket.on('Reponse mon profil', function (infos) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(message);

    //affichage debug dans la console
    console.debug(info);
    alert('test');
});

///////////////////
// Evenements Client - Serveur
///////////////////
/*
    Fonction appell�e automatiquement lors de l'ouverture de la page monprofil.ejs
*/
function demandeMonProfil() {
    //envoi au serveur
    socket.emit('Demande mon profil');
}

/*
    Fonction appell�e automatiquement lors du click sur le bouton "desinscription"
*/
function desinscription() {
    socket.emit('Desinscription');
}

/*
    Fonction appell�e automatiquement lors de demande de d�connexion
    @param form le formulaire de modification des donn�es personnelles
*/
function ModifierProfil(form) {
    //r�cup�ration des valeurs du formulaire
    var ancien_mdp = form.Ancien_mdp.value;
    var nouveau_mdp = form.Nouveau_mdp.value;
    var avatar = form.avatar.value;

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