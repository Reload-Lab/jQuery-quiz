# jQuery Quiz Plugin
[![GitHub Release](https://img.shields.io/badge/release-2.0.0-green)](https://github.com/Reload-Lab/jQuery-quiz/releases)
[![GitHub License](https://img.shields.io/badge/license-MIT-orange)](https://github.com/Reload-Lab/jQuery-quiz/blob/main/LICENSE)

jQuery Quiz is a plugin that allows in a very simple way to create a quiz with questions and answers, using a JSON file that contains all the necessary data.

The data JSON file is loaded via AJAX, when the plugin is initialized. The user's response are saved in a cookie and the quiz is fully navigable through hash in the address bar.

### Dependencies
The plugin requires **jQuery 3** and **Bootstrap 4**. Also uses **Fontawesome 4.7.0** for icons.

### Installation
NPM
`npm install jquery-quiz`

Yarn
`yarn add jquery- quiz`

Bower
`bower install Reload-Lab/ jQuery-quiz`

### Example And Usage
To understand how the plugin works you can take a look at the contents of the *example/* directory. In particular to the **quiz.json** file, which is the quiz data file.

The **quiz.json** file contains a complete example of the properties that must be passed to the plugin to generate the quiz (intro, questions and answers).

Instead the **index.html** file contains an example of how to initialize the plugin.
You can see the script in action at this url:
https://www.reloadlab.it/cantieri/jQuery-quiz/example/

To initialize your quiz:
1.	Add the stylesheet in the head of your page:
```html
<link rel="stylesheet" type="text/css" href="path/to/quiz/folder/dist/ jquery.quiz.css">
```
2.	Add the plugin script:
```html
<script src="path/to/quiz/folder/dist/ jquery.quiz.min.js"></script>
```
3.	Call the *quiz* method on the DOM element that must contain the quiz:
```javascript
$(function () {
   $('#quiz_container').quiz('/web/path/to/file.json');
});
```

### Available Options
The *quiz* method accepts only one argument. You can just pass a string, contining a URL to the data JSON file. (You can pass a URL to the data JSON file through the *data-quiz-json* attribute of the quiz container element).
If you want to customize the plugin, you can instead pass several properties to the *quiz* method via a javascript object.

Below is the complete list of properties that can be set.

#### Configuration
|  Options | Type  | Descryption |
| ------------ | ------------ | ------------ |
| **quizJson**  | *String*  | The property is mandatory and contains the URL to the data JSON file, that contains the quiz questions and answers. *Default: null*  |
| **hidePrevBtn**  | *Boolean*  | If the property is set to true, the user will not be able to go back and change the previously chosen answer. *Default: false*  |
| **hideRestartBtn**  | *Boolean*  | If the property is set to true, the user will not be able to reset the quiz and go back to the beginning to repeat the quiz. *Default: false*  |
| **fade**  | *Boolean*  | If the property is set to true, an animation will be performed at each step to the next question. *Default: true*  |
| **randomQuestions**  | *Boolean*  | If the property is set to true, plugin sorts the questions randomly. *Default: false*  |
| **numQuestions**  | *Integer*  | The number of questions to load from the question set in the JSON file. *Default: null* (all questions)  |
| **cookieExpire**  | *Integer*  | Duration in seconds of the cookie that contains the responses to the questions choose by the user. If you set the value to -1, no cookies will be saved. *Default: 3600*  |

#### Events
|  Options | Type  | Descryption |
| ------------ | ------------ | ------------ |
| **onStep**  | *Function*  | Function that is performed before moving on to the next question. The function receives three arguments: *step* (question number), *total* (total number of questions) and *question* (Optional. An array containing the questions with the relative answers given by the user. Property *question.__response* contains the number of the choose answer)  |
| **onResults**  | *Function*  | Function that is performed when the results of the quiz are shown. It can be used to judge the score obtained based on the percentage of correct answers. The function receives three arguments: *good* (number of right questions), *total* (total number of questions) and *questions* (array containing all the questions with the relative answers given by the user. Property *questions[n].__response* contains the number of the choose answer at the *n* question)  |

#### Templates
You can customize the appearance of each step - from the intro page to the summary of the results - setting the following properties of the *options* object, which is passed as the only argument of the *quiz* method.
The plugin uses a small, but efficient, system for compiling templates. You can see how the script works at this link:
https://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
If you change the templates you may also need to revise the** jquery.quiz.css** file to align it with your template.

##### introTpl
Quiz introduction page template, that could contain a welcome message. The compiler passes to the template the parameters of the *intro* object present in the data JSON file. *Default:*
```javascript
'<div class="quiz_intro">' 
// Quiz title
+ '<h2><%this.title%></h2>' 
// Quiz description
+ '<%if(this.description){%>' 
+ '<p><%this.description%></p>' 
+ '<%}%>' 
// end if
+ '</div>'
```

##### questionTpl
Main template of the quiz, which must contain the question and its answers. The questions are presented to the user one at a time. The compiler passes to the template, one at a time, the elements of the *questions* array present in the data JSON file. 
Some properties are set by the plugin for its operation. These properties are: *question .__ id*, *question .__ num*, *answer .__ id*, *answer._num* and *answer .__ checked*.
*The RADIO-type INPUT field is mandatory* and must contain the two attributes *data-quiz-name* and *data-quiz-value*, set respectively on the *system uniq id* of the question and on that of the answer. Without these attributes the response will not be logged and an exception error will be thrown. *Default:*
```javascript
'<div class="' + FLEX_CLASS + '">' 
+ '<div class="' + NUM_CLASS + '">' 
// Quiz num question
+ '<%this.question.__num%>' 
+ '.</div>' 
+ '<div class="' + FLEXFILL_CLASS + '">'
+ '<h2>' 
// Quiz question
+ '<%this.question.question%>' 
+ '</h2>' 
// Quiz question description
+ '<%if(this.question.description){%>' 
+ '<p>' 
+ '<%this.question.description%>' 
+ '</p>' 
+ '<%}%>'
// end if 
// Cycle answers
+ '<%for(var index in this.answers){%>'
+ '<div class="quiz_radiogroup">' 
// Quiz radio
+ '<input type="radio" id="answer-<%this.answers[index].__id%>" ' 
+ 'name="question<%this.question.__id%>" ' 
+ 'value="<%this.answers[index].__id%>" ' 

// This data (quiz-name and quiz-value) are mandatory
+ 'data-quiz-name="quizUID_<%this.question.__id%>" ' 
+ 'data-quiz-value="<%this.answers[index].__id%>"'
// § mandatory

+ '<%this.answers[index].__checked%>>' 
+ '<label for="answer-<%this.answers[index].__id%>"><span></span> ' 
// Answer label
+ '<%this.answers[index].answer%>' 
+ '</label>' 
+ '</div>'
+ '<%}%>' 
// end for
+ '</div>' 
+ '</div>'
```

##### resultsTpl
Quiz results page template. The compiler passes to the template the *questions* array present in the data JSON file. *Default:*
```javascript
'<div class="' + FLEX_CLASS + '">' 
+ '<div class="' + NUM_CLASS + '">' 
// Quiz num question
+ '<%this.question.__num%>' 
+ '.</div>' 
+ '<div class="' + FLEXFILL_CLASS + '">'
+ '<h2>' 
// Quiz question
+ '<%this.question.question%>' 
+ '</h2>' 
// Quiz question description
+ '<%if(this.question.description){%>' 
+ '<p>' 
+ '<%this.question.description%>' 
+ '</p>' 
+ '<%}%>' 
// end if 
// Answer
+ '<%if(this.answer){%>' 
+ '<div class="' + RESPONSE_CLASS + '">' 
+ '<strong>' 
// Answer num
+ '<%this.answer.__num%>'
+ '.</strong> ' 
// Answer
+ '<%this.answer.answer%>' 
+ '</div>' 
// Correct response
+ '<%if(this.answer.true == 1){%>' 
+ '<div class="' + ALERT_CLASS + ' quiz_success">' 
+ THUMBSUP_ICO 
// Answer alert
+ '<%this.answer.alert%>' 
+ '</div>' 
// Else wrong response
+ '<%} else{%>' 
+ '<div class="' + ALERT_CLASS + ' quiz_fail">' 
+ THUMBSDOWN_ICO 
// Answer alert
+ '<%this.answer.alert%>' 
+ '</div>'
+ '<%}%>' 
// end if 
+ '<%}%>' 
// end if 
+ '</div>' 
+ '</div>'
```

##### startBtnTpl
Quiz start button template. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization section*. *Default:*
```javascript
'<button class="' + BTN_CLASS + '">' 
// Button start
+ '<%this.messages.start%>' 
+ PLAY_ICO 
+ '</button>'
```

##### prevBtnTpl
Button template to go back one question. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization* section. *Default:*
```javascript
'<button class="' + BTN_CLASS + '">' 
+ BACKWARD_ICO 
// Button previous
+ '<%this.messages.prev%>' 
+ '</button>'
```

##### nextBtnTpl
Button template to go forward a question. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization* section. *Default:*
```javascript
'<button class="' + BTN_CLASS + '">' 
// Button next
+ '<%this.messages.next%>' 
+ FORWARD_ICO 
+ '</button>'
```

##### resultBtnTpl
Button template to go to the quiz results page. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization* section. *Default:*
```javascript
'<button class="' + BTN_CLASS + '">' 
// Button go to results
+ '<%this.messages.results%>' 
+ FORWARD_ICO 
+ '</button>'
```

##### restartBtnTpl
Button template to reset the result and return to the beginning of the quiz. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization* section. *Default:*
```javascript
'<button class="' + BTN_CLASS + '">' 
+ REPEAT_ICO 
// Button restart
+ '<%this.messages.restart%>' 
+ '</button>'
```

##### modalBtnTpl
Bootstrap 4 modal button template to close the alert and return to the start of the quiz. The compiler passes to the template the *messages* object relating to the set language. To find out how to create a script localization file see the *Localization* section. *Default:*
```javascript
'<button class="' + BTN_CLASS + '" data-dismiss="modal">' 
+ REPEAT_ICO 
// Button restart (modal)
+ '<%this.messages.restart%>' 
+ '</button>'
```

##### progressTpl
Quiz progress bar template. The compiler passes to the template the *progress* object, which has three properties: *step*, *total* and *percent*. If the variable is set to false, the Bootstrap 4 progress bar is used. *Default: false*.

### Localization
To translate the different buttons and system messages of the plugin, you can use the *quiz* method directly connected to the jQuery object. The method must be called before the quiz is initialized and can be placed in a file inside the *i18n* folder.
```javascript
$.quiz('localization', {
   start: 'Start',
   prev: 'Back',
   next: 'Forward',
   results: 'Go to results',
   restart: 'Back to the top',
   error: 'Error',
   errmsg: [
      'Please choose an answer.',
      'Some questions have not been answered. Please, back to the top to answer all questions..'
   ]
});
```

### Customize the JSON file
Thanks to the flexibility of the compiler, it is possible to add new variables to the template. For example, you can insert an *image* property in the *intro* object of the JSON file and show the image by modifying the template in this way:
```json
"intro": {
   "title": "Geography Quiz",
   "description": "Test your geography knowledge with this capital cities quiz",
   "image": "https://pixabay.com/get/gb9e4aac249d049a0f627320ff699b6b81ac95de23a06ee7fcdb956e5031837c4284077c571e19676444ae73b532f4fbbf41f06af9a4364782359828124edd3630eadb15db44a51323855089376b0bcdd_1920.jpg"
},
```

```javascript
'<div class="quiz_intro">' 
// Quiz title
+ '<h2><%this.title%></h2>' 
// Quiz image
+ '<%if(this.image){%>' 
+ '<img class="quiz_intro_image" src="<%this.image%">' 
+ '<%}%>' 
// end if
// Quiz description
+ '<%if(this.description){%>' 
+ '<p><%this.description%></p>' 
+ '<%}%>' 
// end if
+ '</div>'
```

Standard HTML elements like images, videos embeds, headers, paragraphs, etc., can be used within text properties like *question*, *answer* and *alert*.
```json
"question": "The Question? <img src='path/to/image.png' />",
"description": null,
"answers": [{
	"answer": "Hungary",
	"alert": "<strong>Correct!</strong>",
	"true": 1
},
{
	"answer": "Slovenia",
	"alert": "<strong>Wrong!</strong> Budapest is the capital of Hungary.",
	"true": 0
},
{
	"answer": "Slovakia",
	"alert": "<strong>Wrong!</strong> Budapest is the capital of Hungary.",
	"true": 0
}]
```

### Stylesheets
The plugin automatically sets a css class on the root element of the quiz with id *quiz-container*. This css class is modified at each step and contains a reference to the question displayed (for example *step_intro*, *step_1*, *step_2*, ..., *step_results*). In this way it is possible to customize the appearance of each question through the stylesheets.

Created by Domenico Gigante - [Reload Laboratorio Multimediale](https://www.reloadlab.it "Reload Laboratorio Multimediale"), Rome, IT