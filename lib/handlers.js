/*
 *router handlers
 *
 */

//dependencies
const helpers = require('./helpers');
const _data = require('./data');
const config = require('./config');

//the container for the handlers
let handlers = {};

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
                    _data.create('tokens', token, userTokenObj, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'error' : 'unable to create token'})
                        }
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
//required data : tokenId and extend(boolean)
//optional argument : none
handlers._tokens.put = function(data, callback){
    const tokenId = typeof data.payload.token === 'string' && data.payload.token.trim().length > 10 ? data.payload.token.trim() : false;
    const extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? true : false;

    if(tokenId && extend){
        _data.read('tokens', tokenId, function(err, tokenData){
            if(!err && tokenData){
                if(tokenData.expires > Date.now()){
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.put('tokens', tokenId, tokenData, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'error' : 'unable to edit token'})
                        }
                    })
                }else{
                    callback(400, {'error' : 'user token has expired'})
                }
            }else{
                callback(500, {'error' : 'token does not exist'})
            }
        })

    }else{
        callback(400, {'error' : 'please make use required field data are provided and valid'});
    }
};

//tokens - delete
//required data - tokenId
//optional data - none
handlers._tokens.delete = function(data, callback){
    const tokenId = typeof data.queryString.token === 'string' && data.queryString.token.trim().length > 10 ? data.queryString.token.trim() : false;

    //checking that the token exists
    _data.read('tokens', tokenId, function(err, tokenData){
        if(!err && tokenData){
            _data.delete('tokens', tokenId, function(err){
                if(!err){
                    callback(200);
                }else{
                    callback(500, {'error' : 'unable to delete token'})
                }
            })
        }else{
            callback(404, {'error' : 'token does not exist'});
        }
    })
};

//token - verify
//required data - tokenId and phone
//optional arguments - none
handlers._tokens.verifyToken = function(tokenId, phone, callback){
    _data.read('tokens', tokenId, function(err, tokenData){
        if(!err && tokenData){
            if(tokenData.phone === phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    })
};

handlers.tokens = function(data, callback){
    const acceptableVerbs = ['post', 'get', 'put', 'delete'];
    if(acceptableVerbs.indexOf(data.method.toLowerCase()) > -1){
        handlers._tokens[data.method.toLowerCase()](data, callback);
    }else{
        callback(404, {'error' : 'invalid http verb'});
    }
}





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
                    _data.create('users', phone, userData, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(500, {'error' : 'unable to create file'})
                        }
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
//user - get
handlers._users.get = function(data, callback){
    const queryPhone = typeof data.queryString.phone === 'string' && data.queryString.phone.trim().length > 6 ? data.queryString.phone : false;

    if(queryPhone){
        const token = typeof data.headers.token === 'string' && data.headers.token.trim().length > 10 ? data.headers.token.trim() : false;
        handlers._tokens.verifyToken(token, queryPhone, function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users', queryPhone, function(err, data){
                    if(!err && data){
                        delete data.hashedPassword;
                        callback(200, data)
                    }else{
                        callback(500, {'error' : 'unable to read file, phone number does not exist'})
                    }
        
                })
            }else{
                callback(400, {'error' : 'invalid/no token provided - please provide a valid token'})
            }
        })
    }else{
        callback(404, {'error' : 'missing required field'})
    }
}

