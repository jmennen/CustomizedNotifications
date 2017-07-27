'use strict';
const uuid = require('uuid');
const MAIN_TOPIC_ARN = process.env.mainTopicArn;

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

            var params = {
                Message: JSON.stringify(responseBody), /* required */
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
                Subject: 'NewTopic',
                // TargetArn: 'STRING_VALUE',
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
  get(id, callback) {
    if (typeof id !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Invalid ID'));
        return;
    }

    const params = {
        TableName: 'notification-topics',
        Key: {
            id: id
        },
    };

    this.db.get(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could not save record.'));
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
        callback(null, response);
    });
  }

  //TO_DO
  getAll(callback) {

    const params = {
        TableName: 'notification-topics',
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

                var params = {
                    Message: JSON.stringify(responseBody), /* required */
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
                    Subject: 'TopicDeleted',
                    // TargetArn: 'STRING_VALUE',
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

  //TO_DO
  update(id, content, callback) {
    const body = JSON.parse(content);
    if (typeof body.data.name !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Body did not contain a text property.'));
        return;
    }

    if (typeof id !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Invalid ID'));
        return;
    }

    const params = {
        TableName: 'notification-topics',
        Key: {
            id: id
        },
        AttributeUpdates: {
          name: {
            Action: "PUT",
            Value: body.data.name
          }
        },
    };

    this.db.update(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could not save record.'));
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result),
        };
        callback(null, response);
    });

  }



}

module.exports = Topics;
