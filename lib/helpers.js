/*
 *this contains all the helper tools
 *
*/

//dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

//creation the container
const helpers = {};

helpers.parseJsonToObj = function(str){
    try{
        const obj = JSON.parse(str);
        return obj;
    }catch(e){
        return false;
    }
}

helpers.passwordHasher = function(str){
    if(typeof str === 'string' && str.trim().length > 0){
        const hashedPassword = crypto.createHmac('sha256', config.hashSecretKey).update(str).digest('hex');
        return hashedPassword;
    }else{
        return false;
    }
}

helpers.createRandomString = function(num){
    if(typeof num === 'number' && num > 0){
        let randomString = '';
        const acceptableChars = 'abcdefghijklmnopqrstuvwxyz1234567890';
        for(let i = 0; i <= num; i++){
            randomString += acceptableChars.charAt(Math.floor(Math.random() * acceptableChars.length));
        }
        return randomString;
    }else{
        console.log('invalid parameter provided. num must be a number greater than 0')
    }
}

helpers.sendTwilioSms = function(phone, msg, callback){
    phone = typeof phone === 'string' && phone.trim().length > 6 ? phone.trim() : false;
    msg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;
    if(phone && msg){
        //configuring the request payload
        const payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+234'+phone,
            'Body' : msg
        }
        //stringifying the payload
        const stringPayload = querystring.stringify(payload);
        //configuring the request details
        const requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }
        }
        //configuring the https request
        const req = https.request(requestDetails, function(res){
            if(res.statusCode === 200 || res.statusCode === 201){
                callback(false);
            }else{
                callback('status code returned was ' + res.statusCode);
            }
        })
        //binding to the error event so it doesnt get thrown
        req.on('error', function(e){
            callback(e)
        });
        //adding the request payload
        req.write(stringPayload);
        //ending the request
        req.end();

    }else{
        callback('please provide the required fields');
    }
}

module.exports = helpers;