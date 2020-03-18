const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//declaring the container
const lib = {};

//normalizing path for the base directory
lib.baseDir = path.join(__dirname, '/../.data/');

//creating file
lib.create = function(folder, file, data, callback){
    const activeBaseDir = path.join(lib.baseDir, folder+'/');

    fs.open(`${activeBaseDir}${file}.json`, 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            //stringifying data
            stringData = JSON.stringify(data);
            //writing file
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('error closing file')
                        }
                    });
                }else{
                    callback("error while writing to file")
                }
            });
        }else{
            callback("unable to create file, file may already exist!")
            console.log(err);
        }
    });

};

//reading file
lib.read = function(folder, file, callback){
    fs.readFile(`${lib.baseDir}${folder}/${file}.json`,"utf8", function(err, data){
        const jsonToObj = helpers.parseJsonToObj(data)
        callback(err, jsonToObj);
    })
};

//editing a file
lib.put = function(folder, file, data, callback){
    const activeBaseFile = path.join(lib.baseDir, folder+'/'+file+'.json');
    fs.open(activeBaseFile, 'r+', function(err, fileDescriptor){
        if(!err){
            //converting json data to string
            const stringData = JSON.stringify(data);
            //truncating the file before updating
            fs.truncate(activeBaseFile, function(err){
                if(!err){
                    fs.writeFile(activeBaseFile, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback("unable to close file");
                                }
                            })
                        }else{
                            callback("unable to write to file")
                        }
                    })
                }else{
                    callback("unable to truncate file")
                }
            })
        }else{
            callback("unable to open file")
        }

    })
};

//deleting file
lib.delete = function(folder, file, callback){
    fs.unlink(`${lib.baseDir}${folder}/${file}.json`, function(err){
        if(!err){
            callback(false);
        }else{
            callback("unable to delete file");
        }
        
    })
}

module.exports = lib;
