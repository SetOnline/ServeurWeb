var mysql = require('mysql');



function bdd(){
    var bdd = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "pikyn0909",
        database: "TER_Set"
    });
    
    this.addUser = function (mail, login, password, socket) {
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
    
    this.ajouteAmi = function (ajouteur, ajoute, socket) {
        if (ajouteur == ajoute) {
            socket.emit('Reponse demande ami', 0);
            console.log("1");
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
                    console.log("2");
                    return;
                }
                if (results.length > 0) {
                    socket.emit('Reponse demande ami', 0);
                    console.log("3");
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
                            console.log("4");
                            return;
                        }
                        if (results.length > 0) {
                            socket.emit('Reponse demande ami', 0);
                            console.log("5");
                        }
                        else {
                            var requete = "INSERT INTO Amis(usr1, usr2, valide) " 
                                    + "VALUES('" + ajouteur + "', '" + ajoute + "', false) ";
                            
                            bdd.query(requete, function select(error, results, fields) {
                                if (error) {
                                    console.log(error);
                                    socket.emit('Reponse demande ami', 0);
                                    console.log("6");
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
                listeAmisJSON.push({ name: results[i]['usr1']});
            }
            socket.emit('Reponse liste demandes amis', JSON.stringify(listeAmisJSON));
        });
    }

    this.listeAmis = function (pseudo, socket){
        var requete = "SELECT * " 
                    + "FROM Amis " 
                    + "WHERE (usr2 = '" + pseudo + "' OR usr1 = '" + pseudo + "') "
                    + "AND valide = 1 ";
        console.log(requete);
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            console.log("jpasse la ");
            console.log(results);
            listeAmisJSON = [];
            var ami;
            for (var i = 0; i < results.length; i++) {
                if (results[i]['usr1'] == pseudo)
                    ami = results[i]['usr2'];
                else
                    ami = results[i]['usr1'];
                listeAmisJSON.push({ name : ami, status: true });
            }
            console.log("j'envoie : ");
            console.log(listeAmisJSON);
            socket.emit('Reponse liste demandes amis', JSON.stringify(listeAmisJSON));
        });
        

    }
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