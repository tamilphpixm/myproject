var payloadCheck = require('payload-validator');
var utilCom = require('../util/commonfunction');
var payLoad = require('../util/payload');
var errRes = require('../util/errorresponse');
var cons   = require('../config/constant');
var optModel = require('../model/modeloperation');
var succRes = require('../util/successresponse');
var msg = require('../config/message');
var validator = require('validator');
var generator = require('generate-password');
var md5 = require('md5');
var nodemailer = require("nodemailer");

/*
 Function Name : insertUser
 Description : To Insert User Details In DB
 Params : req, res
 Created on : 10-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.insertUser = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: INSERT USER');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.userRegPayload, payLoad.userRegPayloadMand, true);

  if (payLoadVal.success) {
    
    if (validator.isNumeric(req.body.mobileNumber) && validator.isAlphanumeric(req.body.password) &&
        validator.isNumeric(req.body.mobCountryCode) && validator.isLength(req.body.mobCountryCode, { min : 1, max : 2 }) &&
        validator.isLength(req.body.userName, { min : 1, max : 35 }) && 
        validator.isLength(req.body.mobileNumber, { min : 10, max : 10 }) && 
        validator.isEmail(req.body.eMail)) {

      var chckMobNumSql = "SELECT * FROM "+cons.USER_TBL+" WHERE MOBILE_NUMBER = ?";
      var mobileNumber = [req.body.mobileNumber];
      var insUser = optModel.selectRecord(chckMobNumSql, mobileNumber).then(function (responseData) {

        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          if (responseData.length > 0) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.USER_REG_MOB_ERROR,msg.USER_REG_MOB_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var insData = {
              USER_NAME           : req.body.userName,
              PASSWORD            : req.body.password,
              MOBILE_NUMBER       : req.body.mobileNumber,
              EMAIL               : req.body.eMail,
              LANG_ID             : req.body.languageId,
              MOBILE_COUNTRY_CODE : req.body.mobCountryCode
            }; 
            var insUserData = optModel.insertRecord(cons.USER_TBL,insData).then(function (insResponseData) {
              if (insResponseData == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var loginData = {
                  USER_ID          : insResponseData.insertId,
                  DEVICE_TOKEN     : req.body.deviceToken,
                  MAC_ADDRESS      : req.body.macAddress,
                };
                var insUserData = optModel.insertRecord(cons.LOGIN_TBL,loginData).then(function (loginResponseData) {
                  if (loginResponseData == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    req.body["userId"] = insResponseData.insertId;
                    var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.USER_REG_MSG, req.body);
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
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG,msg.VAL_MSG_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    }  
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : Insert duration : ' + end + ' ms');
};

/*
 Function Name : signIn
 Description : To allow user to Sign In to the app.
 Params : req, res
 Created on : 10-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.signIn = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: SIGN IN');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.userSignInPayload, payLoad.userSignInMand, true);

  if (payLoadVal.success) {
    if (validator.isNumeric(req.body.mobileNumber) && validator.isAlphanumeric(req.body.password) &&
        validator.isNumeric(req.body.mobCountryCode) && validator.isLength(req.body.mobCountryCode, { min : 1, max : 2 }) &&
        validator.isLength(req.body.mobileNumber, { min : 10, max : 10 })) {

      var chckUserSql = "SELECT userReg.MOBILE_NUMBER as mobileNumber, userReg.USER_ID as userId, userReg.PASSWORD as password, ";
          chckUserSql+= "userReg.USER_NAME as userName, userReg.MOBILE_COUNTRY_CODE as mobCountryCode, ";
          chckUserSql+= "userReg.LANG_ID as languageId,";
          chckUserSql+= " lang.LANGUAGE_NAME as language, if(userReg.EMAIL IS NULL,'',userReg.EMAIL) as eMail ";
          chckUserSql+= "FROM "+cons.USER_TBL+" userReg ";
          chckUserSql+= "JOIN "+cons.LANG_TBL+" lang ON lang.LANG_ID = userReg.LANG_ID WHERE userReg.MOBILE_NUMBER = ?";

      var mobileNumber = [req.body.mobileNumber];
      var chkUserLogin = optModel.selectRecord(chckUserSql, mobileNumber).then(function (responseData) {

        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          if (responseData.length > 0) {
            if (responseData[0].password == req.body.password) {
              var userId = [responseData[0].userId];

              var loginData = {
                USER_ID          : userId,
                DEVICE_TOKEN     : req.body.deviceToken,
                MAC_ADDRESS      : req.body.macAddress,
              };
              var insUserData = optModel.insertRecord(cons.LOGIN_TBL,loginData).then(function (signInResponseData) {
                if (signInResponseData == 'INT_ERROR') {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                } else {
                  var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.USER_SIGNIN_SUCC,responseData);
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
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_PASSWRD, msg.INVALID_PASSWRD_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);
            }
          } else {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER, msg.INVALID_USER_TAM);
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
    } else {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG,msg.VAL_MSG_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    }
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : Signin duration : ' + end + ' ms');
};

/*
 Function Name : editUser
 Description : To edit User Details In DB
 Params : req, res
 Created on : 11-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.editUser = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: EDIT USER');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.userProPayload, payLoad.userProPayloadMand, true);

  if (payLoadVal.success) {
    
    if (validator.isNumeric(req.body.mobileNumber) && validator.isEmail(req.body.eMail) &&
        validator.isLength(req.body.userName, { min : 1, max : 35 }) && 
        validator.isLength(req.body.mobileNumber, { min : 10, max : 10 }) &&
        validator.isLength(req.body.eMail, { min : 0, max : 50 })) {

      var chckMobNumSql = "SELECT * FROM "+cons.USER_TBL+" WHERE MOBILE_NUMBER = ? AND USER_ID != ?";
      var mobileNumber = [req.body.mobileNumber];
      var userId = [req.body.userId];
      var insUser = optModel.selectRecord(chckMobNumSql, [mobileNumber,userId]).then(function (responseData) {

        if (responseData == 'INT_ERROR') {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
          logger.info(userErrResponse);
          res.send(userErrResponse);
        } else {
          if (responseData.length > 0) {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.UPT_MOB_ERROR, msg.UPT_MOB_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var insData = {
              USER_NAME        : req.body.userName,
              MOBILE_NUMBER    : req.body.mobileNumber,
              LANG_ID          : req.body.languageId,
              EMAIL            : req.body.eMail
            }; 
            var updateSql = "UPDATE "+cons.USER_TBL+" SET ? WHERE USER_ID = ?";
            var userId = [req.body.userId];
            var insUserData = optModel.updateRecord(updateSql,insData,userId).then(function (uptResponseData) {
              if (uptResponseData == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.UPT_PRO_SUCC, req.body);
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
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG,msg.VAL_MSG_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    }  
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : editUser duration : ' + end + ' ms');
};

/*
 Function Name : signOut
 Description : To allow user to sign out of the application
 Params : req, res
 Created on : 11-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.signOut = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: SIGNOUT');
  logger.info(req.body);

  var payLoadVal = payloadCheck.validator(req.body, payLoad.userlogOutPayload, payLoad.userlogOutPayloadMand, true);

  if (payLoadVal.success) {

    var chckMobNumSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
    var userId = [req.body.userId];
    var insUser = optModel.selectRecord(chckMobNumSql, userId).then(function (responseData) {

      if (responseData == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        if (responseData.length > 0) {
           var delSql = "DELETE FROM "+cons.LOGIN_TBL+" WHERE USER_ID = ? AND MAC_ADDRESS = ? AND DEVICE_TOKEN = ?";
            var selectValue = [req.body.userId,req.body.macAddress,req.body.deviceToken];
            var insUser = optModel.deleteRecord(delSql, selectValue).then(function (delResponseData) {
               if (delResponseData == 'INT_ERROR') {
                  var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                  logger.info(userErrResponse);
                  res.send(userErrResponse);
                } else {
                  var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.LOGOUT_SUCC);
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
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG,msg.VAL_MSG_TAM);
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
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : signOut duration : ' + end + ' ms');
};

/*
 Function Name : getUserProfile
 Description : To get User Details In DB
 Params : req, res
 Created on : 12-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.getUserProfile = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: GET USER PROFILE');
    
  var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {

    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
        
        var getUserSql = "SELECT userReg.MOBILE_NUMBER as mobileNumber, userReg.MOBILE_COUNTRY_CODE as mobCountryCode, userReg.USER_ID as userId, userReg.PASSWORD as password, ";
            getUserSql+= "userReg.USER_NAME as userName, ";
            getUserSql+= "userReg.LANG_ID as languageId, ";
            getUserSql+= "lang.LANGUAGE_NAME as language, if(userReg.EMAIL IS NULL,'',userReg.EMAIL) as eMail ";
            getUserSql+= "FROM "+cons.USER_TBL+" userReg ";
            getUserSql+= "JOIN "+cons.LANG_TBL+" lang ON lang.LANG_ID = userReg.LANG_ID WHERE userReg.USER_ID = ?";
        var userId = [req.params.userId];
        var insUserData = optModel.selectRecord(getUserSql,userId).then(function (uptResponseData) {
          if (uptResponseData == 'INT_ERROR') {
            var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
            logger.info(userErrResponse);
            res.send(userErrResponse);
          } else {
            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.USER_PROFILE_SUCC, uptResponseData);
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
  logger.info('Process : get user profile duration : ' + end + ' ms');
};

/*
 Function Name : changePassword
 Description : To allow user to change password in the app.
 Params : req, res
 Created on : 18-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.changePassword = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: CHANGE PASSWORD');
  
  var payLoadVal = payloadCheck.validator(req.body, payLoad.userPasswordPayload, payLoad.userPasswordPayloadMand, true);

  if (payLoadVal.success) {

    var chkUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
    var userId = [req.body.userId];
    var insUser = optModel.selectRecord(chkUserSql, userId).then(function (responseData) {
      if (responseData == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        if (responseData.length > 0) {
          
          var getUserPasswrdSql = "SELECT userReg.PASSWORD as password FROM "+cons.USER_TBL+" userReg WHERE userReg.USER_ID = ? ";
              
          var insUserData = optModel.selectRecord(getUserPasswrdSql,userId).then(function (responseData) {
            if (responseData == 'INT_ERROR') {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);
            } else {
              if (responseData[0].password == req.body.oldPassword) {
                var insData = {
                  PASSWORD        : req.body.newPassword
                }; 
                var updateSql = "UPDATE "+cons.USER_TBL+" SET ? WHERE USER_ID = ?";

                var insUserData = optModel.updateRecord(updateSql,insData,userId).then(function (uptResponseData) {
                  if (uptResponseData == 'INT_ERROR') {
                    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                    logger.info(userErrResponse);
                    res.send(userErrResponse);
                  } else {
                    var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.PASSWORD_SUCC);
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
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.PASSWORD_MISMATCH,msg.PASSWORD_MISMATCH_TAM);
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
        } else {
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INVALID_USER_ID,msg.INVALID_PASSWRD_TAM);
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
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : CHANGE PASSWORD duration : ' + end + ' ms');
};

/*
 Function Name : forgotPassword
 Description : To send new password to user via email.
 Params : req, res
 Created on : 18-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/

exports.forgotPassword = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: FORGOT PASSWORD');
  
  var payLoadVal = payloadCheck.validator(req.body, payLoad.userForgotPswdPayload, payLoad.userForgotPswdPayloadMand, true);

  if (payLoadVal.success) {

    var chkUserSql = "SELECT USER_ID as userId FROM "+cons.USER_TBL+" WHERE EMAIL = ?";
    var eMail = [req.body.eMail];
    var insUser = optModel.selectRecord(chkUserSql, eMail).then(function (responseData) {
      if (responseData == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        if (responseData.length > 0) {
          var password = generator.generate({
            length: 10,
            numbers: true,
            symbols: false,
            uppercase: true,
          });
          var hashedPswd = md5(password);
          var insData = {
            PASSWORD        : hashedPswd
          }; 
          var updateSql = "UPDATE "+cons.USER_TBL+" SET ? WHERE USER_ID = ?";

          var insUserData = optModel.updateRecord(updateSql,insData,responseData[0].userId).then(function (uptResponseData) {
            console.log(uptResponseData)
            if (uptResponseData == 'INT_ERROR') {
              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
              logger.info(userErrResponse);
              res.send(userErrResponse);
            } else {
              exports.sendMail(req,res,password,eMail);
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
          var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.EMAIL_MISMATCH,msg.EMAIL_MISMATCH_TAM);
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
  } else {
    console.log(payLoadVal.response.errorMessage);
    logger.info(payLoadVal.response.errorMessage);
    var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG , msg.VAL_MSG_TAM);
    logger.info(userErrResponse);
    res.send(userErrResponse);
  }
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : FORGOT PASSWORD duration : ' + end + ' ms');
};

/*
 Function Name : sendMail
 Description : To send new password to user via email.
 Params : req, res
 Created on : 20-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.sendMail = function (req,res, password,eMail) {

  /*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
  */
  var smtpTransport = nodemailer.createTransport({
    //service: "secureserver.net",
    host: "smtp.gmail.com",
    port : 465,
    secure: true,
    auth: {
      user: "ixmmoinote@gmail.com",
      pass: "moinote!@#"
    }
  });

  var mailOptions = {
    to : eMail,
    subject :'Your password has been changed!',
    text : msg.PASS_SUCC_FIRST + ' ' + password + ' ' + msg.PASS_SUCC_SEC
  }
  smtpTransport.sendMail(mailOptions, function(error, response) {;
   if (error) {
      res.end("error");
   } else { 
      var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.PASSWORD_SUCC);
      logger.info(userResponse);
      res.send(userResponse);
    }
  });
};