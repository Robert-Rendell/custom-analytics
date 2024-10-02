import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam"; // For granting permissions
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { config } from "dotenv";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

config();

export class CustomAnalyticsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (
      !process.env.EMAIL_FUNCTION_ARN ||
      !process.env.VPN_INFO_SERVICE_API_KEY ||
      !process.env.PAGE_VIEWS_DYNAMO_DB_TABLE
    ) {
      throw Error(
        "Missing required environment variables (EMAIL_FUNCTION_ARN, VPN_INFO_SERVICE_API_KEY, PAGE_VIEWS_DYNAMO_DB_TABLE)",
      );
    }

    // Topic has three subscribers: EmailFormatterFunction, PageViewFunction and AnalysisQueue
    const topic = new sns.Topic(this, "CustomAnalyticsTopic", {
      displayName: "Custom Analytics Topic",
    });

    // -------------- Request Function (entry point) --------------
    const requestFunction = new lambda.Function(this, "RequestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/request"),
      handler: "request-function.handler",
      timeout: cdk.Duration.seconds(10),
      environment: {
        TOPIC_ARN: topic.topicArn,
        VPN_INFO_SERVICE_API_KEY: process.env.VPN_INFO_SERVICE_API_KEY,
      },
    });

    topic.grantPublish(requestFunction);

    // -------------- Analysis Queue + Function + S3 --------------
    const analysisQueue = new sqs.Queue(this, "AnalysisQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.days(1),
    });

    topic.addSubscription(new subs.SqsSubscription(analysisQueue));

    const analysisBucket = new s3.Bucket(this, "AnalysisBucket", {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const analysisFunction = new lambda.Function(this, "AnalysisFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/analysis"),
      handler: "analysis-function.handler",
      timeout: cdk.Duration.seconds(10),
      environment: {
        QUEUE_URL: analysisQueue.queueUrl,
        ANALYSIS_BUCKET_NAME: analysisBucket.bucketName,
      },
      reservedConcurrentExecutions: 1, // Set reserved concurrency to 1
    });

    analysisQueue.grantConsumeMessages(analysisFunction);

    analysisBucket.grantReadWrite(analysisFunction);

    analysisFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(analysisQueue, {
        batchSize: 10,
      }),
    );

    // -------------- Email Formatter + Email Function --------------
    const emailFormatterFunction = new lambda.Function(
      this,
      "EmailFormatterFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "email-formatter-function.handler",
        code: lambda.Code.fromAsset("lambda/email-formatter"),
        environment: {
          EMAIL_FUNCTION_ARN: process.env.EMAIL_FUNCTION_ARN,
        },
        timeout: cdk.Duration.seconds(10),
      },
    );

    topic.addSubscription(new subs.LambdaSubscription(emailFormatterFunction));

    // decoupled from the stack as it is a generic function
    const emailFunction = lambda.Function.fromFunctionArn(
      this,
      "EmailFunction",
      process.env.EMAIL_FUNCTION_ARN,
    );

    emailFormatterFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [emailFunction.functionArn],
      }),
    );

    // -------------- Page View Function --------------
    const pageViewFunction = new lambda.Function(this, "PageViewFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/page-view"),
      handler: "page-view-function.handler",
      timeout: cdk.Duration.seconds(10),
      environment: {
        PAGE_VIEWS_DYNAMO_DB_TABLE: process.env.PAGE_VIEWS_DYNAMO_DB_TABLE,
      },
    });
    const table = dynamodb.Table.fromTableArn(
      this,
      "PageViewsTable",
      process.env.PAGE_VIEWS_DYNAMO_DB_TABLE,
    );

    table.grantReadWriteData(pageViewFunction);
    topic.addSubscription(new subs.LambdaSubscription(pageViewFunction));

    // Define a CloudFormation output for the entry point function ARN
    new cdk.CfnOutput(this, "RequestFunctionARN", {
      value: requestFunction.functionArn,
    });
  }
}
