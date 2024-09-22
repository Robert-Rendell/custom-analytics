import { SNSEvent } from "aws-lambda";

export async function handler(event: SNSEvent) {
  console.log(event);
  console.log(event.Records[0].Sns);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Page view function!" }),
  };
}
