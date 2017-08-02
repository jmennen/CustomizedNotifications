'use strict';

var https = require('https');
var request = require('request');

class CustomNotificationTools {
    
    
    /**
     * Create an Instance of the CustomNotificationTools and set the URL of the API for further function call via the instance.  
     *
     * @param {string} api - A String with the complete adress to the serverless backend API. (Without the "https" in the beginning)
     */
    constructor(api) {
        this.API_URL = api;
    }
     

    /**
     * Create a new topic
     * 
     * @param {string} name - The name of the new topic 
     * @param {requestCallback} callback  - Callback function with either the error message (if the calls fails) or the topicId (in the data element) when the topic was created. The topic Id is necessary to make further function calls.
     */
    createTopic(name, callback){
        if(typeof(name) === 'string'){
            const content = JSON.stringify({
                "data" : {
                    "name" : name
                    }
            });

            const params = {
                 method: 'POST',
                 uri: this.API_URL + 'topics/',
                 body: content
            }

            request(params, function (error, response, body) {
                if(error){
                    console.log('error:', error); // Print the error if one occurred 
                    callback('Problem with request', null);
                }else{
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                    console.log('body:', body); // Print the HTML for the Google homepage. 
                    callback(null, JSON.parse(body));
                }               
            });

        }else{
            console.log('The createTopic() function requires a string as an input');
            callback('The createTopic() function  requires a string as an input', null);
        }  
    }


    /**
     * Delete a topic
     * 
     * @param {string} id - The id of the new topic 
     * @param {requestCallback} callback  - Callback function with either the error message (if the calls fails) or the deleted topic element (Name and ID) when the topic was deleted.
     */
    deleteTopic(id, callback){
        if(typeof(id) === 'string'){
            const params = {
                 method: 'DELETE',
                 uri: this.API_URL + 'topics/' + id
            }

            request(params, function (error, response, body) {
                if(error){
                    console.log('error:', error); // Print the error if one occurred 
                    callback('Problem with request', null);
                }else{
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                    console.log('body:', body); // Print the HTML for the Google homepage. 
                    callback(null, JSON.parse(body));
                }               
            });

        }else{
            console.log('The deleteTopic() function requires a string as an input for id');
            callback('The deleteTopic() function  requires a string as an input for id', null);
        }  
    }

    /**
     * Get all topics
     * 
     * @param {requestCallback} callback  - Callback function with either the error message (if the calls fails) or an array of topics (called "data", where each element contains the name and the id). 
     */
    getAllTopics(callback){
        const params = {
                method: 'GET',
                uri: this.API_URL + 'topics/'
        }

        request(params, function (error, response, body) {
            if(error){
                console.log('error:', error); // Print the error if one occurred 
                callback('Problem with request', null);
            }else{
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('body:', body); // Print the HTML for the Google homepage. 
                callback(null, JSON.parse(body));
            }               
        });
 
    }

    /**
     * Send a notification
     * 
     * @param {string} topicId - The id of the topic of the notification
     * @param {string} subject - The subject of the notification
     * @param {string} msg - The message of the notification
     * @param {requestCallback} callback  - Callback function with either the error message (if the calls fails) or a success message if the notification gets delivered.
     */
    notify(topicId, subject, msg, callback){
        if(typeof(topicId) === 'string' && typeof(subject) === 'string' && typeof(msg) === 'string'){
            const content = JSON.stringify({
                data : {
                    topicId : topicId,
                    subject : subject,
                    message : msg
                    }
            });

            
            const params = {
                 method: 'POST',
                 uri: this.API_URL + 'notify/',
                 body: content
            }

            request(params, function (error, response, body) {
                if(error){
                    console.log('error:', error); // Print the error if one occurred 
                    callback('Problem with request', null);
                }else{
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                    console.log('body:', body); // Print the HTML for the Google homepage. 
                    callback(null, JSON.parse(body));
                }               
            });

        }else{
            console.log('The deleteTopic() function requires a string as an input for id');
            callback('The deleteTopic() function  requires a string as an input for id', null);
        }  
    }


    /**
     * The Frame of the callback function used by all methods in the CustomNotificationTools class.
     *
     * @callback requestCallback
     * @param {string} err - A String containing the error message. Is null if everything worked fine
     * @param {object} data - A JSON Object containing the response data. Is null if an error appeared
     */   

}

module.exports = CustomNotificationTools;