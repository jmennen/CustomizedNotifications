'use strict';

class Notification {
    
    constructor(topicId, subject, message) {
        this.topicId = topicId;
        this.subject = subject;
        this.message = message;
    }
}

module.exports = Notification;