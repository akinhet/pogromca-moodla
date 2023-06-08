async function searchdb()
{
  const searchval = document.getElementById("search").value;
  const answers = document.getElementById("answers");

  const json = await fetch("https://pogromca.akinhet.xyz/api/questions?search="+searchval).then((resp) => resp.json());


  console.log(json);
  answers.innerHTML = "";
  for (let i = 0; i < json.length; i++) {
    var li = document.createElement("li");
    // li.appendChild(document.createTextNode(json[i].question + "<br>" + json[i].answer));
    li.textContent = json[i].question + "<br>" + json[i].answer;
    answers.appendChild(li);
    console.log("dupa");
  }
}

document.addEventListener('input', searchdb);
