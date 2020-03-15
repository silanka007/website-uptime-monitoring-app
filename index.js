const http = require('http');
const url = require('url');

const port = 5000;

const server = http.createServer(function(req, res){
    //parsing the request url
    const parsedUrl = url.parse(req.url, true);

    //getting the request path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //send a response
    res.end("hello from silanka \n");

    //log the request path
    console.log(`the requested path is : ${trimmedPath}`)
})

server.listen(process.env.P0RT || port, "localhost", function(){
    console.log("starting up server on port : " + port);
})