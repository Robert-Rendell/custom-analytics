const AWS = require("aws-sdk");

exports.handler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Page view function!" }),
  };
};
