var carte1 = 0;
var carte2 = 0;
var carte3 = 0;
var nbSetTrouves = 0;
var tb = 0;

///////////////////
// COMMUNICATION
///////////////////

var socket = io(); //.connect('http://localhost:1337/game');


setInterval(function () { demandeClassement(); }, 1000);

socket.on('timer', function (message) {
    document.getElementById('timer').innerHTML = message;
});

socket.on('Nouvelle partie', function (nouveauJeu) {
    var infoPartie = JSON.parse(nouveauJeu);
    var cartesJeu = "";
    var i;
    console.log('Nouvelle partie !');
    for (i = 0; i != 12; ++i) {
    //    console.log(infoPartie[i].value);
        cartesJeu += infoPartie[i].value;
    }

    loadGame(cartesJeu);
    cardEvents();
    
    //affichage du nombre de sets à trouver
    var nbSets = infoPartie[12].value;
    document.getElementById('nbSets').innerHTML = nbSets;
    document.getElementById('nbSetsTrouves').innerHTML = "0";

    // suppression sets trouvés
    var myNode = document.getElementById("trouves");
    while(myNode.firstChild){
        myNode.removeChild(myNode.firstChild);
    }

    //suppression nb de pts
    document.getElementById('nbdepts').innerHTML = 0;

    // suppression ancien classement "actuel"
    var myNode = document.getElementById("classement");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    
    //apparition du classement de la dernière partie jouée
    var Noeud = document.getElementById("AncienClassement");
    //s'il existe la partie précédente
    if (tb != 0) {
        //alors on va la copier 
        var noeudP;
        for (i = 0; i < tb.length ; ++i) {
            noeudP = "<div class=' personneAC '> <img src = '/img/boom.png' class='numAC'><span class='valueAC'>" + tb[i].rank + "</span><span class='pseudoAC'>" + tb[i].name + "</span>" 
        + "<img src='/img/avatar.png' class='avatarAC'></div>"; //A remplacer ac le véritable avatar
            // console.log(tbpersonne[i].name);
            Noeud.innerHTML = Noeud.innerHTML + noeudP;
        }
    }
    else {
        var AC = document.getElementById("AncienClassement");
        while (AC.firstChild) {
            AC.removeChild(AC.firstChild);
        }
    }
});

socket.on('Set valide', function (setQuiEstValide) {
    var setPropose = JSON.parse(setQuiEstValide);
    //ajouts des sets
    var setBon = '';
    setBon += setPropose[0].value;
    setBon += setPropose[1].value;
    setBon += setPropose[2].value;
   // addSetFound(setBon);
    var nbSetsRestants = setPropose[3].value;
    var nbPtsGagne = setPropose[4].value;
    var nbPtsTotal = setPropose[5].value;
    var nbSetsTotal = document.getElementById('nbSets').innerHTML;
    var nbSets = nbSetsTotal - nbSetsRestants;
    console.log("nombre de sets total : " + nbSetsTotal);
    console.log("nombre de sets trouves : " + nbSets);
    
    document.getElementById('nbSets').innerHTML = nbSetsTotal;
    document.getElementById('nbSetsTrouves').innerHTML = nbSets;

    //afficher nbPtsGagne en gros pdt une courte période
    document.getElementById('nbdepts').innerHTML = nbPtsTotal;
});

socket.on('Set invalide', function (setQuiEstInvalide) {
    console.log('pas valide, reessaie p\'tit hacker');
});

socket.on('Reponse classement partie actuelle', function (donnees) {
    // suppression ancien classement
    var myNode = document.getElementById("classement");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    //pour chaque personne
    var tbpersonne = JSON.parse(donnees);
    var noeudP;
    for (i = 0; i < tbpersonne.length ; ++i) {
        noeudP = "<div class=' personneC '> <img src = '/img/boom.png' class='numC'><span class='valueC'>" + tbpersonne[i].rank + "</span><span class='pseudoC'>"+ tbpersonne[i].name +"</span>"
        + "<img src='/img/avatar.png' class='avatarC'></div>"; //A remplacer ac le véritable avatar
       // console.log(tbpersonne[i].name);
        myNode.innerHTML = myNode.innerHTML + noeudP;
    }
    var classement = document.getElementById("classement");
    if (classement.childNodes.length == 0) {
        tb = 0;
    }
    else {
        tb = tbpersonne;
    }
    
});

///////////////////

function demandeClassement(){
    socket.emit('Demande classement partie actuelle');
}

