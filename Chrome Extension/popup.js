document.addEventListener('DOMContentLoaded', function() {
  
    chrome.storage.local.get("topics", function (result) {
      // If already registered, bail out.
      console.log(result);
      var topics = result.topics;
      var myForm = document.getElementById("myForm");
      console.log(myForm); 

      for (var i = 0; i < topics.length; i++) {
          var checkBox = document.createElement("input");
          var label = document.createElement("label");
          checkBox.type = "checkbox";
          checkBox.value = topics[i].name;
          checkBox.id = topics[i].id;
          checkBox.checked = topics[i].status;
          myForm.appendChild(checkBox);
          myForm.appendChild(label);
          myForm.appendChild(document.createElement('br'));
          label.appendChild(document.createTextNode(topics[i].name));
      }
      
      var submit = document.createElement("input");
      submit.type = "button";
      submit.value = "Submit";
      console.log("Hallo");
      submit.addEventListener("click", function(){
        console.log("test");
        //alert("Halo");
        //Build new dic by checking the values from the form. Pass it to the background function and save it to the storage.
        topics_new = topics;
        var list = [];
        for (var i = 0; i < topics_new.length; i++) {
          var id = topics_new[i].id;
          if(document.getElementById(id).checked){
            list.push(id);
            topics_new[i].status = true;
          }else{
            topics_new[i].status = false;
          }
        }
        console.log({"topics": topics_new});
        chrome.storage.local.set({"topics": topics_new});
        chrome.extension.getBackgroundPage().subscribeTopics(list);
        window.close();
      });
      console.log(submit);
      myForm.appendChild(submit);
      //myForm.setAttribute("onsubmit", chrome.extension.getBackgroundPage().subscribeTopics(result.topics));
    });

  });
