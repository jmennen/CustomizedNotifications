options = {
  type: "basic",
  iconUrl: "icon.png",
  title: "My first Notification",
  message: "Hello Jan"
}
chrome.notifications.create(options, callback())

function callback(){

}
