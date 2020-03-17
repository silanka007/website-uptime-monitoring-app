/*
 *router handlers
 *
 */

//dependencies
const helpers = require('./helpers');
const _data = require('./data');

//the container for the handlers
let handlers = {};

//the sub handlers for the users route based on http verbs
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
}

handlers.users = function(data, callback){
    const acceptableVerbs = ['post', 'get', 'put', 'delete'];
    if(acceptableVerbs.indexOf(data.method.toLowerCase()) > -1){
        handlers._users[data.method.toLowerCase()](data, callback);
    }else{
        callback(500, { 'error': 'invalid http verb'});
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