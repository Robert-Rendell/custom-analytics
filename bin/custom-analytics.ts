#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CustomAnalyticsStack } from "../lib/custom-analytics-stack";
import { config } from "dotenv";

config();

if (!process.env.AWS_ACCOUNT || !process.env.AWS_REGION)
  throw Error(
    "Missing required environment variables (AWS_ACCOUNT, AWS_REGION)",
  );

const app = new cdk.App();
new CustomAnalyticsStack(app, "CustomAnalyticsStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
