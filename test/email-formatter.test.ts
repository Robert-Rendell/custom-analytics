import { SNSEvent } from "aws-lambda";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { handler } from "../lambda/email-formatter/email-formatter-function";

jest.mock("@aws-sdk/client-lambda");

describe("email-formatter-function", () => {
  let mockSend: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_FUNCTION_ARN = "arn:aws:lambda:us-east-1:123456789012:function:emailFunction";
    mockSend = jest.spyOn(LambdaClient.prototype, 'send').mockImplementation();
  });

  it("should throw an error if EMAIL_FUNCTION_ARN is not set", async () => {
    delete process.env.EMAIL_FUNCTION_ARN;

    const event: SNSEvent = {
      Records: [
        {
          Sns: {
            Message: "Test message",
          },
        },
      ],
    } as any;

    await expect(handler(event)).rejects.toThrow(
      "Missing required environment variables (EMAIL_FUNCTION_ARN)"
    );
  });

  it("should log an error if invoking the email function fails", async () => {
    const event: SNSEvent = {
      Records: [
        {
          Sns: {
            Message: "Test message",
          },
        },
      ],
    } as any;

    const error = new Error("Invoke failed");
    mockSend.mockRejectedValueOnce(error);

    console.log = jest.fn();
    console.error = jest.fn();

    await handler(event);

    expect(console.log).toHaveBeenCalledWith(event);
    expect(console.error).toHaveBeenCalledWith("Error invoking Lambda function:", error);
  });
});