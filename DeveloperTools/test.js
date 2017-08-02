
console.log("Message 1");
const CustomNotificationTools = require('./index');
console.log("Message 2");
let tools = new CustomNotificationTools("https://kdi53jhksc.execute-api.us-east-1.amazonaws.com/dev/");
console.log("Message 3");

/**
tools.createTopic("Automatic testtopic 6", function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data);
    }
});


tools.deleteTopic("d286f410-7778-11e7-a43e-853fa5ee6f85", function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data);
    }
});


tools.getAllTopics(function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data);
    }
});


tools.notify("b02b8430-72d2-11e7-b8ec-0dce6219cc0c", "blablablub", "This is the most awesome message ever", function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data);
    }
});
*/
