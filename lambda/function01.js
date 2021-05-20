const AWS = require('aws-sdk');
const AWSXRAY = require('aws-xray-sdk-core');

const xRay = AWSXRAY.captureAWS(require('aws-sdk')); // toda requisição poderá ser monitorada pelo aws x-ray

exports.handler = async function(event, context) {
    console.log(event);
    // console.log(context);

    const apiGwRequestId = event.requestContext.requestId; // request id da api gtw (chamou o lambda)
    const lambdaRequestId = context.awsRequestId; // request id do lambda

    console.log(`API Gateway Request Id: ${apiGwRequestId} Lambda Request Id: ${lambdaRequestId}`);

    const method = event.httpMethod
    if (method === 'GET') {
        if (event.resource == '/') {
            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                    message: 'Hello World! apiGwRequestId lambdaRequestId',
                    apiGwRequestId: apiGwRequestId,
                    lambdaRequestId: lambdaRequestId,
                }),
            };
        } else if (event.resource === '/{id}') {
            const resourceId = event.pathParameters.id;
            console.log(`ResorceId: ${resourceId}`);

            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                    message: 'Hello World! apiGwRequestId lambdaRequestId',
                    apiGwRequestId: apiGwRequestId,
                    lambdaRequestId: lambdaRequestId,
                    resourceId: resourceId,
                }),
            };
        }
    }

    return {
        statusCode: 400,
        headers: {},
        body: JSON.stringify({
            message: 'Bad Request!',
            apiGwRequestId: apiGwRequestId,
            lambdaRequestId: lambdaRequestId,
        }),
    };
}