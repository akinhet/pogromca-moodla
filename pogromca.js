String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

const answers = document.getElementsByClassName("rightanswer");
const questions = document.getElementsByClassName("qtext");

// console.log(answers.length);
// console.log(questions.length);

const test = [];

for (var i = 0; i < answers.length; i++) {

  const temp = answers[i].innerText.split('\n');
  var str = "";

  for (var j = 0; j < temp.length; j++) {
    switch (temp[j]) {
      case 'Prawidłowymi odpowiedziami są:':
      case 'Poprawna odpowiedź to:':
      case '':
        break;

      default:
        str = str.concat(temp[j], "\n");
        break;
    }
  }

  test.push({hash: (questions[i].children[0].innerText+str).hashCode(), question: questions[i].children[0].innerText, answer: str});
}

for (var i = 0; i < test.length; i++) {
  console.log(test[i].hash);
  console.log(test[i].question);
  console.log(test[i].answer);
}
