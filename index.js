const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const port = 5000;

const server = http.createServer(function(req, res){
    //parsing the request url
    const parsedUrl = url.parse(req.url, true);

    //getting the request path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //getting the request method
    const method = req.method.toUpperCase();

    //getting the http query string parameters
    const queryString = parsedUrl.query;

    //getting the request headers
    const reqHeaders = req.headers;

    //getting the request payload
    const stringDecoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(chunk){
        buffer += stringDecoder.write(chunk);
    });

    req.on('end', function(){
        buffer += stringDecoder.end();

        //send a response
        res.end("hello from silanka \n");

        //log the request path
        console.log('request was recieved with buffer: ', buffer);
    });
})

server.listen(process.env.P0RT || port, "localhost", function(){
    console.log("starting up server on port : " + port);
})
