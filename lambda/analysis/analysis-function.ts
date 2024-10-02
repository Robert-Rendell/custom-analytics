import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSHandler, SQSEvent } from "aws-lambda";

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      console.log(messageBody);
      console.log(
        `Successfully processed message with ID: ${record.messageId}`,
      );
    } catch (error) {
      console.error(
        `Error processing message with ID: ${record.messageId}`,
        error,
      );
    }
  }

  const s3Client = new S3Client();
  const bucketName = process.env.ANALYSIS_BUCKET_NAME;

  const message = JSON.stringify({
    count: event.Records.length,
  });

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
