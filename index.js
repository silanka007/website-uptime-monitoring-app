const http = require('http');
const url = require('url');

const port = 5000;

const server = http.createServer(function(req, res){
    //parsing the request url
    const parsedUrl = url.parse(req.url, true);

    //getting the request path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //getting the request method
    const method = req.method.toUpperCase();

    //send a response
    res.end("hello from silanka \n");

    //log the request path
    console.log(`the requested path is : ${trimmedPath} with method: ${method}`);
})

server.listen(process.env.P0RT || port, "localhost", function(){
    console.log("starting up server on port : " + port);
})