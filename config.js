/*
* the environment configuration file
*/

let environments = {};

environments.staging = {
    "port" : 3000,
    "envName" : "staging"
}

environments.production = {
    "port" : 5000,
    "envName" : "production"
}

//checking if environment is set and defaulting to staging if no environment is set
const activeEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof environments[activeEnvironment] === 'object' ? environments[activeEnvironment] : environments.staging;

module.exports = envToExport;