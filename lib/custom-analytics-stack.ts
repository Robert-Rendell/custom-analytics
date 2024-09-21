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
    if (!process.env.EMAIL_FUNCTION_ARN) {
      throw Error(
        "Missing required environment variables (EMAIL_FUNCTION_ARN)",
      );
    }

    // Entry point for the stack
    const requestFunction = new lambda.Function(this, "RequestFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/request"),
      handler: "request.handler",
      timeout: cdk.Duration.seconds(10),
    });

    const topic = new sns.Topic(this, "CustomAnalyticsTopic", {
      displayName: "Custom Analytics Topic",
    });

    const emailFunction = lambda.Function.fromFunctionArn(
      this,
      "EmailFunction",
      process.env.EMAIL_FUNCTION_ARN,
    );

    const pageViewFunction = new lambda.Function(this, "PageViewFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/page-view"),
      handler: "page-view.function.handler",
      timeout: cdk.Duration.seconds(10),
    });

    // Add trigger
    topic.grantPublish(requestFunction);

    // Fan out to subscribers
    topic.addSubscription(new subs.LambdaSubscription(emailFunction));
    topic.addSubscription(new subs.LambdaSubscription(pageViewFunction));

    // Define a CloudFormation output for the entry point function ARN
    new cdk.CfnOutput(this, "RequestFunctionARN", {
      value: requestFunction.functionArn,
    });
  }
}
