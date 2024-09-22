import { SNSEvent } from "aws-lambda";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient();

export async function handler(event: SNSEvent): Promise<void> {
  console.log(event);

  const message = event.Records[0].Sns.Message;
  if (!process.env.EMAIL_FUNCTION_ARN) {
    throw Error("Missing required environment variables (EMAIL_FUNCTION_ARN)");
  }

  const payload = {
    subject: "New Page View",
    text: message,
  };

  const params = {
    FunctionName: process.env.EMAIL_FUNCTION_ARN,
    Payload: JSON.stringify(payload),
  };

  try {
    const command = new InvokeCommand(params);
    const response = await lambdaClient.send(command);
    console.log("Invoke response:", response);
  } catch (error) {
    console.error("Error invoking Lambda function:", error);
  }
}
