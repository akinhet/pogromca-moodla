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
