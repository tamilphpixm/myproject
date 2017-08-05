require('dotenv').load();
var utilCom = require('../util/commonfunction');
var mysql = require('mysql');
//Logger file
var logger = utilCom.getLogger('moinote');
if (process.env.MOINOTE_ENV == "dev") {
    host     = process.env.DEV_DB_HOST,
    user     = process.env.DEV_DB_USER,
    password = process.env.DEV_DB_PASSWORD,
    database = process.env.DEV_DB_DATABASE
} else if (process.env.MOINOTE_ENV == "prod") {
    host     = process.env.PROD_DB_HOST,
    user     = process.env.PROD_DB_USER,
    password = process.env.PROD_DB_PASSWORD,
    database = process.env.PROD_DB_DATABASE
} else {
    host     = process.env.LOCAL_DB_HOST,
    user     = process.env.LOCAL_DB_USER,
    password = process.env.LOCAL_DB_PASSWORD,
    database = process.env.LOCAL_DB_DATABASE
}
//Create mysql connection pool
connection = mysql.createPool({
  host     : host,
  user     : user,
  password : password,
  database : database
});
connection.getConnection(function(err) {
    if (err) {
      logger.info('MOINOTE Database Error :' + err.stack);
      return;
    }
   logger.info('MOINOTE Database Connected :' + connection.threadId);
});
