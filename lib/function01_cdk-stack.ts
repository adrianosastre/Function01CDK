import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNodeJS from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { Duration } from '@aws-cdk/core';
import * as cwlogs from '@aws-cdk/aws-logs';

export class Function01CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambdaNodeJS.NodejsFunction(this, 'Function01', {
      functionName: 'Function01',
      entry: 'lambda/function01.js',
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: false,
      },
      memorySize: 256, // memória alocada
      timeout: Duration.seconds(30), // timeout de execução
      tracing: lambda.Tracing.ACTIVE, // dar permissão para escrever os traços do lambda no x-ray
    });

    const logGroup = new cwlogs.LogGroup(this, 'HelloApiLogs');

    const api = new apigateway.RestApi(this, 'hello-api', {
      restApiName: 'Hello Service',
      description: 'This is the Hello service',
      deployOptions: {
        methodOptions: {
          '/*/*': {
            throttlingRateLimit: 100, // requisições por segundo
            throttlingBurstLimit: 10, // requisições simultâneas
          },
        },
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
    });

    const gettHelloIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: {
        'application/json': '{statusCode: "200"}'
      },
    });

    const getMethod = api.root.addMethod('GET', gettHelloIntegration, {
      apiKeyRequired: true // API key habilitada
    });

    const getWithIdIntegration = new apigateway.LambdaIntegration(handler);
    const getWithIdResource = api.root.addResource('{id}');
    getWithIdResource.addMethod('GET', getWithIdIntegration, {
      apiKeyRequired: true // API key habilitada
    });

    const key = api.addApiKey('ApiKey');
    const plan = api.addUsagePlan('UsagePlan', {
      apiKey: key,
      quota: { // máx de requisições dentro de um período
        limit: 1000,
        period: apigateway.Period.DAY,
      },
      throttle: {
        rateLimit: 4,
        burstLimit: 4,
      },
    });

    plan.addApiStage({
      stage: api.deploymentStage,
      throttle: [
        {
          method: getMethod,
          throttle: {
            rateLimit: 2,
            burstLimit: 2,
          },
        },
      ],
    });

  }
}
