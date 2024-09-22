import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
} from "@aws-sdk/client-sns";
import { CustomAnalyticsSNSMessage } from "../../types/CustomAnalyticsSNSMessage";

const snsClient = new SNSClient();

export async function handler(event: any) {
  const snsPayload: CustomAnalyticsSNSMessage = {
    browserAgent: "",
    ipAddress: "",
    dateTime: "",
    latLng: "",
    provider: "",
    vpn: false,
  };
  const params: PublishCommandInput = {
    Message: JSON.stringify(snsPayload), // Message to publish
    TopicArn: process.env.TOPIC_ARN, // Pass the topic ARN as an environment variable
  };

  try {
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    console.log("Message published to SNS:", result);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message published successfully!" }),
    };
  } catch (error) {
    console.error("Error publishing to SNS:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error publishing message" }),
    };
  }
}
