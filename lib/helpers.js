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

module.exports = helpers;