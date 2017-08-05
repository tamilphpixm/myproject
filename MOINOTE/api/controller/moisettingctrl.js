var payloadCheck = require('payload-validator');
var utilCom = require('../util/commonfunction');
var payLoad = require('../util/payload');
var errRes = require('../util/errorresponse');
var cons   = require('../config/constant');
var optModel = require('../model/modeloperation');
var succRes = require('../util/successresponse');
var msg = require('../config/message');
var validator = require('validator');
var asyncLoop = require('node-async-loop');

/*
 Function Name : updateSetting
 Description : To update user settings
 Params : req, res
 Created on : 11-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.updateSetting = function (req, res) {

	start = utilCom.getProcessingTime();
  logger.info('METHOD: UPDATE SETTING');
  logger.info(req.body);
  var type = req.query.type;
  if (type == "language") {
  	var payLoadVal = payloadCheck.validator(req.body, payLoad.userLangPayload, payLoad.userLangPayloadMand, true);
	  if (payLoadVal.success) {
	  	var chckUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
	    var userId = [req.body.userId];
	    var insUser = optModel.selectRecord(chckUserSql, userId).then(function (responseData) {
	      if (responseData == 'INT_ERROR') {
	        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
	        logger.info(userErrResponse);
	        res.send(userErrResponse);
	      } else {
	        if (responseData.length > 0) {
	        	var insData = {
              LANG_ID  : req.body.languageId,
            }; 
            var updateSql = "UPDATE "+cons.USER_TBL+" SET ? WHERE USER_ID = ?";
            var userId = [req.body.userId];
            var insUserData = optModel.updateRecord(updateSql,insData,userId).then(function (uptResponseData) {
              if (uptResponseData == 'INT_ERROR') {
                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
                logger.info(userErrResponse);
                res.send(userErrResponse);
              } else {
                var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.USER_SET_SUCC, req.body);
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
	        	var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
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
  } else {
  	var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG,msg.VAL_MSG_TAM);
		logger.info(userErrResponse);
		res.send(userErrResponse);
  }
  
  var end = utilCom.getProcessingTime(start);
  logger.info('Process : Update Setting duration : ' + end + ' ms');
};
/*
 Function Name : arrHasDupes
 Description : to check duplicates in array
 Params : A
 Created on :11.07.2017
 Updated on :
 Created by : iExemplar Software India Pvt Ltd.
*/

function arrHasDupes(A) {
  var i, j, n;
  n = A.length;
  // to ensure the fewest possible comparisons
  for (i = 0; i < n; i++) {
    for (j = i + 1; j < n; j++) {
      if (A[i] == A[j]) return true;
    }
  }
  return false;
};

