SUBSCRIBE_URL = "ENTER_API_URL_HERE"
GCM_ID = "ENTER_GCM_ID_HERE"

function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    return;
  }

  //Saces the registration Id for further requests
  chrome.storage.local.set({ registrationId: registrationId });

  // Send the registration token to your application server and create an AWS SNS Endpoint
  sendRegistrationId(registrationId, function (succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    if (succeed)
      chrome.storage.local.set({ registered: true });
  });
}

//CALLING CALLBACK MISSING TO set the "registered" variable
function sendRegistrationId(registrationId, callback) {
  // Send the registration token to your application server
  // in a secure way.
  msg = '{"data" : {"registrationId" : "' + registrationId + '"}}'
  //$.post(SUBSCRIBE_URL, JSON.stringify(data),  function( data ) {
  console.log("Nachricht: " + msg);
  $.post(SUBSCRIBE_URL + 'subscribe', msg, function (data) {
    if(data.message == "Subscription successful"){
      console.log(data);
      var inputTopics = data.topics;
      var saveTopics = [];
      var subTopics = [];
      for(i=0; i < inputTopics.length; i++){
        var topic = {
          "id":inputTopics[i].id,
          "name":inputTopics[i].name,
          "status": true
        }
        saveTopics.push(topic);
        subTopics.push(inputTopics[i].id);
      }
      chrome.storage.local.set({"topics": saveTopics});
      subscribeTopics(subTopics);
      callback(true);
    }else{
      console.log("Error");
      callback(false);
    }
  });

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
    var senderIds = [GCM_ID];
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
/**
 * {
      "data" : {
            "registrationId" : "12345ABC",
            "topicIDs" : ["ID1", "ID2", "ID3" ]
          }
    }
 *  
 */
function subscribeTopics(topics) {
  if(topics.length === 0){
    console.log("no topics to ubscribe");
    return;
  }
  console.log("submit topic subscriptions");
  console.log(topics);
  chrome.storage.local.get("registrationId", function (result) {
    if (result["registrationId"]) {
      var msg = {
        "data" : {
              "registrationId" : result["registrationId"],
              "topicIDs" : topics
            }
      }

      $.post(SUBSCRIBE_URL + 'subTopics', JSON.stringify(msg), function (data) {
        if(data.message == "Subscription successful"){
          console.log("Subscription successful");
        }else{
          console.log("Error");
        }
      });
      return;
      
    }  

  });
  
}

//TO_DO
function unsubscribeTopics(topics) {
  if(topics.length === 0){
    console.log("no topics to unsubscribe");
    return;
  }
  console.log("submit topic unsubscriptions");
  console.log(topics);
  chrome.storage.local.get("registrationId", function (result) {
    if (result["registrationId"]) {
      var msg = {
        "data" : {
              "registrationId" : result["registrationId"],
              "topicIDs" : topics
            }
      }

      $.post(SUBSCRIBE_URL + 'unsubTopics', JSON.stringify(msg), function (data) {
        console.log(data);
        if(data.message == "Unsubscribe successful"){
          console.log("Unsubscribe successful");
        }else{
          console.log("Error");
        }
      });
      return;
      
    }  

  });
}

//TO_DO: REMOVE AFTER TESTING
//chrome.gcm.unregister(unregisterCallback);

//USE AFTER TESTING
chrome.runtime.onInstalled.addListener(firstRegistration);
chrome.runtime.onStartup.addListener(firstRegistration);


chrome.gcm.onMessage.addListener(function (message) {
  console.log("Incoming message!");
  var msg = JSON.parse(message.data.default);
  console.log(msg);
  if(msg.topicId=="main" && msg.subject=="NewTopic"){
    
    chrome.storage.local.get("topics", function (result) {
      var topics = result.topics;
      var topic = {
          "id":msg.message.id,
          "name":msg.message.name,
          "status": false
        }
      topics.push(topic);
      chrome.storage.local.set({"topics": topics})
    });
    
    options = {
      type: "basic",
      iconUrl: "icon.png",
      title: "New Topic",
      message: "The topic " + msg.message.name + " was added. Subscribe now in the menu."
    }
  }else if(msg.topicId=="main" && msg.subject=="DeleteTopic"){
      chrome.storage.local.get("topics", function (result) {
        var topics = result.topics;
        var newTopics = topics.filter( topic =>  topic.id != msg.message.id );
        chrome.storage.local.set({"topics": newTopics})
      });
    options = {
      type: "basic",
      iconUrl: "icon.png",
      title: "Topic removed",
      message: "The topic " + msg.message.name + " was removed."
    }
  }else{
    options = {
      type: "basic",
      iconUrl: "icon.png",
      title: msg.subject,
      message: msg.message
  }
}
  chrome.notifications.create(options, function () { })
});