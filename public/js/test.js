var socket = io();

// connexion
connexion = [];
connexion.push({ name: "pseudo", value: "pierre" });
connexion.push({ name: "mdp", value: "pierre" });
socket.emit('Connexion', JSON.stringify(connexion));



// classement
socket.emit('Demande classement');

socket.on('Reponse classement', function () {
    console.log("j'ai une reponse au classement");
});

socket.emit('Demande classement jour');

socket.on('Reponse classement jour', function () {
    console.log("j'ai une reponse au classement jour");
});

socket.emit('Demande classement semaine');

socket.on('Reponse classement semaine', function () {
    console.log("j'ai une reponse au classement semaine");
});

