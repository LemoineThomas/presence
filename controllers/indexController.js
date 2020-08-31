const mongoose = require("mongoose");
const Organismes = require("../models/organismes");
const Formations = require("../models/formations");
const Users = require("../models/users");
const Signer = require("../models/signer");
const validator = require('validator');

var express     = require("express"),
fs              = require('fs'),
request         = require('request'),

http = require('http'),
fs = require('fs'),
pdf = require('html-pdf'),

app             = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

var ObjectId = mongoose.Types.ObjectId;

var controller = {}

controller.addUser = async (req, res) => {
  var email = await Users.findOne({ email: req.body.email})
  var login = await Users.findOne({ login: validator.escape(req.body.pseudo)})

  if(!email && !login){
    try {
      Users.create({
        login: validator.escape(req.body.pseudo),
        email: req.body.email,
        nom: req.body.nom,
        prenom: req.body.prenom,
        password: req.body.password,
        admin: false
      })
    } catch (error) {
      console.log(error)
    }

    var formation = await Formations.find({})
    var user =  await Users.findOne({email: req.body.email})
    
    try {
      Signer.create({id_users: user._id, id_formations: formation[0]._id})
    } catch (error) {
      console.log(error)
    }
    
    

    res.render('./login.ejs', {
      title: "login",
      formation : formation
    })
    
  }else{
    res.render('./inscription.ejs', {
      title: "inscription",
      type: 'error',
      message : "Vous êtes déjà inscrit"
    })
  }
  

}


controller.index = async (req, res) => {
  var organisme = await Organismes.find({})
  var formation = await Formations.find({})
  var signer = await Signer.find({id_users: req.session.user._id}).populate('id_formations')
  
  if(req.session.user.admin){
    res.render('./index.ejs', {
      title: "dashboard",
      organisme : organisme,
      formation : formation
    })
  }else{
    var signatures = signer[0].id_formations.contenu.apprenants[0]
    console.log(signatures)
    var today = new Date();
    res.render('./dashboard.ejs', {
      title: "dashboard",
      organisme : organisme,
      formation : formation,
      signatures: signatures,
      today: today
    })
  }
  
  

}


