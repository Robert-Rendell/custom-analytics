import { ScheduledHandler } from "aws-lambda";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

export const handler: ScheduledHandler = async (event) => {
  const sqsClient = new SQSClient();
  const queueUrl =
    "https://sqs.your-region.amazonaws.com/your-account-id/your-queue-name";

  const receiveMessageCommand = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 10,
  });

  try {
    const data = await sqsClient.send(receiveMessageCommand);
    if (data.Messages) {
      for (const message of data.Messages) {
        console.log("Received message:", message.Body);
      }
    }
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
  }
};
