import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNodeJS from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class Function01CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambdaNodeJS.NodejsFunction(this, 'Function01', {
      entry: 'lambda/fuction1.js',
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: false,
      },
    });

    const api = new apigateway.RestApi(this, 'hello-api', {
      restApiName: 'Hello Service',
      description: 'This is the Hello service'
    });

    const gettHelloIntegration = new apigateway.LambdaIntegration(handler, {
      requestParameters: {
        'application/json': '{statusCode: "200"}'
      },
    });

    api.root.addMethod('GET', gettHelloIntegration);
  }
}
