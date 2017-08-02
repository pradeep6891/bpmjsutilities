'use strict';

const https = require('https');
const promise = require('promise');

function removeMetadata(data) {
    if (data == null) {
        return null;
    }

    delete data["@metadata"];
    for (var prop in data) {
        if (typeof data[prop] == "object") {
            removeMetadata(data[prop]);
        }
    }
    return data;
}

function invokeHttps(options, data) {
    return new Promise((resolve, reject) => {
        var req = https.request(options, (res) => {
            let fullResponse = '';
            let statusCode = res.statusCode;
            let statusMessage = res.statusMessage;

            res.on('data', (chunk) => {
                fullResponse += chunk;
            });


            res.on('end', () => resolve(
                {
                    statusCode: statusCode,
                    statusMessage: statusMessage,
                    data: fullResponse
                }
            ));
        });

        req.on('error', (err) => reject(err));
        if (data)
            req.end(data);
        else
            req.end();
    });
}

function executeInSerial(inputArray, invokeFunction) {
    let results = [];
    return inputArray.reduce((promise, current, index, array) => {

        return promise.then((data) => {
            if (data) {
                results.push(data);
            }

            return invokeFunction(current);
        })
    }, Promise.resolve()).then((data) => {
        results.push(data);
        return results;
    })
}


function executeInParallel(inputArray, invokeFunction) {
    let localResults = [];

    return Promise.all(inputArray.map((value, index, array) => {
        return new Promise((resolve, reject) => {
            invokeFunction(value).then((result) => {
                resolve(result);
            })
                .catch((err) => reject(err))
        })
    }))
}

function executeBatchInSerial(inputArray, invokeFunction, batchSize) {
    var batchArray = [];
    let results = [];

    var currentIndex = 0;
    while (currentIndex < inputArray.length) {
        var endIndex = (currentIndex + batchSize > inputArray.length) ? inputArray.length : currentIndex + batchSize;
        var tempArray = inputArray.slice(currentIndex, endIndex);
        batchArray.push(tempArray);
        currentIndex += batchSize;
    }

    console.log("Total number of batches " + batchArray.length);

    return batchArray.reduce((promise, currentValue, currentIndex, array) => {
        return promise.then((data) => {
            if (data) {
                results.push(data);
            }

            console.log("Processing Batch " + currentIndex);
            return executeInParallel(currentValue, invokeFunction);
        })
    }, Promise.resolve()).then((data) => {
        results.push(data);
        return results;
    })
}




module.exports = {
    removeMetadata: removeMetadata,
    invokeHttps: invokeHttps,
    executeInSerial: executeInSerial,
    executeInParallel: executeInParallel,
    executeBatchInSerial: executeBatchInSerial
}

