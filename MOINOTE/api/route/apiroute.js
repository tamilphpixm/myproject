var express = require('express');
var router  = express.Router();
var hCheck  = require('../controller/healthctrl');
var user    = require('../controller/userctrl');
var listCtrl   = require('../controller/commonlistctrl');
var eventMoi   = require('../controller/moisettingctrl');
var event      = require('../controller/eventctrl');
var record     = require('../controller/recordctrl');
var report     = require('../controller/reportctrl');
Promise        = require('bluebird');

router.use(function(req, res, next) {  
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","*");
  next();
});

router.get('/api/v1/health',hCheck.serverHealthCheck);
//user
router.post('/api/v1/user',user.insertUser);
router.post('/api/v1/user/signin',user.signIn);
router.put('/api/v1/user',user.editUser);
router.put('/api/v1/user/logout',user.signOut);
router.put('/api/v1/user/password',user.changePassword);
router.post('/api/v1/user/password',user.forgotPassword);
router.get('/api/v1/user/:userId',user.getUserProfile);

//common list
router.get('/api/v1/district/list',listCtrl.getDistrictList);
router.get('/api/v1/event/list',listCtrl.getEventCategoryList);
router.get('/api/v1/language/list',listCtrl.getLanguageList);

//setting
router.put('/api/v1/user/setting',eventMoi.updateSetting);

//Event 
router.post('/api/v1/user/event', event.createEvent);
router.put('/api/v1/user/event', event.editEvent);
router.delete('/api/v1/user/:userId/event/:eventId',event.deleteEvent);
router.delete('/api/v1/guest/:userId/event/:eventId',event.deleteGuestEvent);
router.get('/api/v1/user/:userId/event',event.getOwnEvent);
router.get('/api/v1/guest/:userId/event',event.getGuestEvent);
router.get('/api/v1/guest/:userId/event/:promoCode',event.getGuestEventDetails);
router.get('/api/v1/user/:userId/event/list',listCtrl.getUserEventList);

//Records
router.post('/api/v1/user/:userId/record',record.addRecord);
router.put('/api/v1/user/record',record.editRecord);
router.delete('/api/v1/user/:userId/record/:recordId',record.deleteRecord);

//common
router.get('/api/v1/user/:userId/detail',listCtrl.getAllUserDetails);

//moi
router.post('/api/v1/user/:userId/moi',eventMoi.insertMoi);
router.put('/api/v1/user/:userId/moi',eventMoi.editMoi);
router.delete('/api/v1/user/:userId/moi/:moiId',eventMoi.deleteMoi);

//Report
router.get('/api/v1/user/:userId/event/:eventId/report',report.moiNoteReport);

module.exports = router;
