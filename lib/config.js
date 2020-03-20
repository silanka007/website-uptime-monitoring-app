/*
* the environment configuration file
*/

let environments = {};

environments.staging = {
    "httpPort" : 3000,
    "httpsPort" : 3001,
    "envName" : "staging",
    "hashSecretKey" : "this is a secret key",
    "maxChecks" : 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    },
}

environments.production = {
    "httpPort" : 5000,
    "httpsPort" : 5001,
    "envName" : "production",
    "hashSecretKey" : "this is a secret key",
    "maxChecks" : 5,
}

//checking if environment is set and defaulting to staging if no environment is set
const activeEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof environments[activeEnvironment] === 'object' ? environments[activeEnvironment] : environments.staging;

module.exports = envToExport;