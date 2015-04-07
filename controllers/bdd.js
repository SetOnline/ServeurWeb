var mysql = require('mysql');



function bdd(){
    var bdd = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "pikyn0909",
        database: "TER_Set"
    });
    

    this.addUser = function (mail, login, password) {
        var date = new Date();
        
        var requete = "INSERT INTO UTILISATEUR(email, avatar, dateInscription, pseudo, mdp, valide) " 
                                    + "VALUES('" + mail + "','', '" + date.toMysqlFormat() 
                                    + "', '" + login + "', '" + password + "', '1') ";
        
        bdd.query(requete, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
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
    }

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
                classementJSON.push({ name: results[i]['pseudo'], value: results[i]['nbDePts']});
            }
        });
        socket.emit('Reponse classement', classementJSON);
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
        });
        socket.emit('Reponse classement jour', classementJSON);
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
        });
        socket.emit('Reponse classement semaine', classementJSON);
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