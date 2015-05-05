module.exports.utilisateur = Utilisateur;

function Utilisateur(mail, login, pwd, id){

    this.idUtilisateur = id || 0;
    this.adresseMail = mail;
    this.pseudo = login;
    this.mdp = pwd;
    
    var that = this;

    this.insereBdd = function (bdd, socket) {
        if (that.adresseMail == "") {
            var resultat = [];
            resultat.push({ name: 'adresse_mail', value: 'invalide' });
            resultat.push({ name: 'pseudo', value: 'true' });
            resultat.push({ name: 'mdp', value: 'true' });
            socket.emit('Resultat inscription', JSON.stringify(resultat));
        }
        else if (that.pseudo == "") {
            var resultat = [];
            resultat.push({ name: 'adresse_mail', value: 'true' });
            resultat.push({ name: 'pseudo', value: 'invalide' });
            resultat.push({ name: 'mdp', value: 'true' });
            socket.emit('Resultat inscription', JSON.stringify(resultat));
        }
        else if (that.mdp == "") {
            var resultat = [];
            resultat.push({ name: 'adresse_mail', value: 'true' });
            resultat.push({ name: 'pseudo', value: 'true' });
            resultat.push({ name: 'mdp', value: 'invalide' });
            socket.emit('Resultat inscription', JSON.stringify(resultat));
        }
        else {
            bdd.addUser(that.adresseMail, that.pseudo, that.mdp, socket);
        }  
    };

    this.modifierPseudo = function (nouveauPseudo, bdd) {
        bdd.modifierPseudo(nouveauPseudo, that.pseudo);
    };

    this.modifierEmail = function (nouveauEmail, bdd) {
        bdd.modifierEmail(nouveauEmail, that.pseudo);
    };
}