function loadGame(combiCartes) {
    var codeCarte = 0;
    // 1) suppression
    var myNode = document.getElementById("jeu");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    // 2) ajout
    for (var i = 0; i < 12; i++) {
        codecarte = combiCartes.substring(i*4, (i+1)*4);
        $("#jeu").append("<img alt=\"carte\" src=\"/img/" + codecarte + ".png\" class=\"carte\" id=\"" + codecarte + "\" />");
    }
}

function addSetFound(set) {
    nbSetTrouves++;
    var codeCarte = 0;
    $("#trouves").append("<div class=\"set\" id=\"set" + nbSetTrouves + "\"></div>")
    for (var i = 0; i < 3; i++) {
        codecarte = set.substring(i * 4, (i + 1) * 4);
        console.log("codecarte : " + codecarte);
        $("#set" + nbSetTrouves).append("<img alt=\"carte\" src=\"/img/" + codecarte + ".png\" class=\"mincarte\" id=\"" + codecarte + "\" />");
    }
}

function propriete(prop1, prop2, prop3) {
    if ((prop1 == prop2) && (prop2 == prop3) && (prop1 == prop3)) {
        return true;
    }
    else if ((prop1 != prop2) && (prop2 != prop3) && (prop1 != prop3)) {
        return true;
    }
    else {
        return false;
    }

}

function set() {
    var setCorrect = true;
    for (var i = 0; i < 4; i++) {
        var propCorrect = propriete(carte1.charAt(i), carte2.charAt(i), carte3.charAt(i));
        if (!propCorrect) {
            setCorrect = false;
        }
    }
    return setCorrect;
}

function viderCartes() {
    if (carte1 != 0) {
        $("#" + carte1).css('filter', 'none'); /* firefox */
        $("#" + carte1).css('-webkit-filter', 'none'); /* chrome et safari */
        $("#" + carte1).css('-webkit-transition', 'none');
        carte1 = 0;
    }
    if (carte2 != 0) {
        $("#" + carte2).css('filter', 'none'); /* firefox */
        $("#" + carte2).css('-webkit-filter', 'none'); /* chrome et safari */
        $("#" + carte2).css('-webkit-transition', 'none');
        carte2 = 0;
    }
    if (carte3 != 0) {
        $("#" + carte3).css('filter', 'none'); /* firefox */
        $("#" + carte3).css('-webkit-filter', 'none'); /* chrome et safari */
        $("#" + carte3).css('-webkit-transition', 'none');
        carte3 = 0;
    }
}



function cardEvents() {
    $(".carte").click(function () {
        var selection = false;
        // codeCarte est le code correspondant au propriété de la carte "rr3s"
        var codeCarte = $(this).attr('id');

        // on vérifie si la carte est sélectionnée
        if (carte1 == codeCarte) {
            carte1 = 0;
            selection = false;
            console.log("carte1 == codeCarte");
        }
        else if (carte2 == codeCarte) {
            carte2 = 0;
            selection = false;
            console.log("carte2 == codeCarte");
        }
        else if (carte3 == codeCarte) {
            carte3 = 0;
            selection = false;
            console.log("carte3 == codeCarte");
        }
        else if(carte1 == 0){
            carte1 = codeCarte;
            selection = true;
            console.log("carte1 == 0");
        }
        else if(carte2 == 0){
            carte2 = codeCarte;
            selection = true;
            console.log("carte2 == 0");
        }
        else if (carte3 == 0) {
            carte3 = codeCarte;
            selection = true;
            console.log("carte3 == 0");
        }
        if (selection) {
            $(this).css('filter', 'drop-shadow(7px 7px 5px #EBEBFF) contrast(150%)');
        }
        else {
            $(this).css('filter', 'none'); /* firefox */
            $(this).css('-webkit-filter', 'none'); /* chrome et safari */
            $(this).css('-webkit-transition', 'none');
        }

        if ((carte1 != 0) && (carte2 != 0) && (carte3 != 0)) {
            if (set()) {
                // ici insérer ce qu'on veut mettre quand il trouve un set
                console.log("Set trouvé correct");
                console.log("set: " + toStringCards());
                
                var tabCartes = [];
                tabCartes.push({ name: 'carte0', value: carte1 });
                tabCartes.push({ name: 'carte1', value: carte2 });
                tabCartes.push({ name: 'carte2', value: carte3 });
                
                socket.emit('Set', JSON.stringify(tabCartes));

                viderCartes();
                
            }
            else {
                // ici insérer ce qu'on veut mettre quand il se trompe
                console.log("combinaison incorrecte");
                console.log("set: " + toStringCards());
                viderCartes();
            }
        }
    });
}

function toStringCards() {
    return (carte1 + carte2 + carte3);
}