/* User Registration payload */
exports.userRegPayload = {
  "userName"        : "",
  "password"        : "",
  "mobileNumber"    : "",
  "eMail"           : "",
  "deviceToken"     : "",
  "macAddress"      : "",
  "languageId"      : "",
  "language"        : "",
  "mobCountryCode"  : ""
}; 

exports.userRegPayloadMand = ['userName','password','mobileNumber','eMail','macAddress','languageId','language','mobCountryCode'];  

/*User Sign-In*/
exports.userSignInPayload = {
  "password"        : "",
  "mobileNumber"    : "",
  "deviceToken"     : "",
  "macAddress"      : "",
  "mobCountryCode"  : ""
};

exports.userSignInMand = ['password','mobileNumber', 'macAddress','mobCountryCode'];

/* User profile payload */
exports.userProPayload = {
  "userId"          : "",
  "userName"        : "",
  "mobileNumber"    : "",
  "eMail"           : "",
  "languageId"      : "",
  "language"        : ""
}; 

exports.userProPayloadMand = ['userId','userName','mobileNumber','eMail','languageId','language'];

/* User logout payload */
exports.userlogOutPayload = {
  "userId"      : "",
  "deviceToken" : "",
  "macAddress"  : ""
}; 

exports.userlogOutPayloadMand = ['userId','deviceToken','macAddress'];

/*User Contact Sync payload */
exports.userContactPayload = {
  "userId"      : "",
  "conatctList" : []
}; 

exports.userContactPayloadMand = ['userId'];

/*User Language update payload */
exports.userLangPayload = {
  "userId"      : "",
  "languageId"  : "",
  "language"    : ""
}; 

exports.userLangPayloadMand = ['userId','languageId','language'];

/*User notification update payload */
exports.userNotiPayload = {
  "userId"          : "",
  "invitationAlert" : "",
  "giftAlert"       : "",
  "eventAlert"      : ""
}; 

exports.userNotiPayloadMand = ['userId','invitationAlert','giftAlert','eventAlert'];

/*Event creation payload*/
exports.event = {
  "eventCatId"      : "",
  "userId"          : "", 
  "eventDesc"       : "",
  "hostName"        : "",
  "eventToDate"     : "",
  "eventFrmDate"    : "",
  "eventVenue"      : "",
  "eventLocation"   : "",
  "templateType"    : "",
  "eventVenueAddr"  : "",
  "districtId"      : ""
}; 

exports.eventMand = ['eventCatId', 'userId', 'eventDesc','hostName','eventToDate','eventFrmDate', 'eventVenue','eventLocation','templateType','districtId'];

/* User Change Password payload */
exports.userPasswordPayload = {
  "userId"      : "",
  "oldPassword" : "",
  "newPassword"  : ""
}; 

exports.userPasswordPayloadMand = ['userId','oldPassword','newPassword'];

/* User forgot Password payload */
exports.userForgotPswdPayload = {
  "eMail"      : "",
}; 

exports.userForgotPswdPayloadMand = ['eMail'];


/*Event edit payload*/
exports.eventEditPayload = {
  "eventId"         : "",
  "eventCatId"      : "",
  "userId"          : "", 
  "eventDesc"       : "",
  "hostName"        : "",
  "eventToDate"     : "",
  "eventFrmDate"    : "",
  "eventVenue"      : "",
  "eventLocation"   : "",
  "templateType"    : "",
  "eventVenueAddr"  : "",
  "districtId"      : ""
}; 

exports.eventEditPayloadMand = ['eventId','eventCatId', 'userId', 'eventDesc','hostName','eventToDate','eventFrmDate', 'eventVenue','eventLocation','templateType','districtId'];

/*Add Record payload*/
exports.addRecordPayload = {
  "userId"        : "",
  "hostNumber"    : "",
  "hostName"      : "",
  "eventDesc"     : "",
  "eventDate"     : "",
  "eventVenue"    : "",
  "eventLocation" : "",
  "amount"        : "",
  "remarks"       : "",
  "eventDistrict" : "",
  "type"          : ""
}; 

exports.addRecordPayloadMand = ['userId', 'eventDesc','hostName','hostNumber','eventDate', 'eventVenue','eventLocation','type','eventDistrict','amount','remarks'];

/*Edit Record payload*/
exports.editRecordPayload = {
  "userRecId"     : "",
  "userId"        : "",
  "hostNumber"    : "",
  "hostName"      : "",
  "eventDesc"     : "",
  "eventDate"     : "",
  "eventVenue"    : "",
  "eventLocation" : "",
  "amount"        : "",
  "remarks"       : "",
  "eventDistrict" : "",
  "type"          : ""
}; 

exports.editRecordPayloadMand = ['userRecId','userId', 'eventDesc','hostName','hostNumber','eventDate', 'eventVenue','eventLocation','type','eventDistrict','amount','remarks'];