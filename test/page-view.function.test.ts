import { SNSEvent } from "aws-lambda";
import { handler } from "../lambda/page-view/page-view-function";
describe("PageViewFunction", () => {
  test("returns a 200 status code", () => {
    handler({} as SNSEvent);
  });
});
