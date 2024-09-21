const AWS = require("aws-sdk");

export async function handler(event: any) {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Page view function!" }),
  };
}
