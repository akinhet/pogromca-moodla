async function searchdb()
{
  const searchval = document.getElementById("search").value;
  const answers = document.getElementById("answers");

  const json = await fetch("https://pogromca.akinhet.xyz/api/questions?search="+searchval).then((resp) => resp.json());


  answers.innerHTML = "";
  for (let i = 0; i < json.length; i++) {
    var child = document.createElement("div");

    child.classList.add("ans");
    child.innerHTML = "<b>" + json[i].question + "</b><br><br> -> " + json[i].answer;

    answers.appendChild(child);
  }
}


document.addEventListener('input', searchdb);


function sendMessageToSender(tabs)
{
  for (const tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { greeting: "Hi from background script" })
      .then((response) => {
        console.log("Message from the content script:");
        console.log(response);
		document.getElementById("search").value = response.response;
		searchdb();
		console.log(document.getElementById("search").value);
      });
  }
}


window.addEventListener("load", () => {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then(sendMessageToSender);
});
