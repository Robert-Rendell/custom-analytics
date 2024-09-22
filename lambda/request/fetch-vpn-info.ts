import { VPNInformation } from "./types/vpn-response";

export async function fetchVPNInformation(
  ipAddress: string,
): Promise<VPNInformation | void> {
  try {
    const vpnInfo = await fetch(
      `https://vpnapi.io/api/${ipAddress}?key=${process.env.VPN_INFO_SERVICE_API_KEY}`,
    )
      .then((res) => res.json())
      .then((json) => json);

    if ("message" in vpnInfo) {
      throw Error(vpnInfo.message);
    }

    return vpnInfo;
  } catch (e) {
    console.error(e);
    return;
  }
}
