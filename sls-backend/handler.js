'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS();
const PLATFORM_APPLICATION_ARN = process.env.platformApplicationArn;
const MAIN_TOPIC_ARN = process.env.mainTopicArn;


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
    TopicArn: MAIN_TOPIC_ARN
  };
  SNS.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  callback(null, response);

};

/** REQUEST BODY:
{
	"data" : {
	      "registrationId" : "12345ABC"
	    }
}
*/
  module.exports.subscribe = (event, context, callback) => {
    //registrationId = msg.data.registrationId;
    if(event.body == null){
      const response = {
        statusCode: 400,
        body: JSON.stringify({
          message: "Request does not contain the registrationId",
          input: event,
        }),
      };
      callback(null, response);
    }else{
      //TO_DO: Check if body contains the right information
      var msg = JSON.parse(event.body);
      var registrationId = msg.data.registrationId;

      var EndpointParams = {
        PlatformApplicationArn: PLATFORM_APPLICATION_ARN,
        Token: registrationId,
        CustomUserData: 'My Test Value'
      };

      SNS.createPlatformEndpoint(EndpointParams, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred

          const response = {
            statusCode: 500,
            body: JSON.stringify({
              message: "Creation of Platform Endpoint failed"
            }),
          };
          callback(null, response);

        }else{
          console.log(data);           // successful response
          var EndpointArn = data.EndpointArn;

          var SubParams = {
            Protocol: 'application',
            TopicArn: MAIN_TOPIC_ARN,
            Endpoint: EndpointArn
          };

          SNS.subscribe(SubParams, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              const response = {
                statusCode: 500,
                body: JSON.stringify({
                  message: "Subscription failed"
                }),
              };
              callback(null, response);
            }else{
              console.log(data);           // successful response

              const response = {
                statusCode: 200,
                body: JSON.stringify({
                  message: "Subscription successful",
                  Subscription: data.SubscriptionArn
                }),
              };
              callback(null, response);
            }
          });

        }
      });

    }
  };
