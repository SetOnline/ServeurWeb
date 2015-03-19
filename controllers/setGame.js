// abcd
// avec
// a : couleur (1 : R, 2 : V, 3 : B)
// b : remplissage (1 : plein, 2 : raye, 3 : vide)
// c : quantite (1, 2, 3)
// d : forme (1 : eclair, 2 : sph�re, 3 : triangle)



module.exports.setGame = new setGame();


function setGame(){
    // By convention, we make a private that variable. This is used to make the object available to the private methods.
    //This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions.
    var that = this;
    
    // privileged methods
    

    // generation des 12 cartes et remplissage du fichier JSON
    // @return : un string correspondant au fichier JSON contenant les 12 cartes (un JSON stringifie)
    this.genererNouvellePartieEnJSON = function () {
        
        var tabCartes = [];
        var i;
        nbSetsTrouvablesPartieEnCours = 0;
        
        while (nbSetsTrouvablesPartieEnCours == 0) {
            tabCartes.length = 0; // on delete tout
            for (i = 0; i != 12; ++i) {
                var carteTiree = genererCombinaison();
                if (carteDejaTiree(tabCartes, carteTiree)) {
                    i--;
                } else {
                    //result.push({ name: name, goals: goals[name] });
                    tabCartes.push({ name: 'carte' + i, value: carteTiree });
                }
            }
            nbSetsTrouvablesPartieEnCours = getNbSolutions(JSON.stringify(tabCartes));
        }
        tabCartes.push({ name: 'nbSets', value: nbSetsTrouvablesPartieEnCours });
        return JSON.stringify(tabCartes);
    }
    
    // validation d'un set
    // @param carte1 : code de la carte 1
    // @param carte2 : code de la carte 2
    // @param carte3 : code de la carte 3
    // @return : vrai si let set est valide, faux sinon
    this.estUnSetValide = function (carte1, carte2, carte3) {
        var setCorrect = true;
        for (var i = 0; i < 4; i++) {
            var propCorrect = propriete(carte1.charAt(i), carte2.charAt(i), carte3.charAt(i));
            if (!propCorrect) {
                setCorrect = false;
            }
        }
        return setCorrect;
    }


    // private methods
    

    // fonction utilise pour generer aleatoirement les 12 cartes distribues
    // @param low : borne -
    // @param high : borne +
    // @return : retourne un entier compris entre low et high
    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }
    
    // genere une combinaison correspondant au code d'une carte
    // @return : retourne une chaine de 4 caract�res correspondant au code de la carte genere
    function genererCombinaison() {
        var combi = '';
        var i;
        for (i = 0; i != 4; ++i) {
            combi += randomInt(1, 4);
        }
        return combi;
    }

    // verifie si une carte n'a pas ete tiree
    // @param tab : tableau contenant les codes des cartes dej� tirees
    // @param carte : le code carte � verifier
    // @return : vrai si la carte est dej� tiree, faux sinon
    function carteDejaTiree(tab, carte) {
        var i;
        for (i = 0; i != tab.length; ++i) {
            if (tab[i].value == carte) {
                //console.log('-' + tab[i] + '- == -' + carte + '-');
                return true;
            } else {
            //console.log('-' + tab[i] + '- != -' + carte + '-');
            }
        }
        return false;
    }

    // determine le nombre de solution d'un jeu
    // @return : le nombre de solution
    function getNbSolutions(partie) {
        var tabCartes = JSON.parse(partie);
        var res = 0;
        
        for (var i = 0; i != 10; ++i) {
            for (var j = i + 1; j != 11; ++j) {
                for (var k = j + 1; k != 12; ++k) {
                    if (that.estUnSetValide(tabCartes[i].value, tabCartes[j].value, tabCartes[k].value)) {
                        res++;
                    }
                }
            }
        }
        return res;
    }

    // validation d'une propriete
    // @param prop1 : propriete de la carte 1
    // @param prop2 : propriete de la carte 2
    // @param prop3 : propriete de la carte 3
    // @return : vrai si les 3 valeurs de proprietes sont soit toutes differentes soit toutes identiques, faux sinon
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
}
















