// abcd
// avec
// a : couleur (1 : R, 2 : V, 3 : B)
// b : remplissage (1 : plein, 2 : raye, 3 : vide)
// c : quantite (1, 2, 3)
// d : forme (1 : eclair, 2 : sphère, 3 : triangle)



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
    
    this.gestionSet = function (setJoueur, idUtilisateur, pseudo, classementTempsReel, socket, bdd) {
        var setPropose = JSON.parse(setJoueur);
        if ((that.estUnSetValide(setPropose[0].value, setPropose[1].value, setPropose[2].value)) 
            && that.estPasEncoreJoue(setPropose, socket.setDejaJoue)) {
            // gestion des trophees 10, 20 parties d'affilees
            if (socket.multiplicateur == 1) {
                socket.nbPartiesAffilees++;
                if (socket.nbPartiesAffilees == 10)
                    bdd.ajouteTrophee(idUtilisateur, 5, socket);
                if (socket.nbPartiesAffilees == 20)
                    bdd.ajouteTrophee(idUtilisateur, 6, socket);
            }
            // on garde en mémoire que le joueur a deja trouve ce set 
            socket.setDejaJoue.push({ carte1 : setPropose[0].value, carte2 : setPropose[1].value, carte3 : setPropose[2].value });
            // on ajoute le multiplicateur au score 
            socket.nbPtsPartie += socket.multiplicateur;
            // puis on double le multiplicateur (x2 pour le set suivant)
            socket.multiplicateur = socket.multiplicateur * 2;
            if (socket.utilisateur != 0) {
                classementTempsReel[pseudo] = socket.nbPtsPartie;
            }
            // il reste un set de moins à trouver
            socket.nbSetsValidesRestants -= 1;
            setPropose.push({ name: 'nbSetsRestants', value: socket.nbSetsValidesRestants });
            setPropose.push({ name: 'nbPtsGagne', value: (socket.multiplicateur / 2) });
            setPropose.push({ name: 'nbPtsTotal', value: (socket.nbPtsPartie) });
            socket.emit('Set valide', JSON.stringify(setPropose));
        } else {
            socket.emit('Set invalide', setJoueur);
        }
    };
    
    // génère le classement en temps réel de la partie
    this.classementTempsReelJSON = function (pseudo, classementTempsReel){
        var sort = sortAssoc(classementTempsReel);
        var classementJSON = [];
        var position = 0; // on considere ici position comme rank du joueur
        var positionJoueur = 0; // positionJoueur est le rank du joueur qui fait la requête de classement
        var precName = ""; // nom du joueur précédent
        var precScore = 0; // score du joueur précedent
        var precPosition = 0; // position du joueur précedent
        var prec2Name = ""; // le nom de l'antépenultieme
        var prec2Score = 0; // le score de l'antepenultieme
        var prec2Position = 0; // la position de l'antepenultieme
        for (var key in sort) {
            position++;
            if (key == pseudo)
                positionJoueur = position;
            if (position <= 5)
                classementJSON.push({ name: key, value: sort[key], rank: position });
            if (positionJoueur > 4) {
                // tour de boucle du joueur qui demande le classement
                if (positionJoueur == position) {
                    // on pop les 3 derniers joueurs (3, 4 et 5eme)
                    classementJSON.pop();
                    classementJSON.pop();
                    classementJSON.pop();
                    // on ajoute le precedent + le joueur
                    classementJSON.push({ name: prec2Name, value: prec2Score, rank: prec2Position });
                    classementJSON.push({ name: precName, value: precScore, rank: precPosition });
                    classementJSON.push({ name: key, value: sort[key], rank: position });
                }
                // tour de boucle du joueur d'apres
                if ((positionJoueur + 1) == position) {
                    classementJSON[2] = classementJSON[3];
                    classementJSON[3] = classementJSON[4];
                    classementJSON[4] = { name: key, value: sort[key], rank: position };
                    
                }
            }
            prec2Name = precName;
            prec2Score = precScore;
            prec2Position = precPosition;
            precName = key;
            precScore = sort[key];
            precPosition = position;
        }
        return classementJSON;
    }
    
    // renvoie vrai si le set n a pas ete trouve par le joueur
    this.estPasEncoreJoue = function(setPropose, setsDejaJoues) {
        for (var i = 0; i < setsDejaJoues.length; i++) {
            if (((setPropose[0].value == setsDejaJoues[i].carte1) ||
                (setPropose[0].value == setsDejaJoues[i].carte2) ||
                (setPropose[0].value == setsDejaJoues[i].carte3)) &&
                ((setPropose[1].value == setsDejaJoues[i].carte1) ||
                (setPropose[1].value == setsDejaJoues[i].carte2) ||
                (setPropose[1].value == setsDejaJoues[i].carte3)) &&
                ((setPropose[2].value == setsDejaJoues[i].carte1) ||
                (setPropose[2].value == setsDejaJoues[i].carte2) ||
                (setPropose[2].value == setsDejaJoues[i].carte3)))
                return false;
        }
        return true;
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
    // @return : retourne une chaine de 4 caractères correspondant au code de la carte genere
    function genererCombinaison() {
        var combi = '';
        var i;
        for (i = 0; i != 4; ++i) {
            combi += randomInt(1, 4);
        }
        return combi;
    }

    // verifie si une carte n'a pas ete tiree
    // @param tab : tableau contenant les codes des cartes dejà tirees
    // @param carte : le code carte à verifier
    // @return : vrai si la carte est dejà tiree, faux sinon
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
                        // triche
                        console.log("set : " + (i + 1) + " " + (j + 1) + " " + (k + 1));
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

    
    // trie le tableau en fonction des values
    function sortAssoc(aInput) {
        var aTemp = [];
        for (var sKey in aInput)
            aTemp.push([sKey, aInput[sKey]]);
        aTemp.sort(function () { return arguments[0][1] > arguments[1][1] });
        
        var tab = [];
        for (var nIndex = aTemp.length - 1; nIndex >= 0; nIndex--)
            tab[aTemp[nIndex][0]] = aTemp[nIndex][1];
        
        return tab;
    }


}
















