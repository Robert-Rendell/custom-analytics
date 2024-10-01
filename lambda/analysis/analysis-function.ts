import { ScheduledHandler } from "aws-lambda";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const handler: ScheduledHandler = async (event) => {
  const sqsClient = new SQSClient();
  const queueUrl = process.env.QUEUE_URL;

  // TODO - only handles 10 messages at a time
  // Need to do some research to work out what is the standard way to handle more messages
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

  const s3Client = new S3Client();
  const bucketName = process.env.ANALYSIS_BUCKET_NAME;

  const message = JSON.stringify({});

  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `analysis/${Date.now()}.json`,
    Body: message,
    ContentType: "application/json",
  });

  try {
    await s3Client.send(putObjectCommand);
    console.log("Uploaded message to S3:", message);
  } catch (error) {
    console.error("Error uploading message to S3:", error);
  }
};
