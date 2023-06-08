function extract_answers()
{
  const answers = document.getElementsByClassName("rightanswer");
  const questions = document.getElementsByClassName("qtext");
  const title = document.getElementsByClassName("page-header-headings");

  const question_struct = [{title: title[0].children[0].innerText}];

  for (let i = 0; i < answers.length; i++) {

    const temp = answers[i].innerText.split('\n');
    let str = "";

    for (let j = 0; j < temp.length; j++) {
      switch (temp[j]) {
        case 'Prawidłowymi odpowiedziami są:':
        case 'Poprawna odpowiedź to:':
        case '':
          break;

        case 'Poprawną odpowiedzią jest "Fałsz".':
          str = str.concat("Fałsz");
          break;

        case 'Poprawną odpowiedzią jest "Prawda".':
          str = str.concat("Prawda");
          break;

        default:
          str = str.concat(temp[j]);
          if (j != temp.length - 1)
            str = str.concat("\n");
          break;
      }
    }

    question_struct.push({question: questions[i].children[0].innerText, answer: str});
  }

  return question_struct;
}


function print_answers(question_struct)
{
  console.log(question_struct[0].title);

  for (let i = 1; i < question_struct.length; i++) {
    console.log(question_struct[i].question, question_struct[i].answer);
  }
}


async function send_answers(question_struct)
{
  let title = question_struct[0].title;
  for (let i = 1; i < question_struct.length; i++) {
    try {
      const response = await fetch("https://pogromca.akinhet.xyz/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "question="+question_struct[i].question+"&answer="+question_struct[i].answer+"&title="+title,
      });

      const result = await response.json();
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
}


// print_answers(extract_answers());

send_answers(extract_answers());
