/*Common Messages*/
exports.VAL_MSG         = 'Validation Error';
exports.VAL_MSG_TAM     = 'சரிபார்ப்புப் பிழை';
exports.INTERNAL_ERROR  = 'Internal Server Error';
exports.INTERNAL_ERROR_TAM  = 'வழங்கிப் பிழை';
exports.INVALID_USER_ID     = 'Invalid User ID';
exports.INVALID_USER_ID_TAM = 'பயனர் அடையாள எண் செல்லாதது';
exports.DUPL_ERR		        = 'Duplicates In Array';
exports.INVALID_QUERY	      = 'The Query parameter passed is Invalid';

/*Message For User Registration Module*/
exports.USER_REG_MSG           = 'Your Account created Successfully';
exports.USER_REG_MSG_TAM       = 'உங்கள் கணக்கு தொடங்கப்பட்டுள்ளது';
exports.USER_REG_MOB_ERROR     = 'The mobile number already registered! Please use the credentials to login.';
exports.USER_REG_MOB_ERROR_TAM = 'இந்த கையடக்கத் தொலைபேசி எண் ஏற்கனவே பதிவுசெய்யப்பட்டுள்ளது! உள்நுழைக';
//Districts
exports.DISTRICT_NOT_FOUND = 'District List Not Found';
exports.DISTRICT_LIST_SUCC = 'Districts Successfully Listed';

//Event Categories
exports.EVENT_CAT_SUCC      = 'Event Categories Successfully Listed';
exports.EVENT_CAT_NOT_FOUND = 'Event Categories Not Found';

//Languages
exports.LANG_SUCC      = 'Languages Successfully Listed';
exports.LANG_NOT_FOUND = 'Languages Not Found';

/*Sign In Module*/
exports.MAX_NO_DEVICES   = 'Already Logged In 4 Devices';
exports.INVALID_USER     = 'Mobile Number is Not Registered';
exports.INVALID_USER_TAM = 'இந்த கையடக்கத் தொலைபேசி எண் பதிவுசெய்யப்படவில்லை';
exports.INVALID_PASSWRD  = 'Password Is Incorrect';
exports.INVALID_PASSWRD_TAM  = 'இது தவறான கடவுச்சொல்';
exports.USER_SIGNIN_SUCC     = 'User Sign-In Successful';

/*User Profile Update Module*/
exports.UPT_PRO_SUCC      = 'Your profile has been updated successfully';
exports.UPT_PRO_SUCC_TAM  = 'உங்கள் சுயவிபரம் மாற்றப்பட்டுவிட்டது';
exports.UPT_MOB_ERROR     = 'The mobile number already registered! Please use a differnt number.';
exports.UPT_MOB_ERROR_TAM = 'இந்த கையடக்கத் தொலைபேசி எண் ஏற்கனவே பதிவுசெய்யப்பட்டுள்ளது! வேறு எண்ணை உள்ளீடு செய்க';

/*User Logout Module*/
exports.LOGOUT_SUCC = 'User Successfully Logged Out';

/*Contact List Sync*/
exports.CONTACT_SYNC_SUCC = 'Contact List added Successfully';

/*User Setting Module*/
exports.USER_SET_SUCC = 'User Settings Updated Successfully';

/*User Profile*/
exports.USER_PROFILE_SUCC = 'User details displayed Successfully';

/*Change Password*/
exports.PASSWORD_MISMATCH     = 'Old Password is Incorrect';
exports.PASSWORD_MISMATCH_TAM = 'இது தவறான பழைய கடவுச்சொல்';
exports.PASSWORD_SUCC	  	    = 'Your password has been changed successfully!';
exports.PASSWORD_SUCC_TAM     = 'உங்கள் கடவுச்சொல் மாற்றப்பட்டுவிட்டது';

/*Forgot Password*/
exports.EMAIL_MISMATCH 	    = 'Please enter the registered email address';
exports.EMAIL_MISMATCH_TAM  = 'பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியை உள்ளீடு செய்க';
exports.PASSWORD_SUCC 	    = 'Your password has been changed successfully!';
exports.PASS_SUCC_FIRST     = 'This email confirms that your password has been changed! Your new password is';
exports.PASS_SUCC_SEC	      = 'To change your password, login with above password, navigate to ‘Settings’ and then to ‘Change Password’';

