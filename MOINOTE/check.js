var RandExp = require('randexp');
var eventCode = new RandExp('[A-Z]{2}[0-9]{2}[a-z]{2}').gen();
                    console.log('eventCoed',eventCode)