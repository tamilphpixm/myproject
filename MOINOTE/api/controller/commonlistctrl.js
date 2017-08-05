var payloadCheck  = require('payload-validator');
var utilCom       = require('../util/commonfunction');
var payLoad       = require('../util/payload');
var errRes        = require('../util/errorresponse');
var cons          = require('../config/constant');
var optModel      = require('../model/modeloperation');
var succRes       = require('../util/successresponse');
var msg           = require('../config/message');
var event         = require('./eventctrl');
var record        = require('./recordctrl');
var moi           = require('./moisettingctrl');
var moment        = require('moment');
var Moment        = require('moment-timezone');
 

/*
 Function Name : getDistrictList
 Description : Fetch All Districts From DB.
 Params : req , res
 Created on :10-07-2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getDistrictList = function (req, res) {

  var start = utilCom.getProcessingTime();
  logger.info('METHOD : GET DISTRICT LIST');

  var districtSql = "SELECT DISTRICT_NAME as districtName, DISTRICT_ID as districtId FROM "+cons.DISTRICT_TBL+" WHERE ACTIVE = '1' ORDER BY DISTRICT_NAME ASC";

  var insUser = optModel.selectRecord(districtSql).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) { 
        var disSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.DISTRICT_LIST_SUCC, responseData);
        logger.info(disSucc);
        res.send(disSucc);  
      } else {
        var disErrMsg = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.DISTRICT_NOT_FOUND, 'No message given');
        logger.info(disErrMsg);
        res.send(disErrMsg);
      }  
    }
  }).error(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);      
  }).catch(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }); 
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : district duration : ' + end + ' ms');
};

/*
 Function Name : getEventCategoryList
 Description : Fetch All Event Categories From DB.
 Params : req , res
 Created on :10-07-2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getEventCategoryList = function (req, res) {

  var start = utilCom.getProcessingTime();
  logger.info('METHOD : GET EVENT CATEGORY LIST');

  var eventCatSql = "SELECT EVENT_CAT_NAME as eventName, EVENT_CAT_ID as eventId FROM "+cons.EVENT_CAT_TBL+" WHERE ACTIVE = '1'";

  var insUser = optModel.selectRecord(eventCatSql).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) { 
        var envtSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_CAT_SUCC, responseData);
        logger.info(envtSucc);
        res.send(envtSucc);  
      } else {
        var evntErrMsg = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.EVENT_CAT_NOT_FOUND,'No message given');
        logger.info(evntErrMsg);
        res.send(evntErrMsg);
      }  
    }
  }).error(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);      
  }).catch(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }); 
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : eventcategory duration : ' + end + ' ms');
};

/*
 Function Name : getLanguageList
 Description : Fetch All Languages From DB.
 Params : req , res
 Created on :10-07-2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getLanguageList = function (req, res) {

  var start = utilCom.getProcessingTime();
  logger.info('METHOD : GET LANGUAGE LIST');

  var langSql = "SELECT LANGUAGE_NAME as languageName, LANG_ID as languageId FROM "+cons.LANG_TBL+" WHERE ACTIVE = '1'";

  var insUser = optModel.selectRecord(langSql).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) { 
        var langSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.LANG_SUCC, responseData);
        logger.info(langSucc);
        res.send(langSucc);  
      } else {
        var langErrMsg = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.LANG_NOT_FOUND,'no message given');
        logger.info(langErrMsg);
        res.send(langErrMsg);
      }  
    }
  }).error(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);      
  }).catch(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }); 
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : language duration : ' + end + ' ms');
};

/*
 Function Name : getAllUserDetails
 Description : Fetch All Details for the user From DB.
 Params : req , res
 Created on :21-07-2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getAllUserDetails = function (req, res) {

  var start = utilCom.getProcessingTime();
  logger.info('METHOD : GET ALL USER DETAILS');

  var type = req.query.type;
  var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
        if (type == 'event') {
          var userOwnData = event.ownEvent(req,res).then(function (ownUserEvent) {
            var userGuestData = event.guestEvent(req,res).then(function (userGuestEvent) {
              if (ownUserEvent.length == 0 && userGuestEvent.length == 0) {
                var eventListErrMsg = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.EVENT_EMPTY, msg.EVENT_EMPTY_TAM);
                logger.info(eventListErrMsg);
                res.send(eventListErrMsg);  
              } else {
                var userResponse = succRes.getSuccessResponseCommonEvent(cons.API_SUCCESS_CODE, msg.EVENT_LIST_SUCC, ownUserEvent, userGuestEvent);
                logger.info(userResponse);
                res.send(userResponse);      
              }            
            }).error(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.error(userErrResponse);
              res.send(userErrResponse);      
            }).catch(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.error(userErrResponse);
              res.send(userErrResponse);
            });          
          }).error(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);      
          }).catch(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          });
          
        } else if (type == 'record') {
          var userRecData = record.getRecord(req,res).then(function (userRecord) {
            if (userRecord.length == 0) {
              var eventListErrMsg = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.REC_NOT_FND,msg.REC_NOT_FND_TAM);
              logger.info(eventListErrMsg);
              res.send(eventListErrMsg);  
            } else {
              var userResponse = succRes.getSuccessResponseCommonRecord(cons.API_SUCCESS_CODE, msg.REC_LIST_SUCC, userRecord);
              logger.info(userResponse);
              res.send(userResponse);   
            }
        
          }).error(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);      
          }).catch(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          });
        } else if (type == 'moi') {
          var userMoiData = moi.getMoi(req,res).then(function (userMoi) {
            if (userMoi.length == 0 ) { 
              var eventListErrMsg = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.MOI_NOT_FND, 'No message given');
              logger.info(eventListErrMsg);
              res.send(eventListErrMsg); 
            } else {
              var userResponse = succRes.getSuccessResponseCommonRecord(cons.API_SUCCESS_CODE, msg.MOI_LIST_SUCC, userMoi);
              logger.info(userResponse);
              res.send(userResponse);
            }  
            
          }).error(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);      
          }).catch(function (error) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          });
        } else {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_QUERY,msg.VAL_MSG_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        }
      } else {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID, msg.INVALID_USER_ID_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } 
    }
  }).error(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);      
  }).catch(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  });
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : get all user details duration : ' + end + ' ms');
};

/*
 Function Name : getUserEventList
 Description : Fetch Event Details for the user From DB.
 Params : req , res
 Created on :25-07-2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.getUserEventList = function (req, res) {

  var start = utilCom.getProcessingTime();
  logger.info('METHOD : getUserEventList');

  var chkUserSql = "SELECT count(USER_ID) as userId FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];

  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
        if (responseData[0].userId == 0) {
          var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID, msg.INVALID_USER_ID_TAM);
          logger.info(invalidUsr);              
          res.send(invalidUsr);    
        } else {
            var eventListSql = "SELECT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId,";
                eventListSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName";
                eventListSql+= " FROM "+cons.EVENT_TBL+" evnt  WHERE  evnt.USER_ID = ?";
            var userId = [req.params.userId];
            var insUser = optModel.selectRecord(eventListSql, userId).then(function (responseData) {
              if (responseData == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_INTERNAL_ERROR, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                  if (responseData.length > 0) { 
                    var eventListSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_LIST_SUCC, responseData);
                    logger.info(eventListSucc);
                    res.send(eventListSucc);  
                  } else {
                    var eventListErrMsg = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.EVENT_EMPTY, msg.EVENT_EMPTY_TAM);
                    logger.info(eventListErrMsg);
                    res.send(eventListErrMsg);
                  }  
              }  
            }).error(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);      
          }).catch(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);
          });    
        }
    }  
  }).error(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);      
  }).catch(function (error) {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  });  
};