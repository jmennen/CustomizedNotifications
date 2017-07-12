'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS();

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};


module.exports.notify = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function notify executed successfully!',
      input: event,
    }),
  };


  var params = {
    Message: 'Hello SNS I love to publish here :)', /* required */
    // MessageAttributes: {
      // '<String>': {
      //   DataType: 'JSON', /* required */
      //   BinaryValue: new Buffer('...') || 'STRING_VALUE',
      //   StringValue: 'STRING_VALUE'
      // },
      /* '<String>': ... */
    // },
    // MessageStructure: 'STRING_VALUE',
    // PhoneNumber: 'STRING_VALUE',
     Subject: 'My first message',
    // TargetArn: 'STRING_VALUE',
    TopicArn: 'arn:aws:sns:us-east-1:095380879276:notifications'
  };
  SNS.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });




  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
