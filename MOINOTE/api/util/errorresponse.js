exports.getErrorResponse = function success(statusCode, message, error) {

  var data = {
    "code"    : statusCode,
    "message" : message,
    "error"   : error
  };
  return data;
};