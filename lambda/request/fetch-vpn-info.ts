import { VPNInformation } from "./types/vpn-response";

export async function fetchVPNInformation(ipAddress: string) {
  try {
    const vpnInfo = await fetch(
      `https://vpnapi.io/api/${ipAddress}?key=${process.env.VPNInfoServiceAPIKey}`,
    )
      .then((res) => res.json())
      .then((json) => <VPNInformation>json);

    return vpnInfo;
  } catch (e) {
    console.error(e);
    return;
  }
}