/*
 Function Name : insertMoi
 Description : To sync moi of the user
 Params : req, res
 Created on : 21-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.insertMoi = function (req, res) {

	start = utilCom.getProcessingTime();
  logger.info('METHOD: INSERT MOI');
  logger.info(req.body);
  console.log(req.body);
	var chckUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chckUserSql, userId).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
      	var moiList = req.body.moiList;
		  	asyncLoop(moiList, function (item, next) {
		  		if (item.guestNumber != '') {
		  			var chckDuplSql = "SELECT COUNT(*) as rowCnt FROM "+cons.USR_MOI_TBL+" WHERE EVENT_ID = ? AND MOBILE_NUMBER = ?";
			  		var chckValue = [item.eventId,item.guestNumber];
	          var insUser = optModel.selectRecord(chckDuplSql, chckValue).then(function (duplData) {
	            if (responseData == 'INT_ERROR') {
	              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
	              logger.info(userErrResponse);
	              res.send(userErrResponse);
	            } else {
	              if (duplData[0].rowCnt == 0) {
							  	var insData = {
							      EVENT_ID 	      : item.eventId,
							      MOI_TYPE 	      : item.type,
							      REMARKS 		    : item.remarks,
							      GUEST_NAME      : item.guestName,
							      MOBILE_NUMBER   : item.guestNumber,
							      GUEST_LOCATION  : item.location,
							      NICK_NAME       : item.nickName,
                    CREATE_USER     : req.params.userId
							    }; 
							    var insUserData = optModel.insertRecord(cons.USR_MOI_TBL,insData).then(function (insResponseData) {
							      if (insResponseData == 'INT_ERROR') {
							        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
							        logger.info(userErrResponse);
							        res.send(userErrResponse);
							      } else {
							      	var index = moiList.indexOf(item);
							      	if (index == moiList.length - 1) {
							      		item["userMoiId"] = insResponseData.insertId;
						            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.MOI_ADD_SUCC, req.body);
						            logger.info(userResponse);
						            res.send(userResponse);
						          } else {
						          	item["userMoiId"] = insResponseData.insertId;
						          	next();
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
	                var duplErrMsg = msg.MOI_DUP_ERR + item.guestName + " !";
                  var duplErrMsgTam = msg.MOI_DUP_ERR_TAM;
	                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, duplErrMsg, duplErrMsgTam);
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
		  			var insData = {
				      EVENT_ID 	      : item.eventId,
				      MOI_TYPE 	      : item.type,
				      REMARKS 		    : item.remarks,
				      GUEST_NAME      : item.guestName,
				      MOBILE_NUMBER   : item.guestNumber,
				      GUEST_LOCATION  : item.location,
				      NICK_NAME       : item.nickName,
              CREATE_USER     : req.params.userId
				    }; 
				    var insUserData = optModel.insertRecord(cons.USR_MOI_TBL,insData).then(function (insResponseData) {
				      if (insResponseData == 'INT_ERROR') {
				        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
				        logger.info(userErrResponse);
				        res.send(userErrResponse);
				      } else {
				      	var index = moiList.indexOf(item);
				      	if (index == moiList.length - 1) {
				      		item["userMoiId"] = insResponseData.insertId;
			            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.MOI_ADD_SUCC, req.body);
			            logger.info(userResponse);
			            res.send(userResponse);
			          } else {
			          	item["userMoiId"] = insResponseData.insertId;
			          	next();
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
			  });
      } else {
      	var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
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
  logger.info('Process : Insert Moi duration : ' + end + ' ms');
};

/*
 Function Name : editMoi
 Description : To sync moi of the user - Edit
 Params : req, res
 Created on : 26-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.editMoi = function (req, res) {

	start = utilCom.getProcessingTime();
  logger.info('METHOD: EDIT MOI');
  logger.info(req.body);

	var chckUserSql = "SELECT * FROM "+cons.USER_TBL+" WHERE USER_ID = ?";
  var userId = [req.params.userId];
  var insUser = optModel.selectRecord(chckUserSql, userId).then(function (responseData) {
    if (responseData == 'INT_ERROR') {
      var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
      logger.info(userErrResponse);
      res.send(userErrResponse);
    } else {
      if (responseData.length > 0) {
      	var moiList = req.body.moiList;
		  	asyncLoop(moiList, function (item, next) {
		  		if (item.guestNumber != '') {
		  			var chckDuplSql = "SELECT COUNT(*) as rowCnt FROM "+cons.USR_MOI_TBL+" WHERE EVENT_ID = ? AND MOBILE_NUMBER = ? AND USR_MOI_ID != ?";
			  		var chckValue = [item.eventId,item.guestNumber,item.userMoiId];
	          var insUser = optModel.selectRecord(chckDuplSql, chckValue).then(function (duplData) {
	            if (responseData == 'INT_ERROR') {
	              var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
	              logger.info(userErrResponse);
	              res.send(userErrResponse);
	            } else {
	              if (duplData[0].rowCnt == 0) {
							  	var insData = {
							      MOI_TYPE 	     : item.type,
							      REMARKS 		   : item.remarks,
							      GUEST_NAME     : item.guestName,
							      MOBILE_NUMBER  : item.guestNumber,
							      GUEST_LOCATION : item.location,
							      NICK_NAME      : item.nickName
							    }; 
							    var uptMoi = "UPDATE "+cons.USR_MOI_TBL+" set ? WHERE USR_MOI_ID = ?";
							    var userMoiId = [item.userMoiId];
							    var insUserData = optModel.updateRecord(uptMoi,insData,userMoiId).then(function (insResponseData) {
							      if (insResponseData == 'INT_ERROR') {
							        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
							        logger.info(userErrResponse);
							        res.send(userErrResponse);
							      } else {
							      	var index = moiList.indexOf(item);
							      	if (index == moiList.length - 1) {
						            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.MOI_EDIT_SUCC, req.body);
						            logger.info(userResponse);
						            res.send(userResponse);
						          } else {
						          	next();
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
	                var duplErrMsg = msg.MOI_DUP_ERR + item.guestName + " !";
                  var duplErrMsgTam = msg.MOI_DUP_ERR ;
	                var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, duplErrMsg, duplErrMsgTam);
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
		  			var insData = {
				      MOI_TYPE 	      : item.type,
				      REMARKS 		    : item.remarks,
				      GUEST_NAME      : item.guestName,
				      MOBILE_NUMBER   : item.guestNumber,
				      GUEST_LOCATION  : item.location,
				      NICK_NAME       : item.nickName
				    }; 
				    var uptMoi = "UPDATE "+cons.USR_MOI_TBL+" set ? WHERE USR_MOI_ID = ?";
				    var userMoiId = [item.userMoiId];
				    var insUserData = optModel.updateRecord(uptMoi,insData,userMoiId).then(function (insResponseData) {
				      if (insResponseData == 'INT_ERROR') {
				        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
				        logger.info(userErrResponse);
				        res.send(userErrResponse);
				      } else {
				      	var index = moiList.indexOf(item);
				      	if (index == moiList.length - 1) {
			            var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.MOI_EDIT_SUCC, req.body);
			            logger.info(userResponse);
			            res.send(userResponse);
			          } else {
			          	next();
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
			  });
      } else {
      	var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
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
  logger.info('Process : Edit Moi duration : ' + end + ' ms');
};

/*
 Function Name : deleteMoi
 Description : To allow user to delete moi
 Params : req, res
 Created on : 26-07-2017
 Updated on : 
 Created by : iExemplar Software India Pvt Ltd.
*/
exports.deleteMoi = function (req, res) {

  start = utilCom.getProcessingTime();
  logger.info('METHOD: DELETE MOI');
    
  var chckUserSql = "SELECT COUNT(userReg.USER_ID) as userId, moi.USR_MOI_ID as moiId FROM "+cons.USER_TBL+" userReg ";
  		chckUserSql+= "LEFT JOIN "+cons.EVENT_TBL+" evnt ON evnt.USER_ID = userReg.USER_ID ";
      chckUserSql+= "LEFT JOIN "+cons.USR_MOI_TBL+" moi ON moi.EVENT_ID = evnt.EVENT_ID AND moi.USR_MOI_ID = ? WHERE userReg.USER_ID = ? AND moi.USR_MOI_ID = ?";
  var userId = req.params.userId;
  var moiId = req.params.moiId;
  console.log('Moi-userId,moiId',userId,moiId);
  var insUser = optModel.selectRecord(chckUserSql, [moiId,userId,moiId]).then(function (responseData) {

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
      } else if (responseData[0].moiId != req.params.moiId) {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.VAL_MSG, msg.VAL_MSG_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        var delMoiSql = "DELETE FROM "+cons.USR_MOI_TBL+" WHERE USR_MOI_ID = ?";
        var moiIdSql = [req.params.moiId]; 
        var insUser = optModel.deleteRecord(delMoiSql, moiIdSql).then(function (delData) {
        var userResponse = succRes.getSuccessResponse(cons.API_SUCCESS_CODE, msg.MOI_DELETE_SUCC);
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
  logger.info('Process : delete moi duration : ' + end + ' ms');
};

exports.getMoi = function (req, res) {

  return new Promise(function (resolve, reject) {

    var getUserMoiSql = "SELECT evnt.USER_ID as userId, userMoi.USR_MOI_ID as moiId, userMoi.EVENT_ID as eventId, userMoi.MOI_TYPE as type, userMoi.REMARKS as remarks, IF(userMoi.NICK_NAME IS NULL , '', userMoi.NICK_NAME) as nickName, ";
        getUserMoiSql+= "evnt.EVENT_DESC as eventDesc, evnt.EVENT_FRM_DATE as eventFromDate, evnt.EVENT_TO_DATE as eventToDate, userMoi.GUEST_NAME as guestName, IF(userMoi.MOBILE_NUMBER IS NULL, '', userMoi.MOBILE_NUMBER) as guestNumber, IF(userMoi.GUEST_LOCATION IS NULL, '', userMoi.GUEST_LOCATION) as location ";
        getUserMoiSql+= "FROM "+cons.USR_MOI_TBL+" userMoi JOIN "+cons.EVENT_TBL+" evnt ON evnt.EVENT_ID = userMoi.EVENT_ID";
        getUserMoiSql+= " WHERE evnt.USER_ID = ? ORDER BY evnt.EVENT_DESC, userMoi.GUEST_NAME ASC";
    var userId = [req.params.userId];
    var insUserData = optModel.selectRecord(getUserMoiSql,userId).then(function (moi) {
      if (moi == 'INT_ERROR') {
        var userErrResponse = errRes.getErrorResponse(cons.API_ERROR_CODE, msg.INTERNAL_ERROR,msg.INTERNAL_ERROR_TAM);
        logger.info(userErrResponse);
        res.send(userErrResponse);
      } else {
        return resolve(moi);
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