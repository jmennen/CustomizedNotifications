SUBSCRIBE_URL = "https://kdi53jhksc.execute-api.us-east-1.amazonaws.com/dev/"

function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    return;
  }

  // Send the registration token to your application server and create an AWS SNS Endpoint
  sendRegistrationId(registrationId, function (succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    if (succeed)
      chrome.storage.local.set({ registered: true });
  });
}

function sendRegistrationId(registrationId, callback) {
  // Send the registration token to your application server
  // in a secure way.
  chrome.storage.local.set({ registrationId: registrationId });
  msg = '{"data" : {"registrationId" : "' + registrationId + '"}}'
  //$.post(SUBSCRIBE_URL, JSON.stringify(data),  function( data ) {
  console.log("Nachricht: " + msg)
  $.post(SUBSCRIBE_URL + 'subscribe', msg, function (data) {
    console.log(data)
  });

  //REMOVE AFTER SETTING THE SUBSCRIBES TOPICS
  var dic = {
  "topics": [
    {
      "id":"sampleId1",
      "name":"Topic 1",
      "status": true
    },
    {
      "id":"sampleId2",
      "name":"Topic 2",
      "status": false
    },
    {
      "id":"sampleId3",
      "name":"Topic 3",
      "status": false
    },
    {
      "id":"sampleId4",
      "name":"Topic 4",
      "status": true
    },
  ]
};

chrome.storage.local.set(dic);
}


function firstRegistration() {
  chrome.storage.local.get("registered", function (result) {
    // If already registered, bail out.
    if (result["registered"]) {
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
  else {
    chrome.storage.local.set({ registered: false });
    console.log("unregister successful");

    //TO_DO: REMOVE AFTER TESTING
    //firstRegistration();
  }
}

//TO_DO
function subscribeTopics(topics) {
  // Subscribe to a selection of topics
  console.log("submit topic subscriptions");
  console.log(topics);
  return;
}

//TO_DO
function unsubscribeTopics(topics) {
  // Subscribe to a selection of topics
  console.log("submit topic subscriptions");
  console.log(topics);
  return;
}

//TO_DO: REMOVE AFTER TESTING
//chrome.gcm.unregister(unregisterCallback);

//USE AFTER TESTING
chrome.runtime.onInstalled.addListener(firstRegistration);
chrome.runtime.onStartup.addListener(firstRegistration);


chrome.gcm.onMessage.addListener(function (message) {
  console.log("Incoming message!");
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
  chrome.notifications.create(options, function () { })
});
