import { handler } from "../lambda/request/request-function";
import { SNSClient } from "@aws-sdk/client-sns";

jest.mock("@aws-sdk/client-sns");

describe("RequestFunction", () => {
  let mockSend: jest.SpyInstance;

  beforeAll(() => {
    mockSend = jest.spyOn(SNSClient.prototype, "send").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  test("runs without throwing errors", async () => {
    const mockedFetch = {
      location: {
        latitude: 1.0,
        longitude: 1.0,
        city: "city",
        region: "region",
        country: "country",
      },
      network: {
        autonomous_system_organization: "organization",
      },
      security: {
        vpn: true,
      },
    };
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve(mockedFetch),
    } as any);

    let errors;
    try {
      await handler({
        browserAgent: "Mozilla/5.0",
        ipAddress: "217.146.93.112",
        dateTime: "2021-10-10T00:00:00Z",
      });
    } catch (e) {
      errors = e;
    }

    expect(errors).toBeUndefined();
    expect(fetchMock).toHaveBeenCalled();
  });
});
