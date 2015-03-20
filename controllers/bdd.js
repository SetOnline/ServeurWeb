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