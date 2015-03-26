var mysql = require('mysql');



function bdd(){
    var bdd = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "pikyn0909",
        database: "TER_Set"
    });
    

    this.addUser = function (mail, login, password){
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
    }

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
                console.log("session : " + session.utilisateur);
                socket.emit('Resultat connexion', 1);
            } 
            else {
                socket.emit('Resultat connexion', 0);
            }
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