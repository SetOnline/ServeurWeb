var mysql = require('mysql');



function bdd(){
    var bdd = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "pikyn0909",
        database: "TER_Set"
    });
    
    /////////////////////////////////////////////////
    // GESTION DES UTILISATEURS
    /////////////////////////////////////////////////

    this.addUser = function (mail, login, password, socket) {
        var date = new Date();
        // on test si le mail existe
        var testMail = "SELECT * FROM Utilisateur WHERE email = '" + mail + "'";
        bdd.query(testMail, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            // si le mail existe d�j� 
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
                    // si le pseudo existe d�j� 
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
                                    + "VALUES('" + mail + "','', '" + date.toMysqlFormat() 
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
    
    this.modifierPseudoUser = function (nouveauPseudo, ancienPseudo) {
        var requete = "UPDATE Utilisateur "
                    + "SET pseudo = " + nouveauPseudo + " "
                    + "WHERE pseudo = " + ancienPseudo + " ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };
    
    this.modifierEmailUser = function (nouveauMail, pseudo) {
        var requete = "UPDATE Utilisateur U "
                    + "SET email = " + nouveauMail + " "
                    + "WHERE pseudo = " + pseudo + " ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
        });
    };

    this.connexionUser = function (login, password, socket, session, Utilisateur) {
        var requete = "SELECT idUtilisateur, email" 
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
                session.utilisateur = new Utilisateur(firstResult['email'], login, password, firstResult['idUtilisateur']);
                session.save();
                socket.emit('Resultat connexion', 1);
            } 
            else {
                socket.emit('Resultat connexion', 0);
            }
        });
    };
    
    /////////////////////////////////////////////////
    // GESTION DES CLASSEMENTS
    /////////////////////////////////////////////////

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
            socket.emit('Reponse classement jour', classementJSON);
        });
    }

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
            socket.emit('Reponse classement semaine', classementJSON);
        });
    }
    
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

    this.ajouteAmi = function (ajouteur, ajoute, socket) {
        if (ajouteur == ajoute) {
            socket.emit('Reponse demande ami', 0);
        }
        else {
            var requetetest1 = "SELECT * " 
                         + "FROM Amis " 
                         + "WHERE usr1 = '" + ajouteur + "' " 
                         + "AND usr2 = '" + ajoute + "' ";
            bdd.query(requetetest1, function select(error, results, fields) {
                if (error) {
                    console.log(error);
                    socket.emit('Reponse demande ami', 0);
                    return;
                }
                if (results.length > 0) {
                    socket.emit('Reponse demande ami', 0);
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
                            socket.emit('Reponse demande ami', 0);
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
    }

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
        });
    }

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

    this.listeAmis = function (pseudo, socket) {
        var requete = "SELECT U.pseudo, SUM(J.score) AS \"nbDePts\" " 
                    + "FROM Utilisateur U, Amis A, Joue J " 
                    + "WHERE U.idUtilisateur = J.idUtilisateur " 
                    + "AND (U.pseudo = A.usr2 " 
                    + "AND A.usr1 = '" + pseudo + "' " 
                    + "OR (U.pseudo = A.usr1 " 
                    + "AND A.usr2 = '" + pseudo + "')) " 
                    + "AND A.valide = 1 ";
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeAmisJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeAmisJSON.push({ name : results[i]['pseudo'], status: true, points: results[i]['nbDePts'] });
            }
            socket.emit('Reponse liste demandes amis', JSON.stringify(listeAmisJSON));
        });
    };

    /////////////////////////////////////////////////
    // GESTION DES TROPHEES
    /////////////////////////////////////////////////

    this.tropheesByPseudo = function (pseudo, socket) {
        var requete = "SELECT T.nomT, T.imgT, T.descriptionT "
                    + "FROM TropheesUtilisateur TU, Utilisateur U, Trophee T "
                    + "WHERE TU.idTrophee = T.idTrophee "
                    + "AND TU.idUtilisateur = U.idUtilisateur "
                    + "AND U.pseudo = '" + pseudo + "' ";
        console.log(requete);
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeTropheesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeTropheesJSON.push({ name : results[i]['nomT'], desc: results[i]['descriptionT'], pic: results[i]['imgT'] });
            }
            console.log("j'envoie trophees : ");
            console.log(listeTropheesJSON);
            socket.emit('Reponse liste trophees', JSON.stringify(listeTropheesJSON));
        });
    };

    /////////////////////////////////////////////////
    // GESTION DES MEDAILLES
    /////////////////////////////////////////////////
    
    this.medaillesByPseudo = function (pseudo, socket) {
        var requete = "SELECT M.nomM, M.imgM, M.descriptionM " 
                    + "FROM Utilisateur U, Medaille M " 
                    + "WHERE M.idUtilisateur = U.idUtilisateur " 
                    + "AND U.pseudo = '" + pseudo + "' ";
        console.log(requete);
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            var listeMedaillesJSON = [];
            for (var i = 0; i < results.length; i++) {
                listeMedaillesJSON.push({ name : results[i]['nomM'], desc: results[i]['descriptionM'], pic: results[i]['imgM'] });
            }
            console.log("j'envoie medailles : ");
            console.log(listeMedaillesJSON);
            socket.emit('Reponse liste medailles', JSON.stringify(listeMedaillesJSON));
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