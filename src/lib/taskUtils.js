'use strict';
var forEach = require('array-foreach');
var utils = require('./Utils');
var config = require('./Config');
const instanceUtils = require('./ProcessInstanceUtils');
var httpOptions = {
    hostname: config.host,
    auth: `${config.userName}:${config.password}`,
    method: 'GET',
    rejectUnAuthorized : false
}

// get active task tokens from execution tree which has 
function getTokensFromChildren(children,tokenMap){
                if(children!=null){
                  for(var j=0;j<children.length;j++){
                       if(children[j].createdTaskIDs!=null){
                          tokenMap["tk"+children[j].createdTaskIDs[0]]= children[j].tokenId;
                         return tokenMap;
                         }else{
                             if(children[j].children!=null){
                                   getTokensFromChildren(children[j].children,tokenMap);
                             }   
                         }
                  }        
                }
                return tokenMap;  
}
//get active task list
//https://saphec.bpm.ibmcloud.com/bpm/dev/rest/bpm/wle/v1/process/11287?parts=executionTree
function getActiveTaskIdandTokens(instanceId,parts){
    console.log("Getting Active tasks and tokens for instanceid:"+instanceId);
   return new Promise((resolve, reject) => {
    instanceUtils.getInstanceData(instanceId,parts)
    .then((result) => {
        if (result.status == 200) {
           var executionTree=result.data.executionTree;
           var tokenMap=[];
           tokenMap= getTokensFromChildren(executionTree.root.children,tokenMap)
            var tasks=result.data.tasks;
            var activeTaskToken=[];
            for(var j=0;j<tasks.length;j++){
                var item=tasks[j];
                var task={};
               if(item.status=='Received'){
                  task.taskId=item.tkiid;
                  task.tokenId=tokenMap["tk"+item.tkiid];
                  task.flowObjectId=item.flowObjectID;
                    activeTaskToken.push(task);
                }
            }
           resolve(activeTaskToken);
        }
    })
    .catch((err) => {
        console.log("Error Occured " + err);
        reject(err);
    })

});
}

// reset the task tokens to the same 
function resetTaskTokens(instanceId,taskList,parts){
    console.log("Resetting active task tokens for instanceid:"+instanceId);
    return new Promise((resolve, reject) => {
        for(var i=0;i<taskList.length;i++){
            //&parts=executionTree
            if(taskList[i].tokenId!=null && taskList[i].tokenId!='undefined' && taskList[i].flowObjectId!=null && taskList[i].flowObjectId!='undefined'){
            httpOptions.path = `${config.urlPrefix}/rest/bpm/wle/v1/process/${instanceId}?action=moveToken&tokenId=${taskList[i].tokenId}&target=${taskList[i].flowObjectId}&resume=true${parts}`;  
              httpOptions.method='POST';
             utils.invokeHttps(httpOptions)
           /* .then((result) => {
                if (result.statusCode == 200) {
                    var dataObj = JSON.parse(result.data);
                    resolve(dataObj);
                }
                else {
                    reject(result);
                }
            })*/
            .catch((err) => {
                reject(err);
            });
            }
        }
        resolve(true);
    });
}
module.exports = {
    getActiveTaskIdandTokens: getActiveTaskIdandTokens,
    resetTaskTokens:resetTaskTokens
}