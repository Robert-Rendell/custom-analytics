![Alt text](./designs/20-09-24.svg)

# Lambda Functions

## Request Function
Fetches information about the request
### Input
```
{
    browserAgent: string;
    ipAddress: string;
    dateTime: string;
}
```
### Output
```
{
    browserAgent: string;
    ipAddress: string;
    dateTime: string;
    latLng: string;
    provider: string;
    vpn: boolean; 
}
```

## PageView Function
Records page views in DynamoDB for historical stats
### Input
```
{
    browserAgent: string;
    ipAddress: string;
    dateTime: string;
    latLng: string;
    provider: string;
    vpn: boolean; 
}
```
### Output
- None


## Email Formatter
Takes page views and put them into an email template
### Input
```
{
    browserAgent: string;
    ipAddress: string;
    dateTime: string;
    latLng: string;
    provider: string;
    vpn: boolean; 
}
```
### Output
- None