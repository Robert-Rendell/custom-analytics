import { SNSEvent } from "aws-lambda";
import { PageViewsDynamoDbService } from "./dynamodb/page-view-dynamodb";
import { CustomAnalyticsSNSMessage } from "../../types/CustomAnalyticsSNSMessage";
import { PageViewV2 } from "./types/page-view";

export async function handler(event: SNSEvent) {
  console.log(event);
  const message = event.Records[0].Sns.Message;
  const {
    dateTime,
    latLng,
    ipAddress,
    city,
    country,
    region,
    pageRoute,
    vpn,
    provider,
    browserAgent,
  }: CustomAnalyticsSNSMessage = JSON.parse(message);

  const [lat, Lng] = latLng.split(",").map((val) => parseFloat(val));

  const pageView: PageViewV2 = {
    dateTime,
    ipAddress,
    ipLocation: {
      city,
      country,
      ll: [lat, Lng],
      region,
    },
    vpn,
    provider,
    userAgent: browserAgent,
  };

  const result = await PageViewsDynamoDbService.savePageView({
    pageView,
    pageUrl: pageRoute,
  });

  console.log(result.pageUrl, "Total unique views:", result.total);
}
