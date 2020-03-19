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
}

environments.production = {
    "httpPort" : 5000,
    "httpsPort" : 5001,
    "envName" : "production",
    "hashSecretKey" : "this is a secret key",
    "maxChecks" : 5
}

//checking if environment is set and defaulting to staging if no environment is set
const activeEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof environments[activeEnvironment] === 'object' ? environments[activeEnvironment] : environments.staging;

module.exports = envToExport;