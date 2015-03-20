module.exports.utilisateur = Utilisateur;

function Utilisateur(mail, login, pwd, id){

    this.idUtilisateur = id || 0;
    this.adresseMail = mail;
    this.pseudo = login;
    this.mdp = pwd;
    
    var that = this;

    this.insereBdd = function (bdd) {
        bdd.addUser(that.adresseMail, that.pseudo, that.mdp);
    }
}