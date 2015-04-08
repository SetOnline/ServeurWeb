var socket = io();

// connexion
connexion = [];
connexion.push({ name: "pseudo", value: "pierre" });
connexion.push({ name: "mdp", value: "pierre" });
socket.emit('Connexion', JSON.stringify(connexion));

socket.on('Resultat connexion', function (RsltConnexion) {
    console.log(RsltConnexion);
    if (RsltConnexion == 1) {
        console.log("a");
        alert('connexion réussie');
       // document.location.href = "accueil.ejs";
    } //redirection
    else {
        alert('Données invalides.');
    }
});

// classement
socket.emit('Demande classement');

socket.on('Reponse classement', function (classementJSON) {
    console.log("j'ai une reponse au classement");
    console.log(classementJSON);
});

socket.emit('Demande classement jour');

socket.on('Reponse classement jour', function (classementJSON) {
    console.log("j'ai une reponse au classement jour");
    console.log(classementJSON);
});

socket.emit('Demande classement semaine');

socket.on('Reponse classement semaine', function (classementJSON) {
    console.log("j'ai une reponse au classement semaine");
    console.log(classementJSON);
});
var donnees = [];
donnees.push({ name: 'mail', value: 'pierretest@pierretest.fr' });
donnees.push({ name: 'pseudo', value: 'pierretest3' });
donnees.push({ name: 'mdp', value: 'pierretest' });
//donnees.push({ name: 'avatar', value: avatar });

//affichage debug
console.debug(donnees);

//envoi au serveur
socket.emit('Creation compte', JSON.stringify(donnees));

socket.on('Resultat inscription', function (message) {
    //récupération des données du serveur
    var info = JSON.parse(message);
    
    //affichage debug dans la console
    console.debug(info);
    
    //vérification de chaque champ et affichage correspondant
    //adresse_mail
    if (info[0].value == "invalide") {
        alert("L'adresse mail n'est pas valide");
    }
    if (info[0].value == "deja prise") {
        alert("Cette adresse mail est déjà utilisée");
    }
    
    //pseudo
    if (info[1].value == "invalide") {
        alert("Le pseudo n'est pas valide");
    }
    if (info[1].value == "deja pris") {
        alert("Ce pseudo est déjà utilisé");
    }
    
    //mdp
    if (info[2].value == "invalide") {
        alert("Le mot de passe n'est pas valide");
    }
});