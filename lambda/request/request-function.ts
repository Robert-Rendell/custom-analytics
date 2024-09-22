import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
} from "@aws-sdk/client-sns";
import { CustomAnalyticsSNSMessage } from "../../types/CustomAnalyticsSNSMessage";
import { fetchVPNInformation } from "./fetch-vpn-info";
import { RequestFnEventBody } from "./types/event-body";

const snsClient = new SNSClient();

const isValidEvent = (event: any): event is RequestFnEventBody => {
  return event && event.browserAgent && event.ipAddress && event.dateTime;
};

export async function handler(event: any | RequestFnEventBody) {
  if (!isValidEvent(event)) {
    throw new Error(
      "Missing one or more required fields in payload: browserAgent, ipAddress, dateTime",
    );
  }

  const vpnInfo = await fetchVPNInformation(event.ipAddress);

  if (!vpnInfo) {
    throw new Error("Error fetching VPN information");
  }

  const snsPayload: CustomAnalyticsSNSMessage = {
    ...event,
    latLng: `${vpnInfo.location.latitude},${vpnInfo.location.longitude}`,
    provider: vpnInfo.network.autonomous_system_organization,
    vpn: vpnInfo.security.vpn,
    city: vpnInfo.location.city,
    region: vpnInfo.location.region,
    country: vpnInfo.location.country,
  };

  const params: PublishCommandInput = {
    Message: JSON.stringify(snsPayload),
    TopicArn: process.env.TOPIC_ARN,
  };

  const command = new PublishCommand(params);
  const result = await snsClient.send(command);
  console.log("Message published to SNS:", result);
}
