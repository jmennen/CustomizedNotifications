'use strict';
const uuid = require('uuid');

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
    console.log(id)
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

    this.db.delete(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(new Error('Could not save record.'));
            return;
        }

        // create a response
        const response = {
            statusCode: 200
        };
        callback(null, response);
    });
  }


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
