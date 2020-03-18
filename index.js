const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


const router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
}
 
//creating a universal logic for both http and https
const unifiedServer = function (req, res) {
    //parsing the request url
    const parsedUrl = url.parse(req.url, true);

    //getting the request path
    const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    //getting the request method
    const method = req.method.toUpperCase();

    //getting the http query string parameters
    const queryString = parsedUrl.query;

    //getting the request headers
    const headers = req.headers;

    //getting the request payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(chunk){
        buffer += decoder.write(chunk);
    });

    req.on('end', function(){
        buffer += decoder.end();

        const data = {
            trimmedPath,
            method,
            queryString,
            headers,
            payload : helpers.parseJsonToObj(buffer)
        }

        //checking if route is valid
        const chosenRoute = typeof router[trimmedPath] !== "undefined" ? router[trimmedPath] : handlers.notFound;

        //route declaration
        chosenRoute(data, function(statusCode, payload){
            statusCode = typeof statusCode === "number" ? statusCode : 200;
            payload = typeof payload === "object" ? payload : {};

            //converting the payload to a string
            const payloadString = JSON.stringify(payload);

            // sending response
            res.setHeader("content-Type","application/json" )
            res.writeHead(statusCode, {
                // "content-Type" : "application/json"
            });
            res.end(payloadString);

            //logging the request status
            console.log("response sent successfully!")
        });
    });
}

//configuring server for http connections
http.createServer(function(req, res){
    //calling the unifiedServer function
    unifiedServer(req, res);
}).listen(config.httpPort, function(){
    console.log("starting up server on port " + config.httpPort + " on " + config.envName + " mode!");
})

//configuring server for https connections
const httpsServerOptions = {
    "key" : fs.readFileSync('./https/key.pem'),
    "cert" : fs.readFileSync('./https/cert.pem')
}

https.createServer(httpsServerOptions, function(req, res){
    //calling the unifiedServer function
    unifiedServer(req, res);
}).listen(config.httpsPort, function(){
    console.log("starting up server on port " + config.httpsPort + " on " + config.envName + " mode!")
})