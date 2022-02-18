# jQuery-quiz
[![GitHub Release](https://img.shields.io/github/release/qubyte/rubidium.svg?style=flat-square)](https://github.com/Reload-Lab/jQuery-quiz/releases)
[![GitHub License](https://img.shields.io/github/license/prasathmani/tinyfilemanager.svg?style=flat-square)](https://github.com/Reload-Lab/jQuery-quiz/blob/main/LICENSE)

Jquery-quiz consente di creare un quiz, utilizzando un file JSON che contiene tutte le informazioni necessarie. Il file JSON viene caricato via AJAX quando il plugin viene inizializzato.
Le risposte vengono salvate in un cookie e il quiz è interamente navigabile attraverso gli hash nella url.

## Example And Usage
Date un'occhiata nella cartella example/ ai file quiz.json e index.html. 
- Il file quiz.json contiene un esempio completo delle proprietà che possono essere passate al plugin per generare il quiz (struttura, domande, risposte).
- Il file index.html contiene un esempio di come inizializzare il plugin.

To initialize your quiz:

```javascript
$(function () {
    $('#quiz_container').quiz('/web/path/to/file.json');
});
```
## Available Options
|  Options | Type  | Descryption |
| ------------ | ------------ | ------------ |
| **quizJson**  | *String*  | Web url al file JSON.  |
| **cookieExpire**  | *Integer*  | Durata del cookie che registra le risposte. Default: 3600  |
| **onResults**  |  *Function* | Funzione che viene eseguita quando vengono mostrati i risultati del test. Può essere utilizzata per dare un giudizio sul punteggio ottenuto sulla base delle percentuale di risposte giuste. Passa due parametri: *good* (numero di domande giuste) e *total* (numero totale delle domande)  |
## Adding HTML to Questions and Answers
Standard HTML elements like images, videos embeds, headers, paragraphs, etc., can be used within text values like question and a answer.

"question": "The Question? <img src='path/to/image.png' />",
"answers": [
    {"answer": "an <b>incorrect</b> answer", "correct": false},
    {"answer": "a <b>correct</b> answer",    "correct": true},
]
Created by Domenico Gigante - [Reload Laboratorio Multimediale](https://www.reloadlab.it "Reload Laboratorio Multimediale"), Rome, IT