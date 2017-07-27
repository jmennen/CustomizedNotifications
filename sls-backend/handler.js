'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS();
const DYNAMO = new AWS.DynamoDB.DocumentClient();
const Topics = require('topics');

const PLATFORM_APPLICATION_ARN = process.env.platformApplicationArn;
const MAIN_TOPIC_ARN = process.env.mainTopicArn;

let topics = new Topics(DYNAMO, SNS);

/**
Management of Topics starts here
*/
/** REQUEST BODY for Create and Update Operations
{
	"data" : {
	      "name" : "Hallo Welt"
	    }
}
*/
module.exports.createTopic = (event, context, callback) => {
  console.log("request: " + JSON.stringify(event));
  topics.create(event.body, callback);
};

module.exports.readTopic = (event, context, callback) => {
  console.log("request: " + JSON.stringify(event));
  topics.get(event.pathParameters.id, callback);
};

module.exports.readAllTopics = (event, context, callback) => {
  console.log("request: " + JSON.stringify(event));
  topics.getAll(callback);
};

module.exports.updateTopic = (event, context, callback) => {
  console.log("request: " + JSON.stringify(event));
  topics.update(event.pathParameters.id,event.body, callback);
};

module.exports.deleteTopic = (event, context, callback) => {
  console.log("request: " + JSON.stringify(event));
  topics.delete(event.pathParameters.id, callback);
};

/**
Management of Topics ends here
*/


/**
Only for Test purporses
*/
module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

};

/**
Sending Notifications
*/
/** REQUEST BODY
{
	"data" : {
        "topicId" : "12345ABC",
        "subject" : "Hello World",
        "message" : "This is a sample message"
	    }
}
    */
module.exports.notify = (event, context, callback) => {
  if(event.body == null){
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Request does not contain any content",
        input: event,
      }),
    };
    console.log(event);
    callback(null, response);
  }else{
    //TO_DO: Check if body contains the right information
    const msg = JSON.parse(event.body);
    const topicId = msg.data.topicId;
    const subject = msg.data.subject;
    const message = msg.data.message; 
    console.log(topicId);
    var dbParams = {
      TableName : 'notification-topics',
      Key: {
        id: topicId
      },
    };
    DYNAMO.get(dbParams, function(err, data) {
          if (err){
            console.log(err);
            const response = {
                  statusCode: 500,
                  body: JSON.stringify({
                    message: "Topic not found"
                  }),
                };
                callback(null, response);
          }else{
            console.log(data.Item);

            var params = {
              Message: message,
              Subject: subject,
              TopicArn: data.Item.arn
            };
            SNS.publish(params, function(err, data) {
              if (err){
                console.log(err, err.stack); // an error occurred
                const response = {
                    statusCode: 500,
                    body: JSON.stringify({
                      message: "Publishing failed"
                    }),
                  };
                  callback(null, response);
              } 
              else{
                console.log(data);           // successful response
                const response = {
                  statusCode: 200,
                  body: JSON.stringify({
                    message: 'Notification sent successfully!',
                    input: event,
                  }),
                };
                callback(null, response);
              }     
            });
          }
    }); //END Dynamo.get

  }
};


/**
Subscription to the master topic
*/
/** REQUEST BODY
{
	"data" : {
	      "registrationId" : "12345ABC"
	    }
}
*/
module.exports.subscribe = (event, context, callback) => {
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
    }); //End of SNS.createPlatformEndpoint

  } // End of Check if event.body is null
}; // End subscribe function



/**
Subscription to a selection of topics
*/
/** REQUEST BODY
{
	"data" : {
	      "registrationId" : "12345ABC",
        "topicIDs" : ["ID1", "ID2", "ID3" ]
	    }
}
*/
module.exports.subTopics = (event, context, callback) => {
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
    const msg = JSON.parse(event.body);
    const registrationId = msg.data.registrationId;
    const topics = msg.data.topicIDs;

    for (var i = 0, len = topics.length; i < len; i++){
      //const topicID = JSON.stringify(topics[i]);
      const topicID = topics[i];      
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
          const EndpointArn = data.EndpointArn;
          
          console.log(topicID);
          //TO_DO Query ARNs from Database by using the IDs
          var dbParams = {
            TableName : 'notification-topics',
            Key: {
              id: topicID
              //id: "c87ac480-72b7-11e7-b0e7-af916de722f7"
            },
          };

          DYNAMO.get(dbParams, function(err, data) {
            if (err){
              console.log(err);
              const response = {
                    statusCode: 500,
                    body: JSON.stringify({
                      message: "Topic not found"
                    }),
                  };
                  callback(null, response);
            }else{
              console.log(data.Item);

              var SubParams = {
                Protocol: 'application',
                TopicArn: data.Item.arn,
                Endpoint: EndpointArn
              };

              SNS.subscribe(SubParams, function(error, result) {
                if (err) {
                  console.log(error, error.stack); // an error occurred
                  const response = {
                    statusCode: 500,
                    body: JSON.stringify({
                      message: "Subscription failed"
                    }),
                  };
                  callback(null, response);
                }else{
                  console.log(result);           // successful response

                  const response = {
                    statusCode: 200,
                    body: JSON.stringify({
                      message: "Subscription successful",
                      Subscription: data.SubscriptionArn
                    }),
                  };
                  callback(null, response);
                }
              }); //End of SNS.subscribe()
            } 
          }); //End of db.get()
        }
      });


    } //End for loop


  } // End of Check if event.body is null
}; // End of subTopic function
