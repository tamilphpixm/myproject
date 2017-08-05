var payloadCheck = require('payload-validator');
var utilCom = require('../util/commonfunction');
var payLoad = require('../util/payload');
var errRes  = require('../util/errorresponse');
var cons      = require('../config/constant');
var optModel  = require('../model/modeloperation');
var succRes   = require('../util/successresponse');
var msg       = require('../config/message');
var validator = require('validator');
var moment    = require('moment');
var Moment    = require('moment-timezone');
let date      = require('date-and-time');


/*
 Function Name : moiNoteReport
 Description : To allow user to generate reports
 Params : req, res
 Created on : 24-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.moiNoteReport = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: moiNoteReport');    
  var reportType = req.query.rptType;
  if (reportType == 'event' || reportType == 'eventmoi' ) {
    var checkUserSql = "SELECT count(USER_ID) as userId FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
    var userId = [req.params.userId];
    var insUser = optModel.selectRecord(checkUserSql, userId).then(function (responseData) {
      if (responseData == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {       
        //Check invalid user id
        if (responseData[0].userId == 0) {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          var reportSql = '';
          var usrParams = '';
          if(reportType == 'event') {
            reportSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
            reportSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            reportSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
            reportSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            reportSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            reportSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
            reportSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
            reportSql+= "FROM "+cons.EVENT_TBL+" evnt ";
            reportSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
            reportSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            reportSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID ";
            reportSql+= "WHERE evnt.USER_ID = ? ORDER BY evnt.EVENT_DESC";
            usrParams = [req.params.userId];   
          } else if(reportType == 'eventmoi') {
            reportSql = "SELECT umn.MOBILE_NUMBER as mobileNumber,umn.GUEST_NAME as guestName,umn.MOI_TYPE as moiType,";
            reportSql+= "IF(umn.MOI_TYPE='0','Cash','Gift') as moiTYpeValue,umn.REMARKS as remarks FROM user_moinote umn WHERE umn.EVENT_ID=?";
            usrParams = [req.params.eventId]; 
          }      
          var insUserData = optModel.selectRecord(reportSql, usrParams).then(function (responseData) {
            if (responseData == 'INT_ERROR') {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);
            } else {
              if (responseData.length > 0 ) {
                var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_LIST_SUCC,responseData);
                logger.info(userResponse);
                res.send(userResponse);
              } else {
                var userErrResponse = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.EVENT_EMPTY, msg.EVENT_EMPTY_TAM);
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
  } else {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_QUERY, msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }  
};
