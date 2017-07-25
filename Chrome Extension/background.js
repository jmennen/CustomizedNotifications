/**
AWS.config.update({
  accessKeyId: "KEY_ID",
  secretAccessKey: "SECRET_KEY",
  region:'us-east-1'});
var sns = new AWS.SNS();
*/
SUBSCRIBE_URL = "https://h98rn279xh.execute-api.us-east-1.amazonaws.com/dev/subscribe"

function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    return;
  }

  // Send the registration token to your application server and create an AWS SNS Endpoint
  sendRegistrationId(registrationId, function(succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    if (succeed)
      chrome.storage.local.set({registered: true});
  });

  function sendRegistrationId(registrationId, callback) {
  // Send the registration token to your application server
  // in a secure way.
    msg = '{"data" : {"registrationId" : "12345"}}'
    //$.post(SUBSCRIBE_URL, JSON.stringify(data),  function( data ) {
    $.post(SUBSCRIBE_URL, msg,  function( data ) {
      console.log(data)
    });

  }


  //WRONG
  /**
  var params = {
    PlatformApplicationArn: 'arn:aws:sns:us-east-1:095380879276:app/GCM/google_notifications',
    Token: 'registrationId'
  };
  sns.createPlatformEndpoint(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }else{
      console.log(data);           // successful response
      snsSubscribe(data.EndpointArn);
      chrome.storage.local.set({registered: true});
    }
  });
*/
}

/**
function snsSubscribe(EndpointArn){
  var params = {
    Protocol: 'application',
    TopicArn: 'arn:aws:sns:us-east-1:095380879276:notifications',
    Endpoint: EndpointArn
  };
  sns.subscribe(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}
*/

/**function messageReceived(message) {
  // A message is an object with a data property that
  // consists of key-value pairs.

  // Concatenate all key-value pairs to form a display string.
  var messageString = "";
  for (var key in message.data) {
    if (messageString != "")
      messageString += ", "
    messageString += key + ":" + message.data[key];
  }
  console.log("Message received: " + messageString);

  // Pop up a notification to show the GCM message.
  options = {
    type: "basic",
    iconUrl: "icon.png",
    title: "SNS Notification",
    message: "messageString"
  }
  chrome.notifications.create(options, function(){})
}*/


function firstRegistration() {
  chrome.storage.local.get("registered", function(result) {
    console.log("Hello World");
    // If already registered, bail out.
    if (result["registered"]){
      console.log("registered");
      return;
    }


    console.log("unregistered");
    // Up to 100 senders are allowed.
    var senderIds = ["546889298246"];
    chrome.gcm.register(senderIds, registerCallback);
  });
}


function unregisterCallback() {
  if (chrome.runtime.lastError) {
    // When the unregistration fails, handle the error and retry
    // the unregistration later.
    console.log("unregister error");
    console.log(chrome.runtime.lastError);
    return;
  }
  else{
    chrome.storage.local.set({registered: false});
    console.log("unregister successful");

    //TO_DO: REMOVE AFTER TESTING
    firstRegistration();
  }
}

chrome.gcm.unregister(unregisterCallback);

//USE AFTER TESTING
//chrome.runtime.onInstalled.addListener(firstRegistration);
//chrome.runtime.onStartup.addListener(firstRegistration);


//chrome.gcm.onMessage.addListener(messageReceived(message));
chrome.gcm.onMessage.addListener(function(message){
  console.log("Incoming message!")
  var messageString = "";
  for (var key in message.data) {
    if (messageString != "")
      messageString += ", "
    messageString += key + ":" + message.data[key];
  }
  console.log("Message received: " + messageString);

  // Pop up a notification to show the GCM message.
  options = {
    type: "basic",
    iconUrl: "icon.png",
    title: "SNS Notification",
    message: "messageString"
  }
  chrome.notifications.create(options, function(){})
});
