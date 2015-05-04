//Chargement de la page
function codeAddress() {
    socket.emit('Demande liste amis');
    socket.emit('Demande mon profil');
    socket.emit('Demande liste demandes amis');
    $(document).tooltip();
}
window.onload = codeAddress();

///////////////////
// Evenements Serveur - Client
///////////////////

/*
    Réception évenement Reponse mon profil
    @param infos : fichier Json de la forme:... à voir plus tard
*/
socket.on('Reponse mon profil', function (infos) {
    //récupération des données du serveur
    var info = JSON.parse(infos);

    //affichage debug dans la console
    console.log("Reponse mon profil");
    console.debug(info);
    alert('test');
});

/*
    Réception évenement Reponse liste amis
    @param infos : fichier Json de la forme:
    * name : pseudo    status : connecté ou non, booléen    points : score
*/
socket.on('Reponse liste amis', function (infos) {
    // suppression ancienne liste d'amis
    var myNode = document.getElementById("liste_amis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    //récupération des données du serveur
    var info = JSON.parse(infos);
    var noeudP;
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<div class='ami'>< img class='miniature' alt='avatarAmi' src='/img/avatar.png/><span class='pseudo'>" + info[i].name +"</span><span id='nbpts'>"+ info[i].points +"</span><img class='isconnect' alt='"+ info[i].status +"' src='/img/connecte.png'/></div>"; 
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
    //affichage debug dans la console
    alert("rep liste amis: ");
    console.debug(info);
});

///////////////////
// Evenements Client - Serveur
///////////////////
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