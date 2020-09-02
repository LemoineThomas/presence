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
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].lundiMatin + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].lundiAprem + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].mardiMatin + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].mardiAprem + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].mercrediMatin + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].mercrediAprem + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].jeudiMatin + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].jeudiAprem + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].vendrediMatin + '" height="50px" width="100px"></img> </td>'
        htm +=       '<td style="border: 1px solid black;"><img src="' + Object.values(formation.contenu.apprenants)[index].vendrediAprem + '" height="50px" width="100px"></img> </td>'
        
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
              lundiMatin: "",
              lundiAprem: "",
              mardiMatin: "",
              mardiAprem: "",
              mercrediMatin: "",
              mercrediAprem: "",
              jeudiMatin: "",
              jeudiAprem: "",
              vendrediMatin: "",
              vendrediAprem: ""         
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
              lundiMatin: "",
              lundiAprem: "",
              mardiMatin: "",
              mardiAprem: "",
              mercrediMatin: "",
              mercrediAprem: "",
              jeudiMatin: "",
              jeudiAprem: "",
              vendrediMatin: "",
              vendrediAprem: ""        
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
  console.log(req.body.signature)
  console.log(req.body.jour)
  //formations[0].contenu.apprenants[posApprenant].lundiAprem = req.body.signature
  switch (req.body.jour) {
    case 'lundiM':
        formations[0].contenu.apprenants[posApprenant].lundiMatin = req.body.signature
        break;
    case 'lundiA':
        formations[0].contenu.apprenants[posApprenant].lundiAprem = req.body.signature
        break;
    case 'mardiM':
        formations[0].contenu.apprenants[posApprenant].mardiMatin = req.body.signature
        break;
    case 'mardiA':
        formations[0].contenu.apprenants[posApprenant].mardiAprem = req.body.signature
        break;
    case 'mercrediM':
        formations[0].contenu.apprenants[posApprenant].mercrediMatin = req.body.signature
      break;
    case 'mercrediA':
        formations[0].contenu.apprenants[posApprenant].mercrediAprem = req.body.signature
      break;
    case 'jeudiM':
        formations[0].contenu.apprenants[posApprenant].jeudiMatin = req.body.signature
        break;
    case 'jeudiA':
        formations[0].contenu.apprenants[posApprenant].jeudiAprem = req.body.signature
        break;
    case 'vendrediM':
        formations[0].contenu.apprenants[posApprenant].vendrediMatin = req.body.signature
        break;
    case 'vendrediA':
        formations[0].contenu.apprenants[posApprenant].vendrediAprem = req.body.signature
        break;
    default:
      console.log(`Sorry, we are out of ${req.body.jour}.`);
  }
  console.log(formations[0].contenu.apprenants[posApprenant])

  await Formations.updateOne({nom: formations[0].nom},{ contenu: formations[0].contenu})
  function getKeyByValue(object, value) { 
    return Object.keys(object).find(key =>  
            object[key] === value); 
  } 
}


controller.createLink = async (req, res) => {
  var formations = await Formations.find({})
  res.render('./createLink.ejs', {
    title: "Create Link",
    formations: formations
  })
}

controller.createLinkApprenant = async (req, res) => {
  var formations = await Formations.find({})
  var apprenant = req.body.apprenants.replace(' ', '-')
  var jour = req.body.jours.replace(' ', '-')
  console.log(req.body)
  link = "http://" + "localhost:3000/" + "signature" + "?apprenant=" + apprenant + "&jour=" + jour
  var posApprenant = findWithAttr(Object.values(formations[0].contenu.apprenants), 'nom', '"LEMOINE Thomas"');
  var posJour = findWithAttr(Object.values(formations[0].contenu.apprenants[posApprenant].liens), 'nom', 'lundiAprem');
  formations[0].contenu.apprenants[posApprenant].liens[posJour].lien = link
  formations[0].contenu.apprenants[posApprenant].liens[posJour].created = Date.now()
  await Formations.updateOne({nom: formations[0].nom},{ contenu: formations[0].contenu})
  res.render('./createLink.ejs', {
    title: "Create Link",
    formations: formations,
    link: link
  })

  function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
  }
}

controller.signature = async (req, res) => {
  var formations = await Formations.find({})
  res.render('./signature.ejs', {
    title: "Signature",
    formations: formations
  })
}

module.exports = controller;