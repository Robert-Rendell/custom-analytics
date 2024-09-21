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
    });

    const topic = new sns.Topic(this, "CustomAnalyticsTopic", {
      displayName: "Custom Analytics Topic",
    });

    const emailServiceLambda = lambda.Function.fromFunctionArn(
      this,
      "ExistingLambdaFunction",
      process.env.EMAIL_FUNCTION_ARN,
    );

    const pageViewFunction = new lambda.Function(this, "PageViewFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/page-view"),
      handler: "page-view.function.handler",
    });

    // Add trigger
    topic.grantPublish(requestFunction);

    // Fan out to subscribers
    topic.addSubscription(new subs.LambdaSubscription(emailServiceLambda));
    topic.addSubscription(new subs.LambdaSubscription(pageViewFunction));
  }
}
