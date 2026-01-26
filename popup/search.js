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

function getSafeText(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('style, script:not([type^="math/tex"])').forEach(el => el.remove());
    const mathScripts = clone.querySelectorAll('script[type^="math/tex"]');
    mathScripts.forEach(script => {
        const latex = script.textContent;
        const textNode = document.createTextNode(` $${latex}$ `);
        script.replaceWith(textNode);
    });
    const junkClasses = [
        '.MathJax', 
        '.MathJax_Preview', 
        '.MathJax_Display', 
        '.MathJax_SVG',
        '.jax-element' // Czasem występuje w innych wersjach
    ];
    junkClasses.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    return clone.textContent.replace(/\s+/g, ' ').trim();
}

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

// async function searchimg()
// {
// 	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
//
// 	// Wykonujemy funkcję bezpośrednio na stronie użytkownika
// 	browser.scripting.executeScript({
// 		target: { tabId: tab.id },
// 		func: () => {
// 		// Ten kod uruchomi się na stronie (DOM)
// 		const img = document.querySelector('img');
// 		return img ? img.getAttribute('src') : "Nie znaleziono obrazka";
// 		}
// 	}).then(results => {
// 		// Wynik wraca do popupu
// 		document.getElementById('search').innerText = results[0].result;
// 		console.log(results[0].result);
// 		console.log("dupa");
// 	});
// }

async function searchpage()
{
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

	browser.scripting.executeScript({
		target: { tabId: tab.id },
		func: () => {
			function getSafeText(element) {
				const clone = element.cloneNode(true);
				clone.querySelectorAll('style, script:not([type^="math/tex"])').forEach(el => el.remove());
				const mathScripts = clone.querySelectorAll('script[type^="math/tex"]');
				mathScripts.forEach(script => {
					const latex = script.textContent;
					const textNode = document.createTextNode(` $${latex}$ `);
					script.replaceWith(textNode);
				});
				const junkClasses = [
					'.MathJax', 
					'.MathJax_Preview', 
					'.MathJax_Display', 
					'.MathJax_SVG',
					'.jax-element' // Czasem występuje w innych wersjach
				];
				junkClasses.forEach(selector => {
					clone.querySelectorAll(selector).forEach(el => el.remove());
				});
				return clone.textContent.replace(/\s+/g, ' ').trim();
			}

			const questions = [];
			const qs = document.querySelectorAll(".qtext");
			console.log(qs);
			qs.forEach((q) => {
				const img = q.querySelector('img');
				if (img && !img.closest('.MathJax_Preview'))
					questions.push(getSafeText(q).replaceAll("\\",'').replace(/\n/g,'') + ' ' + img.getAttribute('src').split('/').pop());
				else
					questions.push(getSafeText(q).replaceAll("\\",'').replace(/\n/g,''));
			});

			console.log(questions);
			return questions;
		}
	}).then(async (questions) => {
		console.log(questions[0]);
		const answers = document.getElementById("answers");
		answers.innerHTML = "";
		for (let j = 0; j < questions[0].result.length; j++) {
		// questions[0].result.forEach(async (q) => {
			let q = questions[0].result[j];
			const json = await fetch("https://pogromca.akinhet.xyz/api/questions?search="+q).then((resp) => resp.json());
			for (let i = 0; i < json.length; i++) {
				var child = document.createElement("div");

				child.classList.add("ans");
				child.innerHTML = "<b>" + json[i].question + "</b><br><br> -> " + json[i].answer;

				answers.appendChild(child);
			}
		}
	});
}


document.addEventListener('input', searchdb);
document.getElementById('image').addEventListener('click', searchpage);


function sendMessageToSender(tabs)
{
	for (const tab of tabs) {
		browser.tabs
			.sendMessage(tab.id, { greeting: "Hi from background script" })
			.then((response) => {
				console.log("Message from the content script:");
				console.log(response);
		// document.getElementById("search").value = response.response;
		searchpage();
		console.log(document.getElementById("search").value);
			});
	}
}


// window.addEventListener("load", () => {
// 	browser.tabs
// 		.query({
// 			currentWindow: true,
// 			active: true,
// 		})
// 		.then(sendMessageToSender);
// });
