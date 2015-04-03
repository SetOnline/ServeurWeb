var carte1 = 0;
var carte2 = 0;
var carte3 = 0;
var nbSetTrouves = 0;

///////////////////
// COMMUNICATION
///////////////////

var socket = io(); //.connect('http://localhost:1337/game');

socket.on('timer', function (message) {

    document.getElementById('idTIMER').innerHTML = "il reste " + message + " secondes avant la fin du jeu !";

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
    
    // suppression sets trouvés
    var myNode = document.getElementById("trouves");
    while(myNode.firstChild){
        myNode.removeChild(myNode.firstChild);
    }
});

socket.on('Set valide', function (setQuiEstValide) {
    console.log("youhou c'est valide");
    var setPropose = JSON.parse(setQuiEstValide);
    var setBon = '';
    setBon += setPropose[0].value;
    setBon += setPropose[1].value;
    setBon += setPropose[2].value;

    addSetFound(setBon);
});

socket.on('Set invalide', function (setQuiEstInvalide) {
    console.log('pas valide, reessaie p\'tit hacker');
});

///////////////////


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
        $("#" + carte1).css('filter', 'sepia(0)');
        $("#" + carte1).css('-webkit-filter', 'sepia(0)');
        $("#" + carte1).css('-moz-filter', 'sepia(0)');
        $("#" + carte1).css('-o-filter', 'sepia(0)');
        $("#" + carte1).css('-ms-filter', 'sepia(0)');
        carte1 = 0;
    }
    if (carte2 != 0) {
        $("#" + carte2).css('filter', 'sepia(0)');
        $("#" + carte2).css('-webkit-filter', 'sepia(0)');
        $("#" + carte2).css('-moz-filter', 'sepia(0)');
        $("#" + carte2).css('-o-filter', 'sepia(0)');
        $("#" + carte2).css('-ms-filter', 'sepia(0)');
        carte2 = 0;
    }
    if (carte3 != 0) {
        $("#" + carte3).css('filter', 'sepia(0)');
        $("#" + carte3).css('-webkit-filter', 'sepia(0)');
        $("#" + carte3).css('-moz-filter', 'sepia(0)');
        $("#" + carte3).css('-o-filter', 'sepia(0)');
        $("#" + carte3).css('-ms-filter', 'sepia(0)');
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


/*
$(document).ready(function () {
    loadGame("123113211111313213213231321323131213213213121321");
    //addSetFound("123113211111");
	cardEvents();
});*/