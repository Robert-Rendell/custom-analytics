import { SNSEvent } from "aws-lambda";
import { PageViewsDynamoDbService } from "./dynamodb/page-view-dynamodb";
import { CustomAnalyticsSNSMessage } from "../../types/CustomAnalyticsSNSMessage";

export async function handler(event: SNSEvent) {
  console.log(event);
  const message = event.Records[0].Sns.Message;
  const pageView: CustomAnalyticsSNSMessage = JSON.parse(message);

  const [lat, Lng] = pageView.latLng.split(",").map((val) => parseFloat(val));

  await PageViewsDynamoDbService.savePageView({
    pageView: {
      dateTime: pageView.dateTime,
      ipAddress: pageView.ipAddress,
      ipLocation: {
        city: pageView.city,
        country: pageView.country,
        eu: "", // Losing this
        ll: [lat, Lng],
        metro: 0, // Losing this
        range: [0, 0], // Losing this
        region: pageView.region,
        timezone: "", // Losing this
        area: 0, // Losing this
      },
    },
    pageUrl: pageView.pageRoute,
  });
}
