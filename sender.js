console.log("dupa");

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message from the background script:");
  console.log(request.greeting);
  let input = document.getElementsByClassName("qtext")[0].innerText.replace(/\n/g, '');
  sendResponse({ response: input });
});
