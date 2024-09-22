export type CustomAnalyticsSNSMessage = {
    browserAgent: string;
    ipAddress: string;
    dateTime: string;
    latLng: string;
    provider: string;
    vpn: boolean; 
    city: string;
    region: string;
    country: string;
}