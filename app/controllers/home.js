var express = require('express'),
  router = express.Router();

var app = express();

module.exports = function (app) {
  app.use('/', router);
};
//Rutas
router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'Simple CHAT',
    });
});