/*
 *this contains all the helper tools
 *
*/

//dependencies
const crypto = require('crypto');
const config = require('./config');

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

module.exports = helpers;