'use strict';
const uuid = require('uuid');
const MAIN_TOPIC_ARN = process.env.mainTopicArn;
const Notification = require('notification');

class Topics {
  constructor(db, sns) {
    this.db = db;
    this.sns = sns;
  }

  create(content, callback) {

    const body = JSON.parse(content);
    const newId = uuid.v1();
    const newName = body.data.name;
    const db = this.db;
    const sns = this.sns;
    if (typeof body.data.name !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Body did not contain a text property.'));
        return;
    }

    var snsParams = {
      Name: newId
    };
    this.sns.createTopic(snsParams, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        callback(new Error('Could not create topic.'));
        return;
      }else {
        console.log(data);           // successful response
        const dbParams = {
            TableName: 'notification-topics',
            Item: {
                id: newId,
                name: newName,
                arn: data.TopicArn
            },
        };
        db.put(dbParams, (error, result) => {
            if (error) {
                console.error(error);
                callback(new Error('Could not save record.'));
                return;
            }
            
            console.log(result);
            // create a response
            const responseBody = {
              id: newId,
              name: newName
            }
            let notification = new Notification("main", "NewTopic", responseBody);

            var params = {
                Message: JSON.stringify(notification), 
                Subject: 'NewTopic',
                TopicArn: MAIN_TOPIC_ARN
            };
            sns.publish(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });

            const response = {
                statusCode: 200,
                body: JSON.stringify(responseBody)
            };
            callback(null, response);

        });
      }
    });

    /*


    */
  }

  //TO_DO
  getAll(callback) {

    const params = {
        TableName: 'notification-topics',
        AttributesToGet: [
            'id',
            'name'
        ],
    };

    this.db.scan(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could not save record.'));
            return;
        }

        // create a response
        console.log(result)
        const response = {
            statusCode: 200,
            body: JSON.stringify(result),
        };
        callback(null, response);
    });
  }


  delete(id, callback) {
    console.log(id);
    const sns = this.sns;
    if (typeof id !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Invalid ID'));
        return;
    }
    const queryId = id;

    const dbParams = {
        TableName: 'notification-topics',
        Key: {
            id: queryId
        },
        ReturnValues: "ALL_OLD"
    };

    this.db.delete(dbParams, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could not delete database entry.'));
            return;
        }
        console.log(result);
        const snsParams = {
            TopicArn: result.Attributes.arn
        };
        sns.deleteTopic(snsParams, (err, data) => {
            if (err){
                console.error(err);
                callback(new Error('Could not delete SNS topic.'));
                return;
            }else{
                console.log(data);           // successful response
                // create a response
                const responseBody = {
                    id: result.Attributes.id,
                    name: result.Attributes.name
                }

                let notification = new Notification("main", "DeleteTopic", responseBody);

                var params = {
                    Message: JSON.stringify(notification), 
                    Subject: 'TopicDeleted',
                    TopicArn: MAIN_TOPIC_ARN
                };
                sns.publish(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data);           // successful response
                });

                const response = {
                    statusCode: 200,
                    body: JSON.stringify(responseBody),
                };
                callback(null, response);
            }     

        });
    });
  }



}

module.exports = Topics;
