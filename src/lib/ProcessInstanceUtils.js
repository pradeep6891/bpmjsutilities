'use strict';

var utils = require('./Utils');
var config = require('./Config');


var httpOptions = {
    hostname: config.host,
    auth: `${config.userName}:${config.password}`,
    method: 'GET',
    rejectUnAuthorized : false,
    headers : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        }
}


        

//get instance data for a particular instance
function getInstanceData(instanceId, parts) {
    
    var partsStr = parts ? `?parts=${parts}` : "";
    return new Promise((resolve, reject) => {
        httpOptions.path = `${config.urlPrefix}/rest/bpm/wle/v1/process/${instanceId}${partsStr}`;        
        httpOptions.method="GET";
        utils.invokeHttps(httpOptions)
            .then((result) => {
                if (result.statusCode == 200) {
                    var dataObj = JSON.parse(result.data);
                    resolve(dataObj);
                }
                else {
                    reject(result);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })
}

//method to execute js statement for an instance
function executeJsforInstance(instanceId,scriptData){
   console.log("Executing js for instanceid:"+instanceId);
   httpOptions.path = `${config.urlPrefix}/rest/bpm/wle/v1/process/${instanceId}?action=js&script=${scriptData}&parts=all`;
   httpOptions.method = 'PUT';
   return new Promise((resolve, reject) => {
       utils.invokeHttps(httpOptions)
       .then((result) =>{
            if (result.statusCode == 200) {
                    var dataObj = JSON.parse(result.data);
                 //   console.log(dataObj);
                    resolve(dataObj);
                }
                else {
                    reject(result);
                }
       });

   });
  

}

//get all instances will return all instances for a process app 
function getAllInstances(processAppName) {
    httpOptions.path = `${config.urlPrefix}/rest/bpm/wle/v1/search/query?columns=instanceId&condition=instanceProcessApp%7C${processAppName}&organization=byInstance&run=true&shared=false&filterByCurrentUser=false`;
    httpOptions.method = 'PUT';
    
    return new Promise((resolve, reject) => {
        utils.invokeHttps(httpOptions)
            .then((result) => {
                if (result.statusCode == 200) {
                    var dataObj = JSON.parse(result.data);
                    resolve(dataObj);
                }
                else {
                    reject(result);
                }
            })
            .catch((err) => {
                reject(err);
            });
    })

}


module.exports = {
    getInstanceData: getInstanceData,
    getAllInstances: getAllInstances,
    executeJsforInstance: executeJsforInstance
}