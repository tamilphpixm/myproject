var payloadCheck = require('payload-validator');
var utilCom = require('../util/commonfunction');
var payLoad = require('../util/payload');
var errRes = require('../util/errorresponse');
var cons   = require('../config/constant');
var optModel = require('../model/modeloperation');
var succRes = require('../util/successresponse');
var msg = require('../config/message');
var validator = require('validator');
var moment  = require('moment');
var Moment  = require('moment-timezone');
var RandExp = require('randexp');
var date = require('date-and-time');
/*
 Function Name : createEvent
 Description : create event
 Params : req, res
 Created on : 11-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.createEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: createEvent');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.event, payLoad.eventMand, true);

  if (payLoadVal.success) {

    var eventFromDate = moment(req.body.eventFrmDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();
    var eventToDate   = moment(req.body.eventToDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();

    var frmDate = req.body.eventFrmDate.split(' ');
    frmDate     = frmDate[0];
    var frmYear = frmDate.split('-');
    frmYear     = frmYear[0];

    var toDate = req.body.eventToDate.split(' ');
    toDate     = toDate[0];
    var toYear = toDate.split('-');
    toYear     = toYear[0];

    let now = new Date();
    let seventhday = date.addMonths(now, 6);
    let formatedDate = date.format(seventhday, 'YYYY-MM-DD');
    console.log('formatedDate,frmYear,toYear',formatedDate,frmYear,toYear);
    //Check date format valid or not
    if (eventFromDate == false || eventToDate == false || frmYear < 1990 || toYear < 1990 || frmDate > formatedDate || toDate > formatedDate) {
      var data = errRes.getErrorResponse(cons.API_ERROR_CODE,  msg.INVALID_DATE, msg.INVALID_DATE_TAM);
      logger.info(data);
      res.send(data);
    } else {    
      var fromTime  = moment(req.body.eventFrmDate).format('HH:mm:ss');
      var fromDate  = moment(req.body.eventFrmDate).format('YYYY-MM-DD');
      var toTime    = moment(req.body.eventToDate).format('HH:mm:ss');
      var toDate    = moment(req.body.eventToDate).format('YYYY-MM-DD');

      if (req.body.eventToDate > req.body.eventFrmDate) {
       //check valid user or not
       var chckUserSql = "SELECT count(*) as rowCnt FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
       var userId  = [req.body.userId];
       var insUser = optModel.selectRecord(chckUserSql, userId).then(function (responseData) { 
        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
            if (responseData[0].rowCnt == 0) {
              var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
              logger.info(invalidUsr);              
              res.send(invalidUsr);    
            } else {
              //check event duplication
              var  chckEvenSql="SELECT count(*) as rowCnt FROM "+cons.EVENT_TBL+" WHERE USER_ID = ?";
                  chckEvenSql+=" AND EVENT_CAT_ID = ? AND EVENT_DESC = ? AND EVENT_FRM_DATE = ?";
                  chckEvenSql+=" AND EVENT_VENUE = ? AND EVENT_TO_DATE = ? ";
              var  checkValueEvent  = [req.body.userId,req.body.eventCatId,req.body.eventDesc,fromDate,req.body.eventVenue,toDate];
              var checkEvent = optModel.selectRecord(chckEvenSql, checkValueEvent).then(function (eventCheck) { 
                if (eventCheck == 'INT_ERROR') {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                } else {
                  if (eventCheck[0].rowCnt > 0) {
                    var eventDuplicateMsg = msg.EVENT_DUP_1 + ' ' + req.body.eventDesc + ' ' + msg.EVENT_DUP_2;
                    //var eventDuplicateMsgTam = msg.EVENT_DUP_1_TAM + ' ' + req.body.eventDesc + ' ' + msg.EVENT_DUP_2_TAM;
                    var eventDuplicateMsgTam = msg.EVENT_DUP_1_TAM + msg.EVENT_DUP_2_TAM;
                    var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE,eventDuplicateMsg,eventDuplicateMsgTam);
                    logger.info(invalidUsr);              
                    res.send(invalidUsr);    
                  } else {
                    
                    var eventCode = new RandExp('[A-Z]{2}[0-9]{2}[a-z]{2}').gen();
     
                    var eventData = {
                      EVENT_CAT_ID        : req.body.eventCatId,
                      USER_ID             : req.body.userId,
                      EVENT_CODE          : eventCode,
                      EVENT_DESC          : req.body.eventDesc,
                      HOST_NAME           : req.body.hostName,
                      EVENT_FRM_DATE      : fromDate,
                      EVENT_TO_DATE       : toDate,
                      EVENT_FRM_TIME      : fromTime,
                      EVENT_TO_TIME       : toTime,
                      EVENT_VENUE         : req.body.eventVenue,
                      EVENT_LOCATION      : req.body.eventLocation,
                      TEMPLATE_TYPE       : req.body.templateType,
                      EVENT_ADDRESS       : req.body.eventVenueAddr,
                      DISTRICT_ID         : req.body.districtId
                    };
                    var checkEvent = optModel.insertRecord(cons.EVENT_TBL, eventData).then(function (eventInsert) { 
                      if (eventInsert == 'INT_ERROR') {
                        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                        logger.error('Insert Event');
                        res.send(userErrResponse);
                      } else {
                        req.body["eventId"] = eventInsert.insertId;
                        req.body["eventCode"] = eventCode;
                        var eventAddSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_ADD_SUCC, req.body);
                        logger.info(eventAddSucc);
                        res.send(eventAddSucc);
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
                  } //end check event duplication
                } //end check event internal error                    
              }).error(function (error) {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);                  
                res.send(userErrResponse);      
              }).catch(function (error) {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);                   
                res.send(userErrResponse);
              }); 
            } //end check valid user 
          }// end count int error         
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
        var data = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.FRM_TO_TIME,msg.FRM_TO_TIME_TAM);
        logger.info(data);
        res.send(data);
      } 
    } //end check date format
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var eventErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(eventErrResponse);
    res.send(eventErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : create event duration : ' + end + ' ms');
};

/*
 Function Name : getOwnEvent
 Description : To get User Events From DB
 Params : req, res
 Created on : 12-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.getOwnEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: GET OWN EVENT');
    
  var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {

    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
        
        var getUserEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
            getUserEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            getUserEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
            getUserEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            getUserEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            getUserEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
            getUserEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
            getUserEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
            getUserEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            getUserEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
            getUserEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
            getUserEventSql+= "((evnt.EVENT_FRM_DATE = ? AND (evnt.EVENT_FRM_TIME = ? OR evnt.EVENT_FRM_TIME < ?)) OR evnt.EVENT_FRM_DATE < ?) AND ((evnt.EVENT_TO_DATE > ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
            getUserEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
        var userId = [req.params.userId];
        var mysqlTime = moment(Date.now()).format('HH:mm:ss');
        mysqlTime = Moment().tz('Asia/Kolkata').format('HH:mm:ss');
        var mysqlDate = moment(Date.now()).format('YYYY-MM-DD');
        mysqlDate = Moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
        var insUserData = optModel.selectRecord(getUserEventSql,[userId,mysqlDate,mysqlTime,mysqlTime,mysqlDate,mysqlDate,mysqlDate,mysqlTime]).then(function (ongoingEvents) {

          if (ongoingEvents == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var getUserUpEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
                getUserUpEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                getUserUpEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                getUserUpEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                getUserUpEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                getUserUpEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
                getUserUpEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
                getUserUpEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
                getUserUpEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                getUserUpEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
                getUserUpEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
                getUserUpEventSql+= "(evnt.EVENT_FRM_DATE > ? OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME > ?)) AND ";
                getUserUpEventSql+= "(evnt.EVENT_TO_DATE > ? OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
                getUserUpEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
            var insUserData = optModel.selectRecord(getUserUpEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (upComingEvents) {

              if (upComingEvents == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var getUserPastEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
                    getUserPastEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                    getUserPastEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                    getUserPastEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                    getUserPastEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                    getUserPastEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
                    getUserPastEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
                    getUserPastEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
                    getUserPastEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                    getUserPastEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
                    getUserPastEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
                    getUserPastEventSql+= "((evnt.EVENT_FRM_DATE < ?) OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME < ?)) AND ((evnt.EVENT_TO_DATE < ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME < ?))";
                    //getUserPastEventSql+= "(evnt.EVENT_TO_TIME < ? AND evnt.EVENT_TO_DATE = ?)";
                    getUserPastEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
                var insUserData = optModel.selectRecord(getUserPastEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (pastEvents) {

                  if (pastEvents == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    if (ongoingEvents.length > 0 || upComingEvents.length > 0 || pastEvents.length > 0) {
                      var userResponse = succRes.getSuccessResponseEvents(cons.API_SUCCESS_CODE, msg.EVENT_LIST_SUCC, ongoingEvents,upComingEvents,pastEvents);
                      logger.info(userResponse);
                      res.send(userResponse);
                    } else {
                      var userErrResponse = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.EVENT_EMPTY,msg.EVENT_EMPTY_TAM);
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
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
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
  logger.info('Process : get own event duration : ' + end + ' ms');
};

/*
 Function Name : getGuestEvent
 Description : To get Guest Events From DB
 Params : req, res
 Created on : 19-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.getGuestEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: GET GUEST EVENT');    
  var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {
  if (responseData == 'INT_ERROR') {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  } else {
      if (responseData.length > 0) {
        var getUserEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
            getUserEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            getUserEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ', evnt.EVENT_TO_TIME) as eventToDate, ";
            getUserEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            getUserEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            getUserEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
            getUserEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
            getUserEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
            getUserEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            getUserEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
            getUserEventSql+= "((evnt.EVENT_FRM_DATE = ? AND (evnt.EVENT_FRM_TIME = ? OR evnt.EVENT_FRM_TIME < ?)) OR evnt.EVENT_FRM_DATE < ?) AND ((evnt.EVENT_TO_DATE > ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
            getUserEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
        var userId = [req.params.userId];
        var mysqlTime = moment(Date.now()).format('HH:mm:ss');
        mysqlTime = Moment().tz('Asia/Kolkata').format('HH:mm:ss');
        var mysqlDate = moment(Date.now()).format('YYYY-MM-DD');
        mysqlDate = Moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
        var insUserData = optModel.selectRecord(getUserEventSql,[userId,mysqlDate,mysqlTime,mysqlTime,mysqlDate,mysqlDate,mysqlDate,mysqlTime]).then(function (ongoingEvents) {
          if (ongoingEvents == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var getUserUpEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
                getUserUpEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                getUserUpEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                getUserUpEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                getUserUpEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                getUserUpEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
                getUserUpEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
                getUserUpEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
                getUserUpEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                getUserUpEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
                getUserUpEventSql+= "(evnt.EVENT_FRM_DATE > ? OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME > ?)) AND";
                getUserUpEventSql+= " (evnt.EVENT_TO_DATE > ? OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
                getUserUpEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
            var insUserData = optModel.selectRecord(getUserUpEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (upComingEvents) {

              if (upComingEvents == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var getUserPastEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
                    getUserPastEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                    getUserPastEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                    getUserPastEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                    getUserPastEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                    getUserPastEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
                    getUserPastEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
                    getUserPastEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
                    getUserPastEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                    getUserPastEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
                    getUserPastEventSql+= "((evnt.EVENT_FRM_DATE < ?) OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME < ?)) AND ((evnt.EVENT_TO_DATE < ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME < ?))";
                    //getUserPastEventSql+= "evnt.EVENT_FRM_TIME < ? AND evnt.EVENT_TO_TIME < ?";
                    getUserPastEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
                var insUserData = optModel.selectRecord(getUserPastEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (pastEvents) {

                  if (pastEvents == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    if (ongoingEvents.length > 0 || upComingEvents.length > 0 || pastEvents.length > 0) {
                      var userResponse = succRes.getSuccessResponseEvents(cons.API_SUCCESS_CODE, msg.EVENT_LIST_SUCC, ongoingEvents,upComingEvents,pastEvents);
                      logger.info(userResponse);
                      res.send(userResponse);
                    } else {
                      var userErrResponse = errRes.getErrorResponse(cons.API_REC_NOT_FOUND_CODE, msg.EVENT_EMPTY,msg.EVENT_EMPTY_TAM);
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
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
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
  logger.info('Process : get guest event duration : ' + end + ' ms');
};

/*
 Function Name : getGuestEventDetails
 Description : To get User Events From DB
 Params : req, res
 Created on : 19-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.getGuestEventDetails = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: GET GUEST EVENT DETAILS');

  var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {

    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
        var getUserEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, ";
            getUserEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            getUserEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
            getUserEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            getUserEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            getUserEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
            getUserEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
            getUserEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            getUserEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.EVENT_CODE = ?";
        
        var insUserData = optModel.selectRecord(getUserEventSql,req.params.promoCode).then(function (eventDetails) {

          if (eventDetails == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            if (eventDetails.length > 0) {
              if (eventDetails[0].ownUserId == userId) {
                var userErrResponse = errRes.getErrorResponse(cons.API_VAL_ERROR, msg.EVENT_USER_ID_MISMATCH,msg.EVENT_USER_ID_MISMATCH_TAM);
                logger.info(userErrResponse);                   
                res.send(userErrResponse);
              } else {
                var checkEventSql = "SELECT COUNT(gstEvnt.GUEST_EVENT_ID) as eventCount FROM "+cons.GUEST_EVENT_TBL+" gstEvnt";
                    checkEventSql+= " WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.EVENT_ID = ? AND gstEvnt.GUEST_USER_ID = ?";
                var insUserData = optModel.selectRecord(checkEventSql,[eventDetails[0].eventId,req.params.userId]).then(function (eventDetailCnt) {
                 
                  if (eventDetails == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    if (eventDetailCnt[0].eventCount == 0) {
                      var eventData = {
                        GUEST_USER_ID     : req.params.userId,
                        EVENT_ID          : eventDetails[0].eventId,
                        CREATE_USER       : req.params.userId
                      };
                      var checkEvent = optModel.insertRecord(cons.GUEST_EVENT_TBL, eventData).then(function (eventInsert) { 
                        if (eventInsert == 'INT_ERROR') {
                          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                          logger.error('Insert Event');
                          res.send(userErrResponse);
                        } else {
                          var eventAddSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_ADD_SUCC, eventDetails);
                          logger.info(eventAddSucc);
                          res.send(eventAddSucc);
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
                      var userErrResponse = errRes.getErrorResponse(cons.API_VAL_ERROR, msg.EVENT_GUEST_DUPL,msg.EVENT_GUEST_DUPL_TAM);
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
            } else {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.EVENT_PROMO_INVALID, msg.EVENT_PROMO_INVALID_TAM);
              logger.info(userErrResponse);                  
              res.send(userErrResponse);
            }
          }
        }).error(function (error) {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR, msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);      
        }).catch(function (error) {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR, msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        });
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
  logger.info('Process : get guest event details duration : ' + end + ' ms');
};

/*
 Function Name : editEvent
 Description : To allow user to edit event
 Params : req, res
 Created on : 20-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.editEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: EDIT EVENT');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.eventEditPayload, payLoad.eventEditPayloadMand, true);

  if (payLoadVal.success) {

    var eventFromDate = moment(req.body.eventFrmDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();
    var eventToDate   = moment(req.body.eventToDate, 'YYYY-MM-DD HH:mm:ss', true).isValid();

    var frmDate = req.body.eventFrmDate.split(' ');
    frmDate = frmDate[0];
    var frmYear = frmDate.split('-');
    frmYear = frmYear[0];

    var toDate = req.body.eventToDate.split(' ');
    toDate = toDate[0];
    var toYear = toDate.split('-');
    toYear = toYear[0];

    let now = new Date();
    let seventhday = date.addMonths(now, 6);
    let formatedDate = date.format(seventhday, 'YYYY-MM-DD');
    console.log('formatedDate,frmYear,toYear',formatedDate,frmYear,toYear)
    //Check date format valid or not
    if (eventFromDate == false || eventToDate == false || frmYear < 1990 || toYear < 1990 || frmDate > formatedDate || toDate > formatedDate) {
      var data = errRes.getErrorResponse(cons.API_ERROR_CODE,  msg.INVALID_DATE);
      logger.info(data);
      res.send(data);
    } else {
      //Date&Time Format For FromTime
      var fromTime  = moment(req.body.eventFrmDate).format('HH:mm:ss');
      var fromDate = moment(req.body.eventFrmDate).format('YYYY-MM-DD');
      //Date&Time Format For ToTime
      var toTime  = moment(req.body.eventToDate).format('HH:mm:ss');
      var toDate = moment(req.body.eventToDate).format('YYYY-MM-DD');

      if (req.body.eventToDate > req.body.eventFrmDate) {
       //check valid user or not
        var chckUserSql = "SELECT COUNT(userReg.USER_ID) as userId, evnt.EVENT_ID as eventId FROM "+cons.USER_TBL+" userReg ";
            chckUserSql+= "LEFT JOIN "+cons.EVENT_TBL+" evnt ON evnt.USER_ID = userReg.USER_ID AND evnt.EVENT_ID = ? WHERE userReg.USER_ID = ? ";
       
       var insUser = optModel.selectRecord(chckUserSql, [req.body.eventId, req.body.userId]).then(function (responseData) { 
        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
            if (responseData[0].userId == 0) {
              var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
              logger.info(invalidUsr);              
              res.send(invalidUsr);    
            } else if (responseData[0].eventId != req.body.eventId) {
              var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.EVENT_ID_MISMATCH, msg.EVENT_ID_MISMATCH_TAM);
              logger.info(invalidUsr);              
              res.send(invalidUsr);
            } else {
              //check event duplication
              var chckEvenSql ="SELECT count(*) as rowCnt FROM "+cons.EVENT_TBL+" WHERE USER_ID = ?";
                  chckEvenSql+=" AND EVENT_CAT_ID = ? AND EVENT_DESC = ? AND EVENT_FRM_DATE = ?";
                  chckEvenSql+=" AND EVENT_VENUE = ? AND EVENT_TO_DATE = ? AND EVENT_ID != ?";
              var  checkValueEvent  = [req.body.userId,req.body.eventCatId,req.body.eventDesc,fromDate,req.body.eventVenue,toDate,req.body.eventId];
              var checkEvent = optModel.selectRecord(chckEvenSql, checkValueEvent).then(function (eventCheck) { 
                if (eventCheck == 'INT_ERROR') {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                } else {
                  if (eventCheck[0].rowCnt > 0) {
                    var eventDuplicateMsg = msg.EVENT_DUP_1 + ' ' + req.body.eventDesc + ' ' + msg.EVENT_DUP_2;
                    //var eventDuplicateMsgTam = msg.EVENT_DUP_1_TAM + ' ' + req.body.eventDesc + ' ' + msg.EVENT_DUP_2_TAM;
                    var eventDuplicateMsgTam = msg.EVENT_DUP_1_TAM + msg.EVENT_DUP_2_TAM;
                    var invalidUsr = errRes.getErrorResponse(cons.API_ERROR_CODE,eventDuplicateMsg,eventDuplicateMsgTam);
                    logger.info(invalidUsr);              
                    res.send(invalidUsr);    
                  } else {
                    var eventData = {
                      EVENT_CAT_ID        : req.body.eventCatId,
                      USER_ID             : req.body.userId,
                      EVENT_DESC          : req.body.eventDesc,
                      HOST_NAME           : req.body.hostName,
                      EVENT_FRM_DATE      : fromDate,
                      EVENT_TO_DATE       : toDate,
                      EVENT_FRM_TIME      : fromTime,
                      EVENT_TO_TIME       : toTime,
                      EVENT_VENUE         : req.body.eventVenue,
                      EVENT_LOCATION      : req.body.eventLocation,
                      TEMPLATE_TYPE       : req.body.templateType,
                      EVENT_ADDRESS       : req.body.eventVenueAddr,
                      DISTRICT_ID         : req.body.districtId,
                      CREATE_USER         : req.body.userId 
                    };
                    var updateSql = "UPDATE "+cons.EVENT_TBL+" SET ? WHERE EVENT_ID = ?";
                    var checkEvent = optModel.updateRecord(updateSql, eventData, req.body.eventId).then(function (eventInsert) { 
                      if (eventInsert == 'INT_ERROR') {
                        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                        logger.error('Update Event');
                        res.send(userErrResponse);
                      } else {                        
                        var eventAddSucc = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.EVENT_UPT_SUCC, req.body);
                        logger.info(eventAddSucc);
                        res.send(eventAddSucc);
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
                  } //end check event duplication
                } //end check event internal error                    
              }).error(function (error) {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);                  
                res.send(userErrResponse);      
              }).catch(function (error) {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);                  
                res.send(userErrResponse);
              }); 
            } //end check valid user 
          }// end count int error         
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
        var data = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.FRM_TO_TIME,msg.FRM_TO_TIME_TAM);
        logger.info(data);
        res.send(data);
      } 
    } //end check date format
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var eventErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(eventErrResponse);
    res.send(eventErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : edit event duration : ' + end + ' ms');
};

exports.ownEvent = function (req, res) {

  return new Promise(function (resolve, reject) {

    var getUserEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
        getUserEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
        getUserEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
        getUserEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
        getUserEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
        getUserEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
        getUserEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
        getUserEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
        getUserEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
        getUserEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
        getUserEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
        getUserEventSql+= "((evnt.EVENT_FRM_DATE = ? AND (evnt.EVENT_FRM_TIME = ? OR evnt.EVENT_FRM_TIME < ?)) OR evnt.EVENT_FRM_DATE < ?) AND ((evnt.EVENT_TO_DATE > ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
        getUserEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
    var userId = [req.params.userId];
    var mysqlTime = moment(Date.now()).format('HH:mm:ss');
    mysqlTime = Moment().tz('Asia/Kolkata').format('HH:mm:ss');
    var mysqlDate = moment(Date.now()).format('YYYY-MM-DD');
    mysqlDate = Moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    var insUserData = optModel.selectRecord(getUserEventSql,[userId,mysqlDate,mysqlTime,mysqlTime,mysqlDate,mysqlDate,mysqlDate,mysqlTime]).then(function (ongoingEvents) {
      if (ongoingEvents == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var getUserUpEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
            getUserUpEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            getUserUpEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
            getUserUpEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            getUserUpEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            getUserUpEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
            getUserUpEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
            getUserUpEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
            getUserUpEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            getUserUpEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
            getUserUpEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
            getUserUpEventSql+= "(evnt.EVENT_FRM_DATE > ? OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME > ?)) AND";
            getUserUpEventSql+= "(evnt.EVENT_TO_DATE > ? OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?)) ";
            getUserUpEventSql+= "ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
        var insUserData = optModel.selectRecord(getUserUpEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (upComingEvents) {

          if (upComingEvents == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var getUserPastEventSql = "SELECT DISTINCT evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as userId, ";
                getUserPastEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                getUserPastEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                getUserPastEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                getUserPastEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                getUserPastEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName, ";
                getUserPastEventSql+= "IF(moi.EVENT_ID IS NULL,0,moi.EVENT_ID) as editFlag ";
                getUserPastEventSql+= "FROM "+cons.EVENT_TBL+" evnt ";
                getUserPastEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                getUserPastEventSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID ";
                getUserPastEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE evnt.USER_ID = ? AND ";
                getUserPastEventSql+= "((evnt.EVENT_FRM_DATE < ?) OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME < ?)) AND ((evnt.EVENT_TO_DATE < ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME < ?))";
                //getUserPastEventSql+= "(evnt.EVENT_TO_TIME < ? AND evnt.EVENT_TO_DATE = ?)";
                getUserPastEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
            var insUserData = optModel.selectRecord(getUserPastEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (pastEvents) {

              if (pastEvents == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var ownEvents = {"ongoingEvents" : ongoingEvents, "upComingEvents" : upComingEvents, "pastEvents" : pastEvents};
                return resolve (ownEvents);
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
    }).error(function (error) {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);      
    }).catch(function (error) {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    });
  });
};

exports.guestEvent = function (req, res) {

  return new Promise(function (resolve, reject) {

    var getUserEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
        getUserEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
        getUserEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ', evnt.EVENT_TO_TIME) as eventToDate, ";
        getUserEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
        getUserEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
        getUserEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
        getUserEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
        getUserEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
        getUserEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
        getUserEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
        getUserEventSql+= "((evnt.EVENT_FRM_DATE = ? AND (evnt.EVENT_FRM_TIME = ? OR evnt.EVENT_FRM_TIME < ?)) OR evnt.EVENT_FRM_DATE < ?) AND ((evnt.EVENT_TO_DATE > ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?))";
        getUserEventSql+= "ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
    var userId = [req.params.userId];
    var mysqlTime = moment(Date.now()).format('HH:mm:ss');
    mysqlTime = Moment().tz('Asia/Kolkata').format('HH:mm:ss');
    var mysqlDate = moment(Date.now()).format('YYYY-MM-DD');
    mysqlDate = Moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
    var insUserData = optModel.selectRecord(getUserEventSql,[userId,mysqlDate,mysqlTime,mysqlTime,mysqlDate,mysqlDate,mysqlDate,mysqlTime]).then(function (ongoingGustEvents) {

      if (ongoingGustEvents == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var getUserUpEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
            getUserUpEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
            getUserUpEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
            getUserUpEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
            getUserUpEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
            getUserUpEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
            getUserUpEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
            getUserUpEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
            getUserUpEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
            getUserUpEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
            getUserUpEventSql+= "(evnt.EVENT_FRM_DATE > ? OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME > ?)) AND ";
            getUserUpEventSql+= "(evnt.EVENT_TO_DATE > ? OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME > ?)) ";
            getUserUpEventSql+= "ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
        var insUserData = optModel.selectRecord(getUserUpEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (upComingGustEvents) {

          if (upComingGustEvents == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var getUserPastEventSql = "SELECT DISTINCT gstEvnt.GUEST_EVENT_ID as guestEventId, evnt.EVENT_ID as eventId, evnt.EVENT_CAT_ID as eventCatId, evnt.USER_ID as ownUserId, gstEvnt.GUEST_USER_ID as guestUserId, ";
                getUserPastEventSql+= "evnt.EVENT_DESC as eventName, evnt.HOST_NAME as hostName, CONCAT(evnt.EVENT_FRM_DATE, ' ', evnt.EVENT_FRM_TIME) as eventFromDate, evnt.EVENT_CODE as eventCode, ";
                getUserPastEventSql+= "CONCAT(evnt.EVENT_TO_DATE, ' ',  evnt.EVENT_TO_TIME) as eventToDate, ";
                getUserPastEventSql+= "evnt.EVENT_VENUE as eventVenue, evnt.EVENT_LOCATION as eventLocation, evnt.DISTRICT_ID as districtId, ";
                getUserPastEventSql+= "evnt.TEMPLATE_TYPE as templateType, if(evnt.EVENT_ADDRESS IS NULL,'',evnt.EVENT_ADDRESS) as eventVenueAddr, ";
                getUserPastEventSql+= "dist.DISTRICT_NAME as districtName, evntCat.EVENT_CAT_NAME as eventCatName ";
                getUserPastEventSql+= "FROM "+cons.GUEST_EVENT_TBL+" gstEvnt ";
                getUserPastEventSql+= "JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = gstEvnt.EVENT_ID ";
                getUserPastEventSql+= "JOIN "+cons.DISTRICT_TBL+" dist ON dist.DISTRICT_ID = evnt.DISTRICT_ID ";
                getUserPastEventSql+= "JOIN "+cons.EVENT_CAT_TBL+" evntCat ON evntCat.EVENT_CAT_ID = evnt.EVENT_CAT_ID WHERE gstEvnt.ACTIVE = '1' AND gstEvnt.GUEST_USER_ID = ? AND ";
                getUserPastEventSql+= "((evnt.EVENT_FRM_DATE < ?) OR (evnt.EVENT_FRM_DATE = ? AND evnt.EVENT_FRM_TIME < ?)) AND ((evnt.EVENT_TO_DATE < ?) OR (evnt.EVENT_TO_DATE = ? AND evnt.EVENT_TO_TIME < ?))";
                //getUserPastEventSql+= "evnt.EVENT_FRM_TIME < ? AND evnt.EVENT_TO_TIME < ?";
                getUserPastEventSql+= " ORDER BY evnt.EVENT_FRM_DATE, evnt.EVENT_FRM_TIME ASC";
            var insUserData = optModel.selectRecord(getUserPastEventSql,[userId,mysqlDate,mysqlDate,mysqlTime,mysqlDate,mysqlDate,mysqlTime]).then(function (pastGustEvents) {

              if (pastGustEvents == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var guestEvents = {"ongoingGuestEvents" : ongoingGustEvents, "upComingGuestEvents" : upComingGustEvents, "pastGuestEvents" : pastGustEvents};
                return resolve (guestEvents);
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
    }).error(function (error) {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);      
    }).catch(function (error) {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    });
  });
};

/*
 Function Name : deleteEvent
 Description : To allow user to delete events
 Params : req, res
 Created on : 21-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.deleteEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: DELETE EVENT');
    
  var chckUserSql = "SELECT COUNT(userReg.USER_ID) as userId, evnt.EVENT_ID as eventId FROM "+cons.USER_TBL+" userReg ";
      chckUserSql+= "LEFT JOIN "+cons.EVENT_TBL+" evnt ON evnt.USER_ID = userReg.USER_ID AND evnt.EVENT_ID = ? WHERE userReg.USER_ID = ? ";
  var userId = req.params.userId;
  var eventId = req.params.eventId;
  var insUser = optModel.selectRecord(chckUserSql, [eventId,userId]).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData[0].userId == 0) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else if (responseData[0].eventId != req.params.eventId) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var chkMoiSql = "SELECT COUNT(USR_MOI_ID) as moi FROM "+cons.USR_MOI_TBL+" WHERE EVENT_ID = ?";
        var insUser = optModel.selectRecord(chkMoiSql,eventId).then(function (moiData) {

          if (responseData == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            if (moiData[0].moi == 0) {
              var delRecSql = "DELETE FROM "+cons.EVENT_TBL+" WHERE USER_ID = ? AND EVENT_ID = ?";
              var insUser = optModel.deleteRecord(delRecSql, [userId,eventId]).then(function (delData) {
                var delRecGstSql = "UPDATE "+cons.GUEST_EVENT_TBL+" SET ACTIVE = '0',EVENT_ID = '' WHERE EVENT_ID = ?";
                var insUser = optModel.deleteRecord(delRecGstSql, [eventId]).then(function (delData) {
                  var userResponse = errRes.getErrorResponse(cons.API_SUCCESS_CODE, msg.EVENT_DEL_SUCC, msg.EVENT_DELETE_SUCC_TAM);
                  logger.info(userResponse);
                  res.send(userResponse);
                }).error(function (error) {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);      
                }).catch(function (error) {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
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
            } else {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.EVENT_DEL_INVALID,msg.EVENT_DEL_INVALID_TAM);
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
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : delete record duration : ' + end + ' ms');
};

exports.deleteGuestEvent = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: GUEST DELETE EVENT');
    
  var chckUserSql = "SELECT COUNT(userReg.USER_ID) as userId, evnt.GUEST_EVENT_ID as eventId FROM "+cons.USER_TBL+" userReg ";
      chckUserSql+= "LEFT JOIN "+cons.GUEST_EVENT_TBL+" evnt ON evnt.GUEST_USER_ID = userReg.USER_ID AND evnt.GUEST_EVENT_ID = ? WHERE userReg.USER_ID = ? ";
  var userId = req.params.userId;
  var eventId = req.params.eventId;
  var insUser = optModel.selectRecord(chckUserSql, [eventId,userId]).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      console.log(responseData)
      if (responseData[0].userId == 0) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else if (responseData[0].eventId != req.params.eventId) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var delRecSql = "DELETE FROM "+cons.GUEST_EVENT_TBL+" WHERE GUEST_USER_ID = ? AND GUEST_EVENT_ID = ?";
        var insUser = optModel.deleteRecord(delRecSql, [userId,eventId]).then(function (delData) {
          var userResponse = errRes.getErrorResponse(cons.API_SUCCESS_CODE, msg.EVENT_DEL_SUCC, msg.EVENT_DELETE_SUCC_TAM);
          logger.info(userResponse);
          res.send(userResponse);
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
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : Guest delete event duration : ' + end + ' ms');
};