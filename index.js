const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

//creating the route
let handlers = {};

handlers.sample = function (data, callback){
    //responding to the query
    callback(201, {"route": "simple", "author" : "silanka"})
}

handlers.notFound = function (data, callback){
    //404 not found response
    callback(404)
}

const router = {
    'sample' : handlers.sample
}


const server = http.createServer(function(req, res){
    //parsing the request url
    const parsedUrl = url.parse(req.url, true);

    //getting the request path
    const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    //getting the request method
    const method = req.method.toUpperCase();

    //getting the http query string parameters
    const queryString = parsedUrl.query;

    //getting the request headers
    const reqHeaders = req.headers;

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
            reqHeaders,
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
})

server.listen(config.port, "localhost", function(){
    console.log("starting up server on port " + config.port + " on " + config.envName + " mode!");
})