/*Event  Module*/
exports.INVALID_DATE      = 'Invalid Date';
exports.INVALID_DATE_TAM  = 'இது தவறான தேதி';
exports.INVALID_TIME      = 'Invalid Time';
exports.INVALID_TIME_TAM  = 'இது தவறான நேரம்';
exports.FRM_TO_TIME       = 'To Time Should be greater than From Time';
exports.FRM_TO_TIME_TAM   = 'முடியும் நேரம் துவங்கும் நேரத்தைவிட அதிகமாக இருக்கவேண்டும்';
exports.EVENT_DUP_1       = 'Event' ;
exports.EVENT_DUP_1_TAM   = 'இந்த விழா';
exports.EVENT_DUP_2       = 'already exists';
exports.EVENT_DUP_2_TAM   = 'ஏற்கனவே சேர்க்கப்பட்டுவிட்டது';
exports.EVENT_ADD_SUCC    = 'Event created successfully';
exports.EVENT_ADD_SUCC_TAM = 'இந்த விழா விபரம் சேர்க்கப்பட்டுவிட்டது';
exports.EVENT_UPT_SUCC     = 'Event Updated Successfully';
exports.EVENT_UPT_SUCC     = 'இந்த விழா விபரம் திருத்தப்பட்டுவிட்டது';
exports.EVENT_LIST_SUCC    = 'Events Successfully Listed';
exports.EVENT_EMPTY        = 'No Events for User';
exports.EVENT_EMPTY_TAM    = 'No message given';
exports.EVENT_ID_MISMATCH         = 'Event Id does not match with user';
exports.EVENT_ID_MISMATCH_TAM     = 'No message given';
exports.EVENT_PROMO_INVALID       = 'Event Promo Code is Invalid';
exports.EVENT_PROMO_INVALID_TAM   = 'இது தவறான விளம்பர குறியீடு';
exports.EVENT_DEL_INVALID      = 'Event cannot be deleted since gift has already been accepted';
exports.EVENT_DEL_INVALID_TAM  = 'இந்த விழாவிற்கு மொய் வாங்கப்பட்டுவிட்டது, விழா விபரங்களை அழிக்கமுடியாது';
exports.EVENT_NOT_FOUND        = 'Event Not Found';
exports.EVENT_DEL_SUCC         = 'Event deleted Successfully';
exports.EVENT_DEL_SUCC_TAM     = 'விழா விபரங்கள் அழிக்கப்பட்டுவிட்டது';
exports.EVENT_GUEST_DUPL       = 'Event already exists';
exports.EVENT_GUEST_DUPL_TAM       = 'இந்த விழா ஏற்கனவே சேர்க்கப்பட்டுவிட்டது';
exports.EVENT_USER_ID_MISMATCH     = 'You cannot add your own event again!';
exports.EVENT_USER_ID_MISMATCH_TAM = 'நீங்கள் உங்களுடைய விழாவை மறுபடியும் சேர்க்க இயலாது';

/*Record Module*/
exports.REC_ADD_SUCC      = 'User Record has been added Successfully';
exports.REC_ADD_SUCC_TAM  = 'நீங்கள் இந்த நபருக்கு அளித்த மொய் சேர்க்கப்பட்டுவிட்டது';
exports.REC_UPT_SUCC      = 'User Record has been updated Successfully';
exports.REC_UPT_SUCC_TAM  = 'நீங்கள் இந்த நபருக்கு அளித்த மொய் திருத்தப்பட்டுவிட்டது';
exports.REC_DUPL          = 'You have already saved the gift given to';
exports.REC_DUPL_TAM        = 'நீங்கள் இந்த நபருக்குச் செய்த மொய் விபரத்தை ஏற்கனவே பதிவுசெய்துவிட்டீர்கள்';
exports.REC_ID_MISMATCH     = 'Record Id does not match with user';
exports.REC_ID_MISMATCH_TAM = 'No message given';
exports.REC_DEL_SUCC        = 'Record deleted Successfully';
exports.REC_DEL_SUCC_TAM    = 'நீங்கள் இந்த நபருக்குச் செய்த மொய் விபரம் அழிக்கப்பட்டுவிட்டது';
exports.REC_NOT_FND         = 'You have not saved any gift given to your friend or relative! Please tap PLUS icon to record your gifts';
exports.REC_NOT_FND_TAM     = 'நீங்கள் மொய் செய்த விபரம் ஏதும் கண்டறியப்படவில்லை! புதிய மொய் விபரத்தைச் சேர்க்க + பொத்தானை அழுத்தவும்';

/*Moi Module*/
exports.MOI_ADD_SUCC        = 'You have received the gift(s) successfully';
exports.MOI_ADD_SUCC_TAM    = 'நீங்கள் வாங்கிய மொய் கணக்கில் சேர்க்கப்பட்டுள்ளது';
exports.MOI_EDIT_SUCC       = 'User Moi has been edited Successfully';
exports.MOI_EDIT_SUCC_TAM   = 'நீங்கள் இந்த நபரிடமிருந்து வாங்கிய மொய் விபரம் திருத்தப்பட்டுவிட்டது';
exports.MOI_LIST_SUCC       = 'User Moi Listed Successfully';
exports.MOI_DELETE_SUCC     = 'User Moi has been deleted Successfully';
exports.MOI_DELETE_SUCC_TAM = 'நீங்கள் இந்த நபரிடமிருந்து வாங்கிய மொய் விபரம் அழிக்கப்பட்டுவிட்டது';
exports.MOI_ID_MISMATCH     = 'Moi Id does not match with user';
exports.MOI_DUP_ERR         = 'You have already received gift from';
exports.MOI_DUP_ERR_TAM     = 'இந்த விருந்தினரின் மொய் விபரத்தை ஏற்கனவே பதிவுசெய்துவிட்டீர்கள்';
exports.MOI_NOT_FND         = 'No Moi for User';