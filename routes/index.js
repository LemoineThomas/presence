var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController.js');
const app = express()
router.use(express.urlencoded({
    extended: true
  }))

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
router.get('/dashboard', indexController.index);
router.post('/generer', indexController.generer);
router.get('/', indexController.visulogin);
router.post('/login', indexController.login);
router.get('/inscription', indexController.inscription);
router.post('/addUser', indexController.addUser);
router.get('/ajouter', indexController.ajouter);
router.post('/ajouterFormation', indexController.ajouterFormation);
router.post('/synchro', indexController.synchro);

module.exports = router;
