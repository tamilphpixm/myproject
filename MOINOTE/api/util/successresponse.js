exports.getSuccessResponse = function success(statusCode, message, datalst) {

  if (datalst != "") {
   var responseStr = {
    "code"    : statusCode,
    "message" : message,
    "data"    : datalst
   };
  } else {
    var responseStr = {
      "code"    : statusCode,
      "message" : message
    };
  }
  return responseStr;
};

exports.getSuccessResponseEvents = function success(statusCode, message, onGoing, upComing, past) {

  //if (onGoing != "" || upComing != "" || past != "") {
    var responseStr = {
      "code"    : statusCode,
      "message" : message,
      "data"    : {"onGoingEvents" : onGoing, "upComingEvents" : upComing, "pastEvents" : past}
    };
  // } else {
  //   var responseStr = {
  //     "code"    : statusCode,
  //     "message" : message
  //   };
  // }
  return responseStr;
};

exports.getSuccessResponseCommonEvent = function success(statusCode, message, ownEvent, guestEvent) {


  var responseStr = {
    "code"    : statusCode,
    "message" : message,
    "data"    : {"ownEvent" : ownEvent, "guestEvent" : guestEvent}
  };
  return responseStr;
};

exports.getSuccessResponseCommonRecord = function success(statusCode, message, userRecord) {


  var responseStr = {
    "code"    : statusCode,
    "message" : message,
    "data"    : userRecord
  };
  return responseStr;
};