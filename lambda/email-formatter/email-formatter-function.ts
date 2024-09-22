import { SNSEvent } from "aws-lambda";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient();

export async function handler(event: SNSEvent) {
  console.log(event);
  if (!process.env.EMAIL_FUNCTION_ARN) {
    throw Error(
      "Missing required environment variables (EMAIL_FUNCTION_ARN)",
    );
  }

  const params = {
    FunctionName: process.env.EMAIL_FUNCTION_ARN,
    Payload: JSON.stringify(event),
  };

  try {
    const command = new InvokeCommand(params);
    const response = await lambdaClient.send(command);
    console.log("Invoke response:", response);
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Email formatter function!" }),
  };
}
