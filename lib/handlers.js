/*
 *router handlers
 *
 */

//dependencies
const helpers = require('./helpers');
const _data = require('./data');

//the container for the handlers
let handlers = {};

//users
handlers._users = {}

//required data: phone
//optional data: none
//user - create
handlers._users.post = function(data, callback){
    const dataInfo = data.payload;
    const firstName = typeof dataInfo.firstName === 'string' && dataInfo.firstName.trim().length > 0 ? dataInfo.firstName.trim() : false;
    const lastName = typeof dataInfo.lastName === 'string' && dataInfo.lastName.trim().length > 0 ? dataInfo.lastName.trim() : false;
    const phone = typeof dataInfo.phone === 'string' && dataInfo.phone.trim().length > 6 ? dataInfo.phone : false;
    const password = typeof dataInfo.password === 'string' && dataInfo.password.trim().length > 0 ? dataInfo.password : false;
    const tosAgreement = typeof dataInfo.tosAgreement === 'boolean' && dataInfo.tosAgreement === true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){

        //checking if user already exist 
        _data.read('users', phone, function(err, data){
            if(err){
                //hashing user password
                const hashedPassword = helpers.passwordHasher(password);
                if(hashedPassword){
                    //creating a user object
                    const userData = {firstName, lastName, phone, hashedPassword, tosAgreement};
                    //creating a user file
                    _data.create('users', phone, userData, function(msg){
                        callback(200, {'response': msg});
                    })
                }else{
                    callback(500, {'error' : 'password hashing failed!'})
                }

            }else{
                callback(500, {'error': 'user phone number already exist!'})
            }
        });

    }else{
        callback(500, {'error' : 'please make sure all informations are provided!'})
    }
};

//required data: phone
//optional data: none
//@TODO authenticate user before sending data
//user - get
handlers._users.get = function(data, callback){
    const queryPhone = typeof data.queryString.phone === 'string' && data.queryString.phone.trim().length > 6 ? data.queryString.phone : false;

    if(queryPhone){
        _data.read('users', queryPhone, function(err, data){
            if(!err && data){
                delete data.hashedPassword;
                callback(200, data)
            }else{
                callback(500, {'error' : 'unable to read file, phone number does not exist'})
            }

        })
    }else{
        callback(404, {'error' : 'missing required field'})
    }
}

//required data : phone
//optional data: firstName, lastName, password - atleast one should be specified
//@TODO authenticate user before updating data
//users - update(put)
handlers._users.put = function(data, callback){
    const dataInfo = data.payload;
    const firstName = typeof dataInfo.firstName === 'string' && dataInfo.firstName.trim().length > 0 ? dataInfo.firstName.trim() : false;
    const lastName = typeof dataInfo.lastName === 'string' && dataInfo.lastName.trim().length > 0 ? dataInfo.lastName.trim() : false;
    const phone = typeof dataInfo.phone === 'string' && dataInfo.phone.trim().length > 6 ? dataInfo.phone : false;
    const password = typeof dataInfo.password === 'string' && dataInfo.password.trim().length > 0 ? dataInfo.password : false;
    if(phone){
        if(firstName || lastName || password){
            _data.read('users', phone, function(err, userData){
                if(!err && userData){
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.password = password;
                    }
                    //updating user
                    _data.put('users',phone, userData, function(response){
                        callback(200, {'response' : response })
                    })
                }else{
                    callback(404, {'error' : 'user does not exist'});
                }
            })
        }else{
            callback(400, {'error': 'No data provide for updating'})
        }
    }else{
        callback(400, {'error' : 'invalid data. please fill in required field -Phone number'})
    }
};

//required data : phone 
//@TODO authenticate users before deleting user object
handlers._users.delete = function(data, callback){
    const queryPhone = typeof data.queryString.phone === 'string' && data.queryString.phone.trim().length > 6 ? data.queryString.phone : false;

    if(queryPhone){
        _data.read('users', queryPhone, function(err, data){
            if(!err && data){
                _data.delete('users', queryPhone, function(err){
                    callback({"response" : err});
                })
            }else{
                callback(500, {'error' : 'unable to delete user object file'})
            }

        })
    }else{
        callback(404, {'error' : 'missing required field'})
    }  
}

handlers.users = function(data, callback){
    const acceptableVerbs = ['post', 'get', 'put', 'delete'];
    if(acceptableVerbs.indexOf(data.method.toLowerCase()) > -1){
        handlers._users[data.method.toLowerCase()](data, callback);
    }else{
        callback(500, { 'error': 'invalid http verb'});
    }
}


//tokens
//initialising the _token container
handlers._tokens = {};

//tokens - post
//required data : phone and password
//optional data: none
handlers._tokens.post = function(data, callback){
    const phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length > 6 ? data.payload.phone.trim() : false;
    const password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    if(phone && password){
        _data.read('users', phone, function(err, data){
            if(!err && data){
                //authenticating provided password
                const hashedPassword = helpers.passwordHasher(password);
                if(hashedPassword === data.hashedPassword){
                    //creating a user token
                    const token = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    //creating an object file for the user token with expiration date
                    const userTokenObj = {phone, token, expires}
                    _data.create('tokens', token, userTokenObj, function(respond){
                        callback(200, {'response' : respond})
                    })
                }else{
                    callback(400, {'error' : 'invalid password!'})
                }
            }else{
                callback(400, {'error' : 'user does not exist - invalid phone number'});
            }
        })
    }else{
        callback(400, {'error' : 'please provide required field(s)'})
    }
};

//tokens - get
//required data : tokenId
//optional data : none
handlers._tokens.get = function(data, callback){
    const tokenId = typeof data.queryString.token === 'string' && data.queryString.token.trim().length > 19 ? data.queryString.token.trim() : false;
    console.log('token id: ', tokenId);
    if(tokenId){
        _data.read('tokens', tokenId, function(err, tokenData){
            if(!err && tokenData){
                callback(200, tokenData)
            }else{
                callback(404, {'error' : 'token not found!'})
            }
        });
    }else{
        callback(400, {'error': 'please provide query param for token'})
    }
};

//tokens - put
handlers._tokens.put = function(data, callback){};

//tokens - delete
handlers._tokens.delete = function(data, callback){};

handlers.tokens = function(data, callback){
    const acceptableVerbs = ['post', 'get', 'put', 'delete'];
    if(acceptableVerbs.indexOf(data.method.toLowerCase()) > -1){
        handlers._tokens[data.method.toLowerCase()](data, callback);
    }else{
        callback(404, {'error' : 'invalid http verb'});
    }
}


handlers.ping = function (data, callback){
    callback(200)
}

handlers.notFound = function (data, callback){
    //404 not found response
    callback(404)
}


//exporting handlers
module.exports = handlers;