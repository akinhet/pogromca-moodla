function getSmartText(element) {
    const clone = element.cloneNode(true);
    const mathScripts = clone.querySelectorAll('script[type^="math/tex"]');
    mathScripts.forEach(script => {
        const tex = document.createTextNode(" " + script.textContent + " ");
        script.parentNode.insertBefore(tex, script);
    });
    return clone.innerText.trim();
}

function getCleanText(element) {
    // 1. Klonujemy element, żeby móc go modyfikować bez wpływu na stronę
    const clone = element.cloneNode(true);

    // 2. Znajdujemy wszystkie skrypty zawierające LaTeX
    const mathScripts = clone.querySelectorAll('script[type^="math/tex"]');

    mathScripts.forEach(script => {
        // Pobieramy czysty wzór
        const latex = script.textContent;
        
        // 3. KLUCZOWY MOMENT: Szukamy głównego kontenera tego wzoru.
        // W Moodle jest to zazwyczaj klasa .filter_mathjaxloader_equation.
        // Jeśli jej nie ma, bierzemy bezpośredniego rodzica skryptu.
        const container = script.closest('.filter_mathjaxloader_equation') || script.parentNode;

        // Tworzymy węzeł tekstowy z LaTeXem (dodajemy $ dla czytelności)
        const textNode = document.createTextNode(` $${latex}$ `);

        // 4. Podmieniamy CAŁY kontener (wraz z obrazkami/spanami MathJaxa) na sam tekst
        if (container && container.parentNode) {
            container.parentNode.replaceChild(textNode, container);
        }
    });

    // 5. Usuwamy ewentualne pozostałości po podglądach (MathJax_Preview)
    const previews = clone.querySelectorAll('.MathJax_Preview');
    previews.forEach(el => el.remove());

    // 6. Zwracamy czysty tekst, usuwając wielokrotne spacje i entery
    return clone.innerText.replace(/\s+/g, ' ').trim();
}


function extract_answers()
{
	const answers = document.getElementsByClassName("rightanswer");
	const questions = document.getElementsByClassName("qtext");
	const title = document.getElementsByClassName("page-header-headings");

	const question_struct = [{title: title[0].children[0].innerText}];

	for (let i = 0; i < answers.length; i++) {

		const temp = getCleanText(answers[i]).split('\n');
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
	
		let question = getCleanText(questions[i]).replace(/\n/g,'')
		const img = questions[i].querySelector('img');
		if (img)
			question += ' ' + img.getAttribute('src').split('/').pop();

		question_struct.push({question: question, answer: str});
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


print_answers(extract_answers());

// send_answers(extract_answers());
