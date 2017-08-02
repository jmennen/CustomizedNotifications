
console.log("Message 1");
const Tools = require('./tools');
console.log("Message 2");
let tools = new Tools("https://kdi53jhksc.execute-api.us-east-1.amazonaws.com/dev/");
console.log("Message 3");


tools.createTopic("Automatic testtopic 6", function(err, data){
    if(err){
        console.log(err)
    }else{
        console.log(data);
    }
    
});

