var Promise   = require('bluebird');
var cons   = require('../config/constant');

/*
 Function Name : 
 Description : 
 Params : 
 Created on : 
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.insertRecord = function(tableName, insData) {

 return new Promise(function (resolve, reject) {
    var sendData;
    var insUser = "INSERT INTO "+ tableName  + " set ?";
    var insSql = {sql:insUser,timeout :cons.DB_TIMEOUT};
    connection.query(insSql, insData, function (err, resData) {
        if (!err) {
            logger.info(tableName, insData);
            sendData = resData;
         } else {
            logger.info(tableName, insData);
            logger.error(err);
            console.log(err)
            sendData = 'INT_ERROR';
         } 
        return resolve(sendData); 
    }); 
  });

};

/*
 Function Name : 
 Description : 
 Params : req, res
 Created on : 
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.selectRecord = function(selQuery, checkValue) {

  return new Promise(function (resolve, reject) {
    
    var sendData;
    var selUser = selQuery;
    var selectSql = {sql:selUser,timeout :cons.DB_TIMEOUT};
    connection.query(selectSql, checkValue, function (err, resData) {
        if (!err) {
            //console.log(selQuery)
            logger.info(selQuery, checkValue);
            sendData = resData;
         } else {
            logger.info(selQuery, checkValue);
            if (err == 'ER_DUP_ENTRY') {
              logger.info(selQuery, checkValue);
              console.log('dd',err)
              logger.error(err);
              sendData = 'ER_DUP_ENTRY';
            } else {
              logger.info(selQuery, checkValue);
              console.log('dd',err)
              logger.error(err);
              sendData = 'INT_ERROR';
            }
         } 
        return resolve(sendData); 
    }); 
  });
};

/*
 Function Name : 
 Description : 
 Params : req, res
 Created on : 
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.updateRecord = function(selQuery, upData, checkValue ) {

  return new Promise(function (resolve, reject) {
    
    var sendData;
    var selUser = selQuery;
    var selectSql = {sql:selUser,timeout :cons.DB_TIMEOUT};
    connection.query(selectSql, [upData, checkValue], function (err, resData) {
        if (!err) {
            logger.info(selQuery, checkValue);
            sendData = resData;
         } else {
             logger.info(selQuery, checkValue);
             logger.error(err);
            sendData = 'INT_ERROR';
         } 
        return resolve(sendData); 
    }); 

  });

};

/*
 Function Name : 
 Description : 
 Params : req, res
 Created on : 
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.deleteRecord = function(selQuery, checkValue ) {

  return new Promise(function (resolve, reject) {
    
    var sendData;
    var selUser = selQuery;
    var selectSql = {sql:selUser,timeout :cons.DB_TIMEOUT};
    connection.query(selectSql, checkValue, function (err, resData) {
        if (!err) {
            logger.info(selQuery, checkValue);
            sendData = resData;
         } else {
             logger.info(selQuery, checkValue);
             logger.error(err);
            sendData = 'INT_ERROR';
         } 
        return resolve(sendData); 
    }); 

  });

};