controller.generer = async (req, res) => {
  var organismes = await Organismes.find({})
  var formations = await Formations.find({})
  var organisme = await Organismes.findOne({
    nom: req.body.organisme
  });
  var formation = await Formations.findOne({
    nom: req.body.formation
  });

  nbApprenants = Object.values(formation.contenu.apprenants).length
  nbApprenantsDansPDF = 0
  limiteApprenantsDansPDF = 6;
  htm = ''
  
  do{
    
    if(nbApprenants - nbApprenantsDansPDF <= limiteApprenantsDansPDF && nbApprenants - nbApprenantsDansPDF > 0){
      htm +=  '<header style="margin-top:100px">'
      htm +=  '<img style="float:left; width: 300px;margin-left:60px" src="' + organisme.image + '">'
      htm +=  '<div style="float:rigth; font-family:Arial; margin-left:500px">'
      htm +=      '<h1 style="font-size: 25px;">FEUILLE D\'ÉMARGEMENT -> PÉRIODE EN FORMATION</h1>'
      htm +=      '<p style="font-size: 15px;"><strong>Intitulé : ' + formation.nom + '</strong></p>'
      htm +=      '<p style="font-size: 15px;"><strong>Organisme de formation :</strong> ' + organisme.nom + '</p>'
      htm +=  '</div>'
      htm +=  '</header>'
      htm += '<table style="font-size: 10px; margin:60px; border-collapse: collapse; font-family:Arial;">'
      htm +=   '<tr>'
      htm +=       '<th> </th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.lundi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.mardi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.mercredi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.jeudi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.vendredi.slice(+1, -1) + '</th>'
      htm +=   '</tr>'

      htm +=   '<tr>'
      htm +=       '<th style="border: 1px solid black; width:250px">NOM PRÉNOM APPRENANT.E</th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=   '</tr>'
      
      for (let index = nbApprenantsDansPDF; index < nbApprenants; index++) {
        htm +=   '<tr style="height:50px;">'
        htm +=      '<td style="border: 1px solid black; font-size: 10px;"><strong>' + Object.values(formation.contenu.apprenants)[index].nom.slice(+1, -1) + '</strong></td>' 
        htm +=       '<td style="border: 1px solid black;"><img src="data:image/png;base64,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" height="50px" width="max-content" alt="signature"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        
        htm +=   '</tr>'
        
      }

      htm +=   '<tr>'
      htm +=        '<td> </td>'
        Object.values(formation.contenu.formateur).forEach(element => {
          htm +=     '<td style="border: 1px solid black; height:130px; vertical-align:top; text-align: center" colspan="2">NOM Prénom formateur.rice : </br></br><strong>' + element.slice(+1, -1) + '</strong></td>' 

        })
      htm +=   '</tr>'
      htm += '</table>'

    }else if (nbApprenants - nbApprenantsDansPDF > limiteApprenantsDansPDF){
      htm +=  '<header style="margin-top:100px">'
      htm +=  '<img style="float:left; width: 300px;margin-left:60px" src="' + organisme.image + '">'
      htm +=  '<div style="float:rigth; font-family:Arial; margin-left:500px">'
      htm +=      '<h1 style="font-size: 25px;">FEUILLE D\'ÉMARGEMENT -> PÉRIODE EN FORMATION</h1>'
      htm +=      '<p style="font-size: 15px;"><strong>Intitulé : ' + formation.nom + '</strong></p>'
      htm +=      '<p style="font-size: 15px;"><strong>Organisme de formation :</strong> ' + organisme.nom + '</p>'
      htm +=  '</div>'
      htm +=  '</header>'
      htm += '<table style="font-size: 10px; margin:60px; border-collapse: collapse; font-family:Arial;">'
      htm +=   '<tr>'
      htm +=       '<th> </th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.lundi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.mardi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.mercredi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.jeudi.slice(+1, -1) + '</th>'
      htm +=       '<th style="border: 1px solid black;" colspan="2">Le ' + formation.contenu.date.vendredi.slice(+1, -1) + '</th>'
      htm +=   '</tr>'

      htm +=   '<tr>'
      htm +=       '<th style="border: 1px solid black; width:250px">NOM PRÉNOM APPRENANT.E</th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">MATIN</br><span style="font-size: 8px;">Durée en h : 4</span></th>'
      htm +=       '<th style="border: 1px solid black; width:100px">APRES-MIDI</br><span style="font-size: 8px;">Durée en h : 3</span></th>'
      htm +=   '</tr>'
      
      for (let index = nbApprenantsDansPDF; index < (nbApprenantsDansPDF + limiteApprenantsDansPDF); index++) {
        htm +=   '<tr style="height:50px;">'
        htm +=      '<td style="border: 1px solid black; font-size: 10px;"><strong>' + Object.values(formation.contenu.apprenants)[index].nom.slice(+1, -1) + '</strong></td>' 
        htm +=       '<td style="border: 1px solid black;"></td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        htm +=       '<td style="border: 1px solid black;"> </td>'
        
        htm +=   '</tr>'
        
      }

      htm +=   '<tr>'
      htm +=        '<td> </td>'
        Object.values(formation.contenu.formateur).forEach(element => {
          htm +=     '<td style="border: 1px solid black; height:130px; vertical-align:top; text-align:center" colspan="2">NOM Prénom formateur.rice : </br></br><strong>' + element.slice(+1, -1) + '</strong></td>' 

        })
      htm +=   '</tr>'
      htm += '</table>'
      for (let index = 0; index < 11; index++) {
        htm += '</br>'
        
      }
    }
    nbApprenantsDansPDF = nbApprenantsDansPDF + limiteApprenantsDansPDF

  }while (nbApprenants >= nbApprenantsDansPDF)
  
  
  var options = { orientation: "landscape" };
  pdf.create(htm, options).toStream(function(err, stream){
    stream.pipe(fs.createWriteStream('./monpdf.pdf'));
  });

  
  res.download('monpdf.pdf');

}

controller.visulogin = async (req, res) => {
  res.render('./login.ejs', {
    title: "login"
  })
}

controller.login = async (req, res) => {
  const {
    email,
    password
  } = req.body
  if (!email || !password) {
    req.session.msgFlash = {
      type: "danger",
      message: "Donnée manquante"
    }
    res.redirect('/')
  } else {
    try {
      const user = await Users.findOne({
        email: email
      })
      if (!user || (user.email !== email && user.password !== password)) {
        req.session.msgFlash = {
          type: "danger",
          message: "Identifiants invalide"
        }
        res.redirect('/')
      } else {
        req.session.user = user // use session for user connected
        console.log(req.session)
        req.session.msgFlash = {
          type: "success",
          message: "Bienvenu " + user.login
        }
        res.redirect('/dashboard/')
      }
    } catch (error) {
      req.session.msgFlash = {
        type: "error",
        message: "Identifiants invalide"
      }
      res.redirect('/', )
    }
  }
}

controller.inscription = async (req, res) => {
  try {
    res.render("inscription", {
      title: " inscription"
    })
  } catch (error) {
    res.status(400).json({
      result: "error"
    })
  }
}

controller.ajouter = async (req, res) => {
  var organismes = await Organismes.find({})

  res.render('./ajouter.ejs', {
    title: "ajouter",
    organisme : organismes
  })
}

