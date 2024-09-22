import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam"; // For granting permissions
import { Construct } from "constructs";
import { config } from "dotenv";

config();

export class CustomAnalyticsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    if (
      !process.env.EMAIL_FUNCTION_ARN ||
      !process.env.VPN_INFO_SERVICE_API_KEY
    ) {
      throw Error(
        "Missing required environment variables (EMAIL_FUNCTION_ARN, VPN_INFO_SERVICE_API_KEY)",
      );
    }

    const topic = new sns.Topic(this, "CustomAnalyticsTopic", {
      displayName: "Custom Analytics Topic",
    });

    // Entry point for the stack
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
      },
    );

    // decoupled from the stack as it is a generic function
    const emailFunction = lambda.Function.fromFunctionArn(
      this,
      "EmailFunction",
      process.env.EMAIL_FUNCTION_ARN,
    );

    const pageViewFunction = new lambda.Function(this, "PageViewFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/page-view"),
      handler: "page-view-function.handler",
      timeout: cdk.Duration.seconds(10),
    });

    topic.grantPublish(requestFunction);

    // Fan out to subscribers
    topic.addSubscription(new subs.LambdaSubscription(emailFormatterFunction));
    topic.addSubscription(new subs.LambdaSubscription(pageViewFunction));

    emailFormatterFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [emailFunction.functionArn],
      }),
    );

    // Define a CloudFormation output for the entry point function ARN
    new cdk.CfnOutput(this, "RequestFunctionARN", {
      value: requestFunction.functionArn,
    });
  }
}