//required data : phone
//optional data: firstName, lastName, password - atleast one should be specified
//users - update(put)
handlers._users.put = function(data, callback){
    const dataInfo = data.payload;
    const firstName = typeof dataInfo.firstName === 'string' && dataInfo.firstName.trim().length > 0 ? dataInfo.firstName.trim() : false;
    const lastName = typeof dataInfo.lastName === 'string' && dataInfo.lastName.trim().length > 0 ? dataInfo.lastName.trim() : false;
    const phone = typeof dataInfo.phone === 'string' && dataInfo.phone.trim().length > 6 ? dataInfo.phone : false;
    const password = typeof dataInfo.password === 'string' && dataInfo.password.trim().length > 0 ? dataInfo.password : false;
    if(phone){
        if(firstName || lastName || password){
            //authenticating the user token
            const token = typeof data.headers.token === 'string' && data.headers.token.trim().length > 10 ? data.headers.token.trim() : false;
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
                if(tokenIsValid){
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
                            _data.put('users',phone, userData, function(err){
                                if(!err){
                                    callback(200);
                                }else{
                                    callback(500, {'error' : 'unable to edit file'})
                                }
                            })
                        }else{
                            callback(404, {'error' : 'user does not exist'});
                        }
                    })
                }else{
                    callback(400, {'error' : 'invalid/no token provided - please provide a valid token'})
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
handlers._users.delete = function(data, callback){
    const queryPhone = typeof data.queryString.phone === 'string' && data.queryString.phone.trim().length > 6 ? data.queryString.phone : false;

    if(queryPhone){
        const token = typeof data.headers.token === 'string' && data.headers.token.trim().length > 10 ? data.headers.token.trim() : false;
        //authenticating the user token
        handlers._tokens.verifyToken(token, queryPhone, function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users', queryPhone, function(err, data){
                    if(!err && data){
                        _data.delete('users', queryPhone, function(err){
                            if(!err){
                                callback(200);
                            }else{
                                callback(500, {'error' : 'unable to delete file'})
                            }
                        })
                    }else{
                        callback(500, {'error' : 'unable to delete user object file'})
                    }
        
                })
            }else{
                callback(400, {'error' : 'invalid/no token provided - please provide a valid token'})
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

//checks
//container
handlers._checks = {};

//checks - post
//required data : protocol, url, method, successCodes and timeoutSeconds
//optional data : none
handlers._checks.post = function(data, callback){
    const protocol = typeof data.payload.protocol === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof data.payload.url === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof data.payload.method === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof data.payload.successCodes === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 1 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof data.payload.timeoutSeconds === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds > 1 && data.payload.timeoutSeconds < 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //checking for token authentication
        const token = typeof data.headers.token === 'string' && data.headers.token.length > 10 ? data.headers.token : false;
        if(token){
            //validating token
            _data.read('tokens', token, function(err, tokenData){
                if(!err && tokenData){
                    //validating that the token is not expired
                    const userPhone = tokenData.phone;
                    handlers._tokens.verifyToken(token, userPhone, function(tokenIsValid){
                        if(tokenIsValid){
                            //validating the user
                            _data.read('users', userPhone, function(err, userData){
                                if(!err && userData){
                                    const checks = typeof userData.checks === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                    //checking if user has maxed out on checks
                                    if(checks.length < config.maxChecks){
                                        //creating a unique check Id
                                        const checkId = helpers.createRandomString(20);
                                        //creating the check object
                                        const userCheck = {checkId, 'phone':userPhone, protocol, url, method, successCodes, timeoutSeconds};
                                        _data.create('checks', checkId, userCheck, function(err){
                                            if(!err){
                                                userData.checks = checks;
                                                userData.checks.push(checkId);
                                                //updating the user data
                                                _data.put('users', userPhone, userData, function(err){
                                                    if(!err){
                                                        callback(200, userCheck)
                                                    }else{
                                                        callback(500)
                                                    }
                                                })
                                            }else{
                                                callback(500, {'error' : 'unable to create check'})
                                            }
                                        })
        
        
                                    }else{
                                        callback(403, {'error': 'maximum check limit exceeded ('+config.maxChecks+') '})
                                    }
                                }else{
                                    callback(403);
                                }
                            })
                        }else{
                            callback(403, {'error' : 'token session expired'})
                        }
                    })
                }else{
                    callback(403)
                }
            })
        }else{
            callback(400,  {'error' : 'no authentication token provided'})
        }
    }else{
        callback(400, {'error' : 'please provide valid input data for all required files'})
    }
}

//checks - get
//required data : checkId
//optional data : none
handlers._checks.get = function(data, callback){
    const checkId = typeof data.queryString.checkId === 'string' && data.queryString.checkId.trim().length > 10 ? data.queryString.checkId : false;
    if(checkId){
        _data.read('checks', checkId, function(err, checkData){
            if(!err && checkData){
                //validating the token in the request header
                const token = typeof data.headers.token === 'string' && data.headers.token.trim().length > 10 ? data.headers.token.trim() : false;
                _data.read('tokens', token, function(err, tokenData){
                    if(!err && tokenData){
                        const userPhone = tokenData.phone;
                        //checking for token expiration
                        handlers._tokens.verifyToken(token, userPhone, function(tokenIsValid){
                            if(tokenIsValid){
                                //validating user Account
                                _data.read('users', userPhone, function(err, userData){
                                    if(!err && userData){
                                        callback(200, checkData);
                                    }else{
                                        callback(403);
                                    }
                                })
                            }else{
                                callback(403, {'error' : 'invalid token session'})
                            }
                        })
                    }else{
                        callback(403, {'error': 'unable to read token'})
                    }
                })
            }else{
                callback(404, {'error' : 'invalid checkId'})
            }
        })
    }else{
        callback(400, {'error' : 'please provide all the required fields'})
    }
}

handlers.checks = function(data, callback){
    const acceptableVerbs = ['post', 'get', 'put', 'delete'];
    if(acceptableVerbs.indexOf(data.method.toLowerCase()) > -1){
        handlers._checks[data.method.toLowerCase()](data, callback);
    }else{
        callback(500, {'error' : 'invalid http verb'});
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