controller.ajouterFormation = async (req, res) => {
  
  var organismes = await Organismes.find({})
  var formation = await Formations.findOne({ nom: req.body.formation})
  if(formation){
    res.render('./ajouter.ejs', {
      title: "ajouter formation",
      type: 'error',
      message : "La formation existe déjà !",
      organisme : organismes
    })
  }else{

    // On définie l'url
    var options = {
      url: 'https://spreadsheets.google.com/feeds/cells/' + req.body.id + '/1/public/full?alt=json'
    }

    // on utilise request pour récupérer les informations en utilisant l'options configuré au dessus
    request(options, callback)

    // fonction callback qui va console log le json si la connection est réussi, sinon error
    function callback(error, response, body){
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)
        body = body.feed.entry
        const monObjet = {}
        const date = { lundi: JSON.stringify(body[0].content.$t), 
                      mardi: JSON.stringify(body[1].content.$t),
                      mercredi: JSON.stringify(body[2].content.$t), 
                      jeudi: JSON.stringify(body[3].content.$t),
                      vendredi: JSON.stringify(body[4].content.$t),
                    }
        const apprenants = {}
        var nb = 0
        body.forEach(element => {
          if (element.gs$cell.col == "1") {
            apprenants[nb] = 
            { 
              nom: JSON.stringify(element.content.$t),
              "lundi matin": false,
              "lundi aprem": false,
              "mardi matin": false,
              "mardi aprem": false,
              "mercredi matin": false,
              "mercredi aprem": false,
              "jeudi matin": false,
              "jeudi aprem": false,
              "vendredi matin": false,
              "vendredi aprem": false        
            }
            nb++
          }
        })

        const formateur = {}
        var nb1 = 0
        body.forEach(element => {
          if (element.gs$cell.row == "20" && (element.gs$cell.col == "2" || element.gs$cell.col == "3" || element.gs$cell.col == "4" || element.gs$cell.col == "5" || element.gs$cell.col == "6")  ) {
            formateur[nb1] = JSON.stringify(element.content.$t)
            nb1++
          }
        })
        Object.assign(monObjet, {date});
        Object.assign(monObjet, {apprenants});
        Object.assign(monObjet, {formateur});


        Formations.create({nom: req.body.formation, sheet: req.body.id, contenu: monObjet})

      } else {
        console.log(error)
      }
    }

    res.render('./ajouter.ejs', {
      title: "ajouter formation",
      type: 'success',
      message : "La formation à bien été ajoutée",
      organisme : organismes
    })
  }
}

controller.synchro = async (req, res) => {
  var organismes = await Organismes.find({})
  var formations = await Formations.find({})

  var formation = await Formations.findOne({ nom: req.body.formation})

  if(formation){
    // On définie l'url
    var options = {
      url: 'https://spreadsheets.google.com/feeds/cells/' + req.body.id + '/1/public/full?alt=json'
    }

    // on utilise request pour récupérer les informations en utilisant l'options configuré au dessus
    request(options, callback)

    // fonction callback qui va console log le json si la connection est réussi, sinon error
    async function callback(error, response, body){
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)
        body = body.feed.entry
        const monObjet = {}
        const date = { lundi: JSON.stringify(body[0].content.$t), 
                      mardi: JSON.stringify(body[1].content.$t),
                      mercredi: JSON.stringify(body[2].content.$t), 
                      jeudi: JSON.stringify(body[3].content.$t),
                      vendredi: JSON.stringify(body[4].content.$t),
                    }
        const apprenants = {}
        var nb = 0
        body.forEach(element => {
          if (element.gs$cell.col == "1") {
            apprenants[nb] = 
            { 
              nom: JSON.stringify(element.content.$t),
              "lundi matin": false,
              "lundi aprem": false,
              "mardi matin": false,
              "mardi aprem": false,
              "mercredi matin": false,
              "mercredi aprem": false,
              "jeudi matin": false,
              "jeudi aprem": false,
              "vendredi matin": false,
              "vendredi aprem": false        
            }
            nb++
          }
        })

        const formateur = {}
        var nb1 = 0
        body.forEach(element => {
          if (element.gs$cell.row == "20" && (element.gs$cell.col == "2" || element.gs$cell.col == "3" || element.gs$cell.col == "4" || element.gs$cell.col == "5" || element.gs$cell.col == "6")  ) {
            formateur[nb1] = JSON.stringify(element.content.$t)
            nb1++
          }
        })
        Object.assign(monObjet, {date});
        Object.assign(monObjet, {apprenants});
        Object.assign(monObjet, {formateur});


        await Formations.updateOne({nom: req.body.formation},{ sheet: req.body.id, contenu: monObjet})

      } else {
        console.log(error)
      }
    }

  }

  res.render('./index.ejs', {
    title: "ajouter",
    organisme : organismes,
    formation : formations
  })
}

controller.signer = async (req, res) => {
  var formations = await Formations.find({})
  monObject = formations[0].contenu.apprenants;
  console.log(Object.values(monObject).find(apprenant => apprenant.nom === '"LEMOINE Thomas"'))

  posApprenant = getKeyByValue(formations[0].contenu.apprenants, Object.values(monObject).find(apprenant => apprenant.nom === '"LEMOINE Thomas"'))
  console.log(posApprenant)
  //console.log(formations[0].contenu.apprenants);

  //formations[0].contenu.apprenants[posApprenant].lundiAprem = 
  function getKeyByValue(object, value) { 
    return Object.keys(object).find(key =>  
            object[key] === value); 
} 
}

module.exports = controller;