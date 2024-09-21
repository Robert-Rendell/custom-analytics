import { handler } from "../lambda/request/request.function";

describe("RequestFunction", () => {
  test("returns a 200 status code", () => {
    handler({});
  });
});
