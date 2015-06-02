var mysql = require('mysql');



function bdd() {
    // connexion à la bdd
    var bdd = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "pikyn0909",
        database: "TER_Set"
    });
    
    /////////////////////////////////////////////////
    // GESTION DES UTILISATEURS
    /////////////////////////////////////////////////

    // ajoute un utilisateur (+ verifs)
    this.addUser = function (mail, login, password, img, socket) {
        var date = new Date();
        // on test si le mail existe
        var testMail = "SELECT * FROM Utilisateur WHERE email = '" + mail + "'";
        bdd.query(testMail, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            // si le mail existe déjà 
            if (results.length > 0) {
                var resultat = [];
                resultat.push({ name: 'adresse_mail', value: 'deja prise' });
                resultat.push({ name: 'pseudo', value: 'true' });
                resultat.push({ name: 'mdp', value: 'true' });
                socket.emit('Resultat inscription', JSON.stringify(resultat));
            }
            // sinon on test le pseudo
            else {
                var testPseudo = "SELECT * FROM Utilisateur WHERE pseudo = '" + login + "'";
                bdd.query(testPseudo, function select2(error, results, fields) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    // si le pseudo existe déjà 
                    if (results.length > 0) {
                        var resultat = [];
                        resultat.push({ name: 'adresse_mail', value: 'true' });
                        resultat.push({ name: 'pseudo', value: 'deja pris' });
                        resultat.push({ name: 'mdp', value: 'true' });
                        socket.emit('Resultat inscription', JSON.stringify(resultat));
                    }
                    // sinon go for it
                    else {
                        var requete = "INSERT INTO UTILISATEUR(email, avatar, dateInscription, pseudo, mdp, valide) " 
                                    + "VALUES('" + mail + "','" + img + "', '" + date.toMysqlFormat() 
                                    + "', '" + login + "', '" + password + "', '1') ";
                        
                        bdd.query(requete, function select3(error, results, fields) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            else {
                                var resultat = [];
                                resultat.push({ name: 'adresse_mail', value: 'true' });
                                resultat.push({ name: 'pseudo', value: 'true' });
                                resultat.push({ name: 'mdp', value: 'true' });
                                socket.emit('Resultat inscription', JSON.stringify(resultat));
                            }
                        });
                    }
                });
            }
        });
    };
    
    // modifie le mdp d'un utilisateur
    this.modifierMdpUser = function (nouveauMdp, pseudo) {
        var requete = "UPDATE Utilisateur "
                    + "SET mdp = '" + nouveauMdp + "' "
                    + "WHERE pseudo = '" + pseudo + "' ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };
    
    // modifie l'email d'un utilisateur
    this.modifierEmailUser = function (nouveauMail, pseudo) {
        var requete = "UPDATE Utilisateur U "
                    + "SET email = '" + nouveauMail + "' "
                    + "WHERE pseudo = '" + pseudo + "' ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };

    // connecte un utilisateur (donc il faut la socket, session & co)
    this.connexionUser = function (login, password, socket, session, Utilisateur, utilisateursConnectes) {
        var requete = "SELECT idUtilisateur, avatar, email" 
                    + " FROM Utilisateur U" 
                    + " WHERE U.pseudo = '" + login + "'" 
                    + " AND U.mdp = '" + password + "'";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            if (results.length > 0) {
                var firstResult = results[0];
                session.utilisateur = new Utilisateur(firstResult['email'], login, password, firstResult['avatar'], firstResult['idUtilisateur']);
                session.save();
                utilisateursConnectes[login] = 1;
                socket.emit('Resultat connexion', 1);
            } 
            else {
                socket.emit('Resultat connexion', 0);
            }
        });
    };
    
    this.nomAvatar = function (pseudo, socket){
        var requete = "SELECT img" 
                    + " FROM Utilisateur U" 
                    + " WHERE U.pseudo = '" + pseudo + "'";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            if (results.length > 0) {
                var firstResult = results[0];
                socket.emit('Reponse nom avatar', firstResult['img']);
            }
        });
    }
    
    /////////////////////////////////////////////////
    // GESTION DES CLASSEMENTS
    /////////////////////////////////////////////////

    // classement (infini)
    this.classement = function (socket){
        var requete = "SELECT Distinct(U.pseudo), SUM(J.score) AS 'nbDePts' " 
                    + "FROM Utilisateur U, Joue J " 
                    + "WHERE U.idUtilisateur = J.idUtilisateur " 
                    + "GROUP BY U.pseudo " 
                    + "ORDER BY nbDePts DESC " 
                    + "LIMIT 10 ";
        var classementJSON = [];
        bdd.query(requete, function (error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            for (var i = 0; i < results.length; i++) {
                classementJSON.push({ name: results[i]['pseudo'], value: "" + results[i]['nbDePts'] });
            }
            socket.emit('Reponse classement', JSON.stringify(classementJSON));
        });

    }

    // classement (jour)
    this.classementJour = function (socket) {
        var requete = "SELECT Distinct(U.pseudo), SUM(J.score) AS 'nbDePts' " 
                    + "FROM Utilisateur U, Joue J " 
                    + "WHERE U.idUtilisateur = J.idUtilisateur " 
                    + "AND DAY(J.dateJeu) = DAY(NOW()) " 
                    + "GROUP BY U.pseudo " 
                    + "ORDER BY nbDePts DESC ";
        
        var classementJSON = [];
        bdd.query(requete, function (error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            for (var i = 0; i < results.length; i++) {
                classementJSON.push({ name: results[i]['pseudo'], value: results[i]['nbDePts'] });
            }
            socket.emit('Reponse classement jour', JSON.stringify(classementJSON));
        });
    }

    // classement semaine
    this.classementSemaine = function (socket) {
        var requete = "SELECT Distinct(U.pseudo), SUM(J.score) AS 'nbDePts' " 
        + "FROM Utilisateur U, Joue J " 
        + "WHERE U.idUtilisateur = J.idUtilisateur " 
        + "AND WEEK(J.dateJeu, 1) = WEEK(NOW(), 1) " 
        + "GROUP BY U.pseudo " 
        + "ORDER BY nbDePts DESC ";
        var classementJSON = [];
        bdd.query(requete, function (error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            for (var i = 0; i < results.length; i++) {
                classementJSON.push({ name: results[i]['pseudo'], value: results[i]['nbDePts'] });
            }
            socket.emit('Reponse classement semaine', JSON.stringify(classementJSON));
        });
    }
    
    // ajout d'un score pour un utilisateur
    this.addScoreUser = function (idUtilisateur, score) {
        var requete = "INSERT INTO Joue(idUtilisateur, score, dateJeu) " 
                    + "VALUES(" + idUtilisateur + ", " + score + ", CURRENT_TIMESTAMP) ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };
    
    /////////////////////////////////////////////////
    // GESTION DES AMIS
    /////////////////////////////////////////////////

    // ajouter un ami
    this.ajouteAmi = function (ajouteur, ajoute, socket) {
        if (ajouteur == ajoute) {
            socket.emit('Reponse demande ami', 0);
        }
        else {
            var requetetest0 = "SELECT * " 
                             + "FROM Utilisateur " 
                             + "WHERE pseudo = '" + ajoute + "' ";
            bdd.query(requetetest0, function select(error, results, fields) {
                if (error) {
                    console.log(error);
                    socket.emit('Reponse demande ami', 0);
                    return;
                }
                if (results.length <= 0) {
                    socket.emit('Reponse demande ami', 0);
                }
                else {
                    var requetetest1 = "SELECT * " 
                         + "FROM Amis " 
                         + "WHERE usr1 = '" + ajouteur + "' " 
                         + "AND usr2 = '" + ajoute + "' ";
                    bdd.query(requetetest1, function select1(error, results, fields) {
                        if (error) {
                            console.log(error);
                            socket.emit('Reponse demande ami', 0);
                            return;
                        }
                        if (results.length > 0) {
                            socket.emit('Reponse demande ami', 2);
                        }
                        else {
                            var requetetest2 = "SELECT * " 
                                 + "FROM Amis " 
                                 + "WHERE usr1 = '" + ajoute + "' " 
                                 + "AND usr2 = '" + ajouteur + "' ";
                            bdd.query(requetetest2, function select2(error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    socket.emit('Reponse demande ami', 0);
                                    return;
                                }
                                if (results.length > 0) {
                                    socket.emit('Reponse demande ami', 2);
                                }
                                else {
                                    var requete = "INSERT INTO Amis(usr1, usr2, valide) " 
                                    + "VALUES('" + ajouteur + "', '" + ajoute + "', false) ";
                                    
                                    bdd.query(requete, function select(error, results, fields) {
                                        if (error) {
                                            console.log(error);
                                            socket.emit('Reponse demande ami', 0);
                                            return;
                                        }
                                        socket.emit('Reponse demande ami', 1);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    // accepter un ami
    this.accepteAmi = function (ajoute, ajouteur, socket) {
        var requete = "UPDATE Amis " 
                    + "SET valide = 1 " 
                    + "WHERE usr1 = '" + ajouteur + "' " 
                    + "AND usr2 = '" + ajoute + "' ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            // gestion du trophee 20 amis (mis à 3 pour les tests)
            var requete2 = "SELECT COUNT(*) AS \"nbAmis\""
                        + "FROM Utilisateur U, Amis A " 
                        + "WHERE (U.pseudo = A.usr2 " 
                        + "AND A.usr1 = '" + ajoute + "' " 
                        + "OR (U.pseudo = A.usr1 " 
                        + "AND A.usr2 = '" + ajoute + "')) " 
                        + "AND A.valide = 1 ";
            bdd.query(requete2, function select2(error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }
                if (results[0]['nbAmis'] == 3) {
                    var requete3 = "SELECT idUtilisateur " 
                                 + "FROM Utilisateur " 
                                 + "WHERE Pseudo = '" + ajoute + "'";
                    bdd.query(requete3, function select3(error, results, fields) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        var requete4 = "INSERT INTO TropheesUtilisateur(idUtilisateur, idTrophee) " 
                                     + "VALUES(" + results[0]["idUtilisateur"] + ", 2) ";
                        bdd.query(requete4, function select4(error, results, fields) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                        });
                    });
                }
            });

            // trophees + d'amis ? (en construction)
            var requete5 = "SELECT COUNT(*) AS \"nbAmis\"" 
                        + "FROM Utilisateur U, Amis A " 
                        + "WHERE (U.pseudo = A.usr2 " 
                        + "AND A.usr1 = '" + ajouteur + "' " 
                        + "OR (U.pseudo = A.usr1 " 
                        + "AND A.usr2 = '" + ajouteur + "')) " 
                        + "AND A.valide = 1 ";
            bdd.query(requete5, function select5(error, results, fields) {
                if (error) {
                    console.log(error);
                    return;
                }
                if (results[0]['nbAmis'] == 3) {
                    var requete6 = "SELECT idUtilisateur " 
                                 + "FROM Utilisateur " 
                                 + "WHERE Pseudo = '" + ajouteur + "'";
                    bdd.query(requete6, function select6(error, results, fields) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        var requete7 = "INSERT INTO TropheesUtilisateur(idUtilisateur, idTrophee) " 
                                     + "VALUES(" + results[0]["idUtilisateur"] + ", 2) ";
                        bdd.query(requete7, function select7(error, results, fields) {
                            if (error) {
                                console.log(error);
                                return;
                            }
                        });
                    });
                }
            });
        });
    }

    // refuser un ami
    this.refuseAmi = function (ajoute, ajouteur, socket) {
        var requete = "DELETE FROM Amis "
                    + "WHERE usr1 = '" + ajouteur + "' " 
                    + "AND usr2 = '" + ajoute + "' ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    }

    // liste des demandes d'amis
    this.listeDemandesAmis = function (ajoute, socket) {
        var requete = "SELECT * " 
                    + "FROM Amis " 
                    + "WHERE usr2 = '" + ajoute + "' " 
                    + "AND valide = 0 ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            listeAmisJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeAmisJSON.push({ name: results[i]['usr1'] });
            }
            socket.emit('Reponse liste demandes amis', JSON.stringify(listeAmisJSON));
        });
    };
    
    // liste d'amis
    this.listeAmis = function (pseudo, socket, utilisateursConnectes) {
        var requete = "SELECT U.pseudo, SUM(J.score) AS \"nbDePts\" "
                    + "FROM Utilisateur U, Amis A, Joue J "
                    + "WHERE U.idUtilisateur = J.idUtilisateur "
                    + "AND(U.pseudo = A.usr2 "
                    + "AND A.usr1 = '" + pseudo + "' "
                    + "OR(U.pseudo = A.usr1 "
                    + "AND A.usr2 = '" + pseudo + "')) "
                    + "AND A.valide = true "
                    + "GROUP BY U.pseudo "
                    + "UNION "
                    + "SELECT U.pseudo, 0 "
                    + "FROM Utilisateur U, Amis A "
                    + "WHERE(U.pseudo = A.usr2 "
                    + "AND A.usr1 = '"+ pseudo + "' "
                    + "OR(U.pseudo = A.usr1 "
                    + "AND A.usr2 = '" + pseudo + "')) "
                    + "AND A.valide = true "
                    + "AND U.idUtilisateur NOT IN(SELECT J.idUtilisateur FROM Joue J) "
                    + "GROUP BY U.pseudo ";
        

        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeAmisJSON = [];
            for (var i = 0; i < results.length; i++) {
                if (utilisateursConnectes[results[i]['pseudo']] == 1)
                    listeAmisJSON.push({ name : results[i]['pseudo'], status: true, points: results[i]['nbDePts'] });
                else
                    listeAmisJSON.push({ name : results[i]['pseudo'], status: false, points: results[i]['nbDePts'] });
            }
            socket.emit('Reponse liste amis', JSON.stringify(listeAmisJSON));
        });
    };

    /////////////////////////////////////////////////
    // GESTION DES TROPHEES
    /////////////////////////////////////////////////

    // ajoute un trophees
    this.ajouteTrophee = function (idUtilisateur, idTrophee, socket) {
        var requete = "SELECT * "
                    + "FROM TropheesUtilisateur TU "
                    + "WHERE TU.idUtilisateur = " + idUtilisateur + " "
                    + "AND TU.idTrophee = " + idTrophee + " ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            // si il a pas le trophee
            if (results.length == 0) {
                var requete2 = "INSERT INTO TropheesUtilisateur(idUtilisateur, idTrophee) " 
                             + "VALUES(" + idUtilisateur + ", " + idTrophee + ") ";
                bdd.query(requete2, function select2(error, results, fields) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var requete3 = "SELECT * " 
                                 + "FROM Trophee " 
                                 + "WHERE idTrophee = " + idTrophee;
                    
                    bdd.query(requete3, function select3(error, results, fields) {
                        if (error) {
                            console.log(error);
                            return;
                        }
                        debloqueTropheeJSON = [];
                        debloqueTropheeJSON.push({name: results[0]["nomT"], desc: results[0]["descriptionT"], pic: results[0]["imgT"]});
                        socket.emit('Deblocage trophee', JSON.stringify(debloqueTropheeJSON));
                    });
                });
            }
        });
    };
    
    // liste des trophees
    this.tropheesByPseudo = function (pseudo, socket) {
        var requete = "SELECT T.nomT, T.imgT, T.descriptionT "
                    + "FROM TropheesUtilisateur TU, Trophee T, Utilisateur U "
                    + "WHERE TU.idTrophee = T.idTrophee "
                    + "AND TU.idUtilisateur = U.idUtilisateur "
                    + "AND U.pseudo = '" + pseudo + "' " 
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeTropheesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeTropheesJSON.push({ name : results[i]['nomT'], desc: results[i]['descriptionT'], pic: results[i]['imgT'] });
            }
            socket.emit('Reponse liste trophees', JSON.stringify(listeTropheesJSON));
        });
    };
    
    this.voirTropheesByPseudo = function (pseudo, socket) {
        var requete = "SELECT T.nomT, T.imgT, T.descriptionT " 
                    + "FROM TropheesUtilisateur TU, Trophee T, Utilisateur U " 
                    + "WHERE TU.idTrophee = T.idTrophee " 
                    + "AND TU.idUtilisateur = U.idUtilisateur " 
                    + "AND U.pseudo = '" + pseudo + "' "
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeTropheesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeTropheesJSON.push({ name : results[i]['nomT'], desc: results[i]['descriptionT'], pic: results[i]['imgT'] });
            }
            socket.emit('Reponse voir liste trophees', JSON.stringify(listeTropheesJSON));
        });
    };

    /////////////////////////////////////////////////
    // GESTION DES MEDAILLES
    /////////////////////////////////////////////////
    
    // liste des médailles
    this.medaillesByPseudo = function (pseudo, socket) {
        var requete = "SELECT M.nomM, M.imgM, M.descriptionM " 
                    + "FROM Utilisateur U, Medaille M " 
                    + "WHERE M.idUtilisateur = U.idUtilisateur " 
                    + "AND U.pseudo = '" + pseudo + "' ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeMedaillesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeMedaillesJSON.push({ name : results[i]['nomM'], desc: results[i]['descriptionM'], pic: results[i]['imgM'] });
            }
            socket.emit('Reponse liste medailles', JSON.stringify(listeMedaillesJSON));
        });
    };
    
    this.voirMedaillesByPseudo = function (pseudo, socket) {
        var requete = "SELECT M.nomM, M.imgM, M.descriptionM " 
                    + "FROM Utilisateur U, Medaille M " 
                    + "WHERE M.idUtilisateur = U.idUtilisateur " 
                    + "AND U.pseudo = '" + pseudo + "' ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeMedaillesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeMedaillesJSON.push({ name : results[i]['nomM'], desc: results[i]['descriptionM'], pic: results[i]['imgM'] });
            }
            socket.emit('Reponse voir liste medailles', JSON.stringify(listeMedaillesJSON));
        });
    };

    // ajouter une medaille
    this.ajouteMedaille = function (idUtilisateur, idMedaille, socket) {
        var requete = "UPDATE medaille " 
                    + "SET idUtilisateur = " + idUtilisateur + " " 
                    + "WHERE idMedaille = " + idMedaille + " ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };
}

// conversion date format mysql
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function () {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate());
};

module.exports.bdd = new bdd();