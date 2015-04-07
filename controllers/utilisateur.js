module.exports.utilisateur = Utilisateur;

function Utilisateur(mail, login, pwd, id){

    this.idUtilisateur = id || 0;
    this.adresseMail = mail;
    this.pseudo = login;
    this.mdp = pwd;
    
    var that = this;

    this.insereBdd = function (bdd, socket) {
        bdd.addUser(that.adresseMail, that.pseudo, that.mdp, socket);
    };

    this.modifierPseudo = function (nouveauPseudo, bdd) {
        bdd.modifierPseudo(nouveauPseudo, that.pseudo);
    };

    this.modifierEmail = function (nouveauEmail, bdd) {
        bdd.modifierEmail(nouveauEmail, that.pseudo);
    };
}