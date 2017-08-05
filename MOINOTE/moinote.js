//Dependenices
var express = require('express');
var bodyParser = require('body-parser');

//Database connection
var env = process.env.NODE_ENV || 'dev';
var connection = require('./api/config/dbconfig')[env];
var utilCom    = require('./api/util/commonfunction');

//Routing files
var apiRoutes = require('./api/route/apiroute');
var app = express();

//Logger file
logger = utilCom.getLogger('moinote');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Routes
app.use(apiRoutes);

// Binding express app to port 8181
app.listen(8181, function(){
  logger.info('MoiNote server running @ http://localhost:8181');
  console.log('MoiNote server running @ http://localhost:8181');
});

module.exports = app;