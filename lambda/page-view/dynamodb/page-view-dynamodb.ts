import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  PageUrl,
  PageView,
  PageViewerDocument,
  PageViewV2,
} from "../types/page-view";
import { DynamoDBService } from "./dynamodb-service";

export class PageViewsDynamoDbService extends DynamoDBService {
  public static readonly PartitionKey = "pageUrl";

  static {
    if (process.env.PAGE_VIEWS_DYNAMO_DB_TABLE === undefined) {
      throw new Error(
        "Missing env var: PAGE_VIEWS_DYNAMO_DB_TABLE is not defined",
      );
    }
  }
  private static PAGE_VIEWS_DYNAMO_DB_TABLE = process.env
    .PAGE_VIEWS_DYNAMO_DB_TABLE as string;

  public static async savePageView({
    pageUrl,
    pageView,
  }: {
    pageUrl: PageUrl;
    pageView: PageViewV2;
  }): Promise<PageViewerDocument> {
    const currentPage = (await PageViewsDynamoDbService.getPageView(
      pageUrl,
    )) ?? {
      pageUrl,
      views: <(PageView | PageViewV2)[]>[],
      total: 0,
    };
    const uniquePageViews = new Set(
      currentPage.views.map((pageView) => pageView.ipAddress),
    );
    currentPage.total = uniquePageViews.size;
    currentPage.views.push(pageView);
    const marshalled = marshall(currentPage);
    await super.save(
      PageViewsDynamoDbService.PAGE_VIEWS_DYNAMO_DB_TABLE,
      marshalled,
    );

    return currentPage;
  }

  public static async getPageView(
    key: string,
  ): Promise<PageViewerDocument | undefined> {
    const attributeMap = await super.load(
      PageViewsDynamoDbService.PAGE_VIEWS_DYNAMO_DB_TABLE,
      PageViewsDynamoDbService.PartitionKey,
      key,
    );
    if (!attributeMap) return undefined;
    return unmarshall(attributeMap) as PageViewerDocument;
  }
}
