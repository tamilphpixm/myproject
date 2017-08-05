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
let date = require('date-and-time');
var asyncLoop = require('node-async-loop');
/*
 Function Name : addRecord
 Description : To allow user to add records
 Params : req, res
 Created on : 20-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.addRecord = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: ADD RECORD');
  logger.info(req.body);

  // var payLoadVal = payloadCheck.validator(req.body, payLoad.addRecordPayload, payLoad.addRecordPayloadMand, true);

  // if (payLoadVal.success) {

  //   if (validator.isNumeric(req.body.hostNumber) && validator.isLength(req.body.eventLocation, { min : 1, max : 35 }) &&
  //       validator.isLength(req.body.hostName, { min : 1, max : 35 }) && validator.isLength(req.body.hostNumber, { min : 10, max : 10 }) && 
  //       validator.isLength(req.body.eventVenue, { min : 1, max : 60 }) && validator.isLength(req.body.eventDesc, { min : 1, max : 60 }) &&
  //       validator.isLength(req.body.remarks, { min : 1, max : 250 }) && validator.isLength(req.body.amount, { min : 1, max : 7 }) && 
  //       validator.isNumeric(req.body.amount)) {

      var chckMobNumSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
      var userId = [req.params.userId];
      var insUser = optModel.selectRecord(chckMobNumSql, userId).then(function (responseData) {

        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR, msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          if (responseData.length > 0) {
            var recordList = req.body.recList;
            asyncLoop(recordList, function (item, next) {

              var eventDate = item.eventDate;
              var year = eventDate.split('-');
              year = year[0];
              let now = new Date();
              let seventhday = date.addMonths(now, 6);
              let formatedDate = date.format(seventhday, 'YYYY-MM-DD');

              if (year > 1990 && eventDate <= formatedDate) {
                var chckDuplSql = "SELECT COUNT(*) as rowCnt FROM "+cons.USR_REC_TBL+" WHERE USER_ID = ? AND EVENT_DESC = ? AND MOBILE_NUMBER = ?";
                var chckValue = [req.params.userId,item.eventDesc,item.hostNumber];
                var insUser = optModel.selectRecord(chckDuplSql, chckValue).then(function (duplData) {

                  if (responseData == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    console.log(duplData)
                    if (duplData[0].rowCnt == 0) {
                      var insData = {
                        USER_ID        : userId,
                        MOBILE_NUMBER  : item.hostNumber,
                        HOST_NAME      : item.hostName,
                        EVENT_DESC     : item.eventDesc,
                        EVENT_DATE     : eventDate,
                        EVENT_VENUE    : item.eventVenue,
                        EVENT_LOCATION : item.eventLocation,
                        EVENT_DISTRICT : item.eventDistrict,
                        MOI_TYPE       : item.type,
                        AMOUNT         : item.amount,
                        REMARKS        : item.remarks,
                        CREATE_USER    : userId
                      };
                      var insUserData = optModel.insertRecord(cons.USR_REC_TBL,insData).then(function (loginResponseData) {
                        console.log(loginResponseData)
                        if (loginResponseData == 'INT_ERROR') {
                          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                          logger.info(userErrResponse);
                          console.log('osdij')
                          res.send(userErrResponse);
                        } else {
                          var index = recordList.indexOf(item);
                          if (index == recordList.length - 1) {
                            item["userRecId"] = loginResponseData.insertId;
                            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.REC_ADD_SUCC, req.body);
                            logger.info(userResponse);
                            res.send(userResponse);
                          } else {
                            item["userRecId"] = loginResponseData.insertId;
                            next();
                          }
                          
                        }
                      }).error(function (error) {
                        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                        logger.info(userErrResponse);
                        console.log('cvbb')
                        res.send(userErrResponse);      
                      }).catch(function (error) {
                        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                        logger.info(userErrResponse);
                        console.log('dfdf')
                        console.log(error)
                        res.send(userErrResponse);
                      });
                    } else {
                      var duplErrMsg = msg.REC_DUPL + req.body.hostName + " !";
                      var duplErrMsgTam = msg.REC_DUPL_TAM ;
                      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, duplErrMsg, duplErrMsgTam);
                      logger.info(userErrResponse);
                      res.send(userErrResponse);
                    }
                  }
                }).error(function (error) {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  console.log('dsd')
                  res.send(userErrResponse);      
                }).catch(function (error) {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  console.log('ss',error)
                  res.send(userErrResponse);
                });
                } else {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_DATE, msg.INVALID_DATE_TAM);
                  console.log('hdfhd')
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                }
            });
          } else {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } 
        }
      }).error(function (error) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        console.log('dsd')
        res.send(userErrResponse);      
      }).catch(function (error) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        console.log('ss',error)
        res.send(userErrResponse);
      });
      
  //   } else {
  //     var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG);
  //     console.log('hhd')
  //     logger.info(userErrResponse);
  //     res.send(userErrResponse);
  //   }
  // } else {
  //   var eventErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , payLoadVal.response.errorMessage);
  //   logger.info(eventErrResponse);
  //   res.send(eventErrResponse);
  // }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : add record duration : ' + end + ' ms');
};

/*
 Function Name : editRecord
 Description : To allow user to edit records
 Params : req, res
 Created on : 21-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.editRecord = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: EDIT RECORD');
  logger.info(req.body);

  var recordList = req.body.recList;
  asyncLoop(recordList, function (item, next) {
    var eventDate = item.eventDate;
    var year = eventDate.split('-');
    year = year[0];
     
    let now = new Date();
    let seventhday = date.addMonths(now, 6);
    let formatedDate = date.format(seventhday, 'YYYY-MM-DD');

    if (year > 1990 && eventDate <= formatedDate) {
      var chckMobNumSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
      var userId = [req.params.userId];
      var insUser = optModel.selectRecord(chckMobNumSql, userId).then(function (responseData) {

        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          if (responseData.length > 0) {
            var chckDuplSql = "SELECT COUNT(*) as rowCnt FROM "+cons.USR_REC_TBL+" WHERE USER_ID = ? AND EVENT_DESC = ? AND MOBILE_NUMBER = ? AND USER_REC_ID != ?";
            var chckValue = [req.params.userId,item.eventDesc,item.hostNumber,item.userRecId];
            var insUser = optModel.selectRecord(chckDuplSql, chckValue).then(function (duplData) {

              if (responseData == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                console.log(duplData)
                if (duplData[0].rowCnt == 0) {
                  var uptRec = "UPDATE "+cons.USR_REC_TBL+" set ? WHERE USER_REC_ID = ?"
                  var insData = {
                    USER_ID        : userId,
                    MOBILE_NUMBER  : item.hostNumber,
                    HOST_NAME      : item.hostName,
                    EVENT_DESC     : item.eventDesc,
                    EVENT_DATE     : eventDate,
                    EVENT_VENUE    : item.eventVenue,
                    EVENT_LOCATION : item.eventLocation,
                    EVENT_DISTRICT : item.eventDistrict,
                    MOI_TYPE       : item.type,
                    AMOUNT         : item.amount,
                    REMARKS        : item.remarks,
                    CREATE_USER    : item.userId,
                    MODIFY_USER    : item.userId
                  };
                  var insUserData = optModel.updateRecord(uptRec,insData,item.userRecId).then(function (loginResponseData) {
                    console.log(loginResponseData)
                    if (loginResponseData == 'INT_ERROR') {
                      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                      logger.info(userErrResponse);
                      console.log('osdij')
                      res.send(userErrResponse);
                    } else {
                      var index = recordList.indexOf(item);
                      if (index == recordList.length - 1) {
                        var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.REC_UPT_SUCC, req.body);
                        logger.info(userResponse);
                        res.send(userResponse);
                      } else {
                        next();
                      }
                    }
                  }).error(function (error) {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    console.log('cvbb')
                    res.send(userErrResponse);      
                  }).catch(function (error) {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    console.log('dfdf')
                    console.log(error)
                    res.send(userErrResponse);
                  });
                } else {
                  var duplErrMsg = msg.REC_DUPL + req.body.hostName + " !";
                  var duplErrMsgTam = msg.REC_DUPL_TAM ;
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, duplErrMsg, duplErrMsgTam);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                }
              }
            }).error(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              console.log('dsd')
              res.send(userErrResponse);      
            }).catch(function (error) {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              console.log('ss',error)
              res.send(userErrResponse);
            });
          } else {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.INVALID_USER_ID, msg.INVALID_USER_ID_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } 
        }
      }).error(function (error) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        console.log('dsd')
        res.send(userErrResponse);      
      }).catch(function (error) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        console.log('ss',error)
        res.send(userErrResponse);
      });
    } else {
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_DATE,msg.INVALID_DATE_TAM);
    console.log('hdfhd')
    logger.info(userErrResponse);
    res.send(userErrResponse);
    }
  });
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : edit record duration : ' + end + ' ms');
};

exports.getRecord = function (req, res) {

  return new Promise(function (resolve, reject) {

    var getUserRecSql = "SELECT userRec.USER_REC_ID as recordId, userRec.USER_ID as userId, userRec.MOBILE_NUMBER as hostNumber, userRec.HOST_NAME as hostName, userRec.EVENT_DESC as eventDesc, ";
        getUserRecSql+= "userRec.EVENT_VENUE as eventVenue, userRec.EVENT_LOCATION as eventLocation, userRec.EVENT_DISTRICT as eventDistrict, DATE_FORMAT(userRec.EVENT_DATE,'%Y-%m-%d') as eventDate, ";
        getUserRecSql+= "userRec.MOI_TYPE as type, userRec.AMOUNT as amount, userRec.REMARKS as remarks ";
        getUserRecSql+= "FROM "+cons.USR_REC_TBL+" userRec WHERE userRec.USER_ID = ?";
    var userId = [req.params.userId];
    var insUserData = optModel.selectRecord(getUserRecSql,userId).then(function (records) {
      if (records == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        return resolve(records);
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
 Function Name : deleteRecord
 Description : To allow user to delete records
 Params : req, res
 Created on : 21-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.deleteRecord = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: DELETE RECORD');    
  var chckUserSql = "SELECT COUNT(userReg.USER_ID) as userId, rec.USER_REC_ID as recId FROM "+cons.USER_TBL+" userReg ";
      chckUserSql+= "LEFT JOIN "+cons.USR_REC_TBL+" rec ON rec.USER_ID = userReg.USER_ID AND rec.USER_REC_ID = ? WHERE userReg.USER_ID = ? ";
  var userId = req.params.userId;
  var recId = req.params.recordId;
  var insUser = optModel.selectRecord(chckUserSql, [recId,userId]).then(function (responseData) {

    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData[0].userId == 0) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.INVALID_USER_ID,msg.INVALID_USER_ID_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else if (responseData[0].recId != req.params.recordId) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.REC_ID_MISMATCH,msg.REC_ID_MISMATCH_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var delRecSql = "DELETE * FROM "+cons.USR_REC_TBL+" WHERE USER_ID = ? AND USER_REC_ID = ?";
        var insUser = optModel.deleteRecord(delRecSql, [userId,recId]).then(function (delData) {

          var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.REC_DEL_SUCC);
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
    var userErrResponse = errRes.getErrorResponse(ons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  });
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : delete record duration : ' + end + ' ms');
};