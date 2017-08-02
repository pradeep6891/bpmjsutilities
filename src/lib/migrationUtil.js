'use strict';


var utils = require('./Utils');
var config = require('./Config');
var taskUtils= require('./taskUtils');
var instanceUtils=require('./ProcessInstanceUtils');

/*function ExecuteJSAndResetTaskToken(obj){
    var instanceId=obj.instanceId
    var scriptData=obj.scriptData;
   return new Promise((resolve, reject) => { 
       console.log("Executing for instanceId:"+ instanceId)
    instanceUtils.executeJsforInstance(instanceId,scriptData)
     .then((result) =>{
       return taskUtils.getActiveTaskIdandTokens(instanceId,'header%7CexecutionTree')
         .then((result2) => {
           return taskUtils.resetTaskTokens(instanceId,result2,'&parts=executionTree')
            .then((result1) =>{
                console.log("resetTaskTkens Done");
               return result1;
             })
             .catch((err) => {
                console.log("Error Occured " + err);
            })
            

       })
         .catch((err) => {
         console.log("Error Occured " + err);
       })
    })

    .catch((err) => {
    console.log("Error Occured " + err);
    })
});
}*/
function ExecuteJSAndResetTaskToken(obj){
    var instanceId=obj.instanceId
    var scriptData=obj.scriptData;
   return new Promise((resolve, reject) => { 
    console.log("Executing for instanceId:"+ instanceId)
    if(scriptData!=null){ // incase script has to be executed then first script is executed and then token reset happens
        instanceUtils.executeJsforInstance(instanceId,scriptData)
        .then((result) =>{
           return taskUtils.getActiveTaskIdandTokens(instanceId,'header%7CexecutionTree')
        }) 
        .then((result2) => {
             return taskUtils.resetTaskTokens(instanceId,result2,'&parts=executionTree')
        })
        .then((result1) =>{
             console.log("resetTaskTkens Done");
             resolve(result1);
         })
         .catch((err) => {
                console.log("Error Occured for instanceId: "+instanceId + err);
                reject(err);
        })
    }else{ // If script is null then process starts with token resetting steps
         taskUtils.getActiveTaskIdandTokens(instanceId,'header%7CexecutionTree')  
         .then((result2) => {
            return taskUtils.resetTaskTokens(instanceId,result2,'&parts=executionTree')
         })
        .then((result1) =>{
             console.log("resetTaskTkens Done for instance "+instanceId);
             resolve(result1);
         })
         .catch((err) => {
                console.log("Error Occured for instanceId: "+instanceId + err);
                reject(err);
         })
    }
     
  
});
}


module.exports = {

    ExecuteJSAndResetTaskToken:ExecuteJSAndResetTaskToken
}