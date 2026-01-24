function getSmartText(element) {
    const clone = element.cloneNode(true);
    const mathScripts = clone.querySelectorAll('script[type^="math/tex"]');
    mathScripts.forEach(script => {
        const tex = document.createTextNode(" " + script.textContent + " ");
        script.parentNode.insertBefore(tex, script);
    });
    // return clone.innerText.trim();
    return clone.textContent.trim();
}

// To zwróci tekst w stylu: "Oblicz $2+2$ wiedząc, że..."
function dupa(element) {
    const clone = element.cloneNode(true);
    
    // 1. Znajdź skrypty (magazyn oryginałów)
    const scripts = clone.querySelectorAll('script[type^="math/tex"]');
    
    scripts.forEach(script => {
        // Wyciągnij oryginał
        const originalString = script.textContent;
        
        // Stwórz tekst, który wygląda jak kod źródłowy (dodajemy dolary)
        const textNode = document.createTextNode(`$${originalString}$`);
        
        // Znajdź kontener MathJaxa (ten co robi bałagan) i podmień go na prosty tekst
        const container = script.closest('.filter_mathjaxloader_equation') || script.parentNode;
        
        // Jeśli struktura jest dziwna, podmień sam skrypt
        if (container.parentNode) {
            container.replaceWith(textNode);
        } else {
            script.replaceWith(textNode);
        }
    });

    // 2. Usuń wszelkie pozostałe śmieci wizualne MathJaxa
    clone.querySelectorAll('.MathJax, .MathJax_Preview, .MathJax_Display').forEach(el => el.remove());

    return clone.textContent.trim();
}

// function getMixedText(element) {
//     // 1. Pracujemy na kopii, żeby nie zepsuć strony
//     const clone = element.cloneNode(true);
//
//     // 2. Szukamy specyficznych kontenerów Moodle dla MathJaxa
//     // To jest ten <span>, który trzyma zarówno podgląd, jak i skrypt
//     const mathWrappers = clone.querySelectorAll('.filter_mathjaxloader_equation');
//
//     mathWrappers.forEach(wrapper => {
//         // Szukamy skryptu TYLKO wewnątrz tego wrappera
//         const script = wrapper.querySelector('script[type^="math/tex"]');
//
//         if (script) {
//             // Wyciągamy kod
//             const latex = script.textContent;
//             // Tworzymy element tekstowy
//             const textNode = document.createTextNode(` $${latex}$ `);
//
//             // PODMIENIAMY wrapper na tekst. 
//             // Dzięki temu tekst "dookoła" wrappera pozostaje nienaruszony.
//             wrapper.replaceWith(textNode);
//         }
//     });
//
//     // 3. Fallback: Jeśli MathJax jest w innej strukturze (nie Moodle'owej)
//     // Usuwamy wizualne śmieci MathJaxa, które mogły zostać
//     clone.querySelectorAll('.MathJax, .MathJax_Preview, .MathJax_Display').forEach(el => el.remove());
//
//     // Jeśli zostały jakieś luźne skrypty (poza wrapperami), zamieniamy je na tekst
//     clone.querySelectorAll('script[type^="math/tex"]').forEach(script => {
//         const textNode = document.createTextNode(` $${script.textContent}$ `);
//         script.replaceWith(textNode);
//     });
//
//     // 4. Zwracamy cały tekst znormalizowany (pojedyncze spacje)
//     return clone.innerText.replace(/\s+/g, ' ').trim();
// }

function extract_answers()
{
	const answers = document.getElementsByClassName("rightanswer");
	const questions = document.getElementsByClassName("qtext");
	const title = document.getElementsByClassName("page-header-headings");

	const question_struct = [{title: title[0].children[0].innerText}];

	for (let i = 0; i < answers.length; i++) {

		const temp = dupa(answers[i]).split('\n');
		// const temp = answers[i].textContent.split('\n');
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

		let question = dupa(questions[i]).replace(/\n/g,'')
		// let question = questions[i].textContent.replace(/\n/g,'')
		const img = questions[i].querySelector('img');
		if (img && !img.closest('.MathJax_Preview'))
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
