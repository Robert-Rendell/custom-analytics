import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam"; // For granting permissions
import { Construct } from "constructs";

export class CustomAnalyticsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an SNS Topic
    const topic = new sns.Topic(this, "MySNSTopic", {
      displayName: "My SNS Topic",
    });

    // Define the existing Lambda function by its ARN
    const existingLambdaArn =
      "arn:aws:lambda:<region>:<account-id>:function:<existing-function-name>";
    const existingLambda = lambda.Function.fromFunctionArn(
      this,
      "ExistingLambdaFunction",
      existingLambdaArn,
    );

    // Create the second (new) Lambda function
    const newLambdaFunction = new lambda.Function(this, "NewLambdaFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"), // Path to your new lambda code
      handler: "function2.handler", // Handler for the new Lambda function
    });

    // Create a Lambda function that publishes to the SNS topic
    const publisherLambda = new lambda.Function(this, "PublisherLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "publisher.handler",
    });

    // Grant publish permission to the publisher Lambda
    topic.grantPublish(publisherLambda);

    // Subscribe existing Lambda to SNS Topic
    topic.addSubscription(new subs.LambdaSubscription(existingLambda));

    // Subscribe new Lambda to SNS Topic
    topic.addSubscription(new subs.LambdaSubscription(newLambdaFunction));
  }
}
