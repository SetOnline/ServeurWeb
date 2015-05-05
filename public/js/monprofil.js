var socket = io();

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
    R�ception �venement Reponse mon profil
    @param infos : fichier Json de la forme:... � voir plus tard
*/
socket.on('Reponse mon profil', function (infos) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(infos);

    //affichage debug dans la console
    console.log("Reponse mon profil");
    console.debug(info);
    alert('test');
});

/*
    R�ception �venement Reponse liste amis
    @param infos : fichier Json de la forme:
    * name : pseudo    status : connect� ou non, bool�en    points : score
*/
socket.on('Reponse liste amis', function (infos) {
    // suppression ancienne liste d'amis
    var myNode = document.getElementById("liste_amis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(infos);
    console.debug(info);
    var noeudP;
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<div class='ami'><span class='pseudo'>" + info[i].name +"</span><img class='isconnect' alt='"+ info[i].status +"' src='/img/profil/" + info[i].status + ".png'/></div>"; 
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    R�ception �venement Reponse liste demandes amis (permet de savoir qui nous a demand� en ami)
    @param infos : fichier Json de la forme:
    * name : pseudo    status : connect� ou non, bool�en    points : score
*/
socket.on('Reponse liste demandes amis', function (infos) {
    // suppression ancienne liste de demandes d'amis
    var myNode = document.getElementById("liste_demandes_amis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(infos);
    var noeudP;
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<div class='ami'><span class='pseudo'>" + info[i].name + "</span><img alt='accepter' onclick='socket.emit('Accepter ami', '" + info[i].name + "');' src='/img/accepter.png'/><img alt='refuser' onclick='socket.emit('Refuser ami', '" + info[i].name + "');' src='/img/refuser.png'/></div>";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    Fonction appell�e automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connect� ou pas
    @param RsltConnexion : 0 si pas connect�, pseudo sinon
 */
socket.on('Resultat est connecte', function (RsltConnexion) {
    if (RsltConnexion != 0) {
        document.location.href = "/accueil";
    }
});


///////////////////
// Evenements Client - Serveur
///////////////////
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