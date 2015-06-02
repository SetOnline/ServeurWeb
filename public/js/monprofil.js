var socket = io();

//Chargement de la page
function codeAddress() {
    socket.emit('Est connecte');
    socket.emit('Demande liste amis');
    socket.emit('Demande liste demandes amis');
    
    socket.emit('Demande liste trophees');
    socket.emit('Demande liste medailles');
    socket.emit('Demande nom avatar',"");
    
    $(document).tooltip();
}
window.onload = codeAddress();

setInterval(function () { majListeAmi(); }, 10000); //m�j de la liste d'amis 

///////////////////
// Evenements Client - Serveur
///////////////////


///////////////////
// Evenements Serveur - Client
///////////////////
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
        noeudP = "<div class='ami'><a href='profilJoueur/" + info[i].name + "' ><span class='pseudo'>" + info[i].name +"</span><img class='isconnect' alt='"+ info[i].status +"' src='/img/profil/" + info[i].status + ".png'/></a></div>"; 
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    R�ception �v�nement Reponse nom avatar
    @param source: string ac la source
*/
socket.on('Reponse nom avatar', function (source) {
    document.getElementById(avatarProfil).src = source;
});

/*
    R�ception �venement Reponse demande ami (feedback si le pseudo n'existe pas)
    @param rslt: int
*/
socket.on('Reponse demande ami', function (rslt) {
    if (rslt == 0) {
        alert("Pseudo invalide!");
    }
    else {
        if (rslt == 1) {
            alert(''); //???
        }
        else{ alert('Votre demande a bien �t� prise en compte!'); }
    }
});

/*
    R�ception �venement Reponse liste demandes amis (permet de savoir qui nous a demand� en ami)
    @param infos : fichier Json de la forme:
    * name : pseudo    
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
    if (info.length == 0) {
        noeudP = "<p>Aucune demande d'amis pour l'instant</p>";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<div class='ami'><span class='pseudo'>" + info[i].name + "</span><img class='bt' alt='accepter' onclick='socket.emit(\"Accepter ami\", \"" + info[i].name + "\");majListeAmi();' src='/img/bt_yes.png'/><img alt='refuser' class='bt' onclick='socket.emit(\"Refuser ami\", \"" + info[i].name + "\");' src='/img/bt_no.png'/></div>";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    R�ception �venement Reponse liste trophees
    @param infos : fichier Json de la forme:
    * name : nom    desc : description        pic : nom l�image
*/
socket.on('Reponse liste trophees', function (infos) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(infos);
    console.debug(info);
    var noeudP;
    var myNode = document.getElementById("trophes");
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<img class='miniature' alt='trophe' src='/img/"+ info[i].pic +".png' title=\"" + info[i].desc + "\"/><span>" + info[i].name + "</span><br />";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    R�ception �venement Reponse liste medailles
    @param infos : fichier Json de la forme:
    * name : nom    desc : description        pic : nom l�image
*/
socket.on('Reponse liste medailles', function (infos) {
    //r�cup�ration des donn�es du serveur
    var info = JSON.parse(infos);
    console.debug(info);
    var noeudP;
    var myNode = document.getElementById("medailles");
    for (i = 0; i < info.length ; ++i) {
        noeudP = "<img class='miniature' alt='medaille' src='/img/" + info[i].pic + ".png' title=\"" + info[i].desc + "\"/><span>" + info[i].name + "</span><br />";
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
});

/*
    Fonction appell�e automatiquement lorsqu'on a besoin de savoir si l'utilisateur est connect� ou pas
    @param RsltConnexion : 0 si pas connect�, pseudo sinon
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


///////////////////
// Evenements Client - Serveur
///////////////////

/* Fonction qui permet la mise � jour de la liste d'amis via l'envoi de 2 events*/
function majListeAmi() {
    //Liste d'amis
    socket.emit('Demande liste amis');
    // suppression ancienne liste amis
    var myNode = document.getElementById("liste_amis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    //Liste de demandes d'amis
    socket.emit('Demande liste demandes amis');
    // suppression de l'ancienne liste demandes d'amis
    var myNode = document.getElementById("liste_demandes_amis");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}


/*
    Fonction appell�e automatiquement lors du click sur le bouton "desinscription"
*/
function desinscription() {
    socket.emit('Desinscription');
}

/*Fonction permettant d'ajouter le pseudo rentr� dans le form en ami*/
function ajouteAmi(){
    socket.emit('Demander ami', $("#pseudoAjout").val());
    document.location.href = "/profil";
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

    //envoi au serveur
    socket.emit('Modifier profil', JSON.stringify(donnees));
}
