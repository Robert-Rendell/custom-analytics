import {
  DynamoDBClient,
  GetItemCommand,
  QueryInput,
  GetItemInput,
  PutItemCommand,
  PutItemCommandInput,
  ScanCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";

export class DynamoDBService {
  static ddb = new DynamoDBClient();

  public static async save(
    tableName: string,
    item: PutItemCommandInput["Item"],
  ) {
    const params: PutItemCommandInput = {
      TableName: tableName,
      Item: item,
    };

    await this.ddb.send(new PutItemCommand(params));
  }

  public static async load(
    tableName: string,
    primaryKeyName: string,
    key: string,
    sortKeyName?: string,
    sortKey?: string,
  ) {
    const params: GetItemInput = {
      TableName: tableName,
      Key: {
        [primaryKeyName]: { S: key },
      },
    };
    if (sortKey && sortKeyName && params.Key) {
      params.Key[sortKeyName] = { S: sortKey };
    }
    const response = await DynamoDBService.ddb.send(new GetItemCommand(params));
    if (!response) return undefined;
    return response.Item;
  }

  public static async list(
    tableName: string,
    expressionAttributeValueMap: QueryInput["ExpressionAttributeValues"],
    filterExpression: string,
  ): Promise<Record<string, AttributeValue>[] | undefined> {
    const params: QueryInput = {
      ExpressionAttributeValues: expressionAttributeValueMap,
      FilterExpression: filterExpression, // eg. 'contains (Subtitle, :topic)',
      TableName: tableName,
    };
    const response = await DynamoDBService.ddb.send(new ScanCommand(params));

    if (!response) return undefined;
    return response.Items;
  }
}
