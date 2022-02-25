/*!
 * jQuery Quiz Plugin
 * https://github.com/Reload-Lab/jQuery-quiz
 *
 * @updated February 25, 2022
 * @version 2.0
 *
 * @author Domenico Gigante - domenico.gigante@reloadlab.it
 * @copyright (c) 2022 Reload Laboratorio Multimediale - httpa://www.reloadlab.it
 * @license MIT
 */
 
(function($){
	
	var version = 2.0;
	
	// Customizable texts according to the language
	// (buttons, labels and error messages)
	var messages = {
		start: 'Start',
		prev: 'Back',
		next: 'Forward',
		results: 'Go to results',
		restart: 'Back to the top',
		error: 'Error',
		errmsg: [
			'Please choose an answer.',
			'Some questions have not been answered. Please, back to the top to answer all questions.'
		]
	}
	
	// Plugin
	$.quiz = $.fn.quiz = function(options){
		
		// Internal variables
		var quizJson,
			settings = {},
			intro,
			steps = 0,
			good = 0,
			first = 0,
			hashActual;
		
		// Visual variable
		var CONTAINER = typeof this == 'object'? this.first(): null,
			DIV = '<div>',

			QUIZ_ID = 'quiz-container',
			BODY_ID = 'quiz-body',
			BUTTONS_ID = 'quiz-buttons',
			PROGRESS_ID = 'quiz-progress',
			MODAL_ID = 'quiz-modal',

			FLEX_CLASS = 'quiz_flex',
			FLEXFILL_CLASS = 'quiz_flexfill',
			NUM_CLASS = 'quiz_num',
			ALERT_CLASS = 'quiz_alert',
			BTN_CLASS = 'quiz_btn',
			RESPONSE_CLASS = 'quiz_response',
			PROGRESSBAR_CLASS = 'quiz_progressbar',

			PLAY_ICO = '<i class="fa fa-play" aria-hidden="true"></i>',
			BACKWARD_ICO = '<i class="fa fa-step-backward" aria-hidden="true"></i>',
			FORWARD_ICO = '<i class="fa fa-step-forward" aria-hidden="true"></i>',
			REPEAT_ICO = '<i class="fa fa-repeat" aria-hidden="true"></i>',
			THUMBSUP_ICO = '<i class="fa fa-thumbs-up" aria-hidden="true"></i>',
			THUMBSDOWN_ICO = '<i class="fa fa-thumbs-down" aria-hidden="true"></i>';
		
		// Default settings
		var defaults = {
			quizJson: null,
			cookieExpire: 3600,
			hidePrevBtn: false,
			hideRestartBtn: false,
			fade: true,
			randomQuestions: false,
			numQuestions: false,
			
			// Events
			onStep: function(step, total){
				
				// Perform some operations at question change
				console.log(step);
			},
			onResults: function(good, total){
				
				// Perform some operations to show a message about the results
				console.log('results');
			},
			
			// Templates
			introTpl: '<div class="quiz_intro">' 
				// Quiz title
				+ '<h2><%this.title%></h2>' 
				// Quiz description
				+ '<%if(this.description){%>' 
				+ '<p><%this.description%></p>' 
				+ '<%}%>' 
				// end if
				+ '</div>',
			questionTpl: '<div class="' + FLEX_CLASS + '">' 
				+ '<div class="' + NUM_CLASS + '">' 
				// Quiz num question
				+ '<%this.question.num%>' 
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
				+ '<input type="radio" id="answer-<%this.answers[index].num%>" ' 
				+ 'name="question<%this.question.id%>" ' 
				+ 'value="<%this.answers[index].num%>" ' 
				
				// This data (quiz-name and quiz-value) are mandatory
				+ 'data-quiz-name="question<%this.question.id%>" ' 
				+ 'data-quiz-value="<%this.answers[index].num%>"'
				// § mandatory
				
				+ '<%this.answers[index].checked%>>' 
				+ '<label for="answer-<%this.answers[index].num%>"><span></span> ' 
				// Answer label
				+ '<%this.answers[index].answer%>' 
				+ '</label>' 
				+ '</div>'
				+ '<%}%>' 
				// end for
				+ '</div>' 
				+ '</div>',
			resultsTpl: '<div class="' + FLEX_CLASS + '">' 
				+ '<div class="' + NUM_CLASS + '">' 
				// Quiz num question
				+ '<%this.question.num%>' 
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
				+ '<%this.answer.num + 1%>'
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
				+ '</div>',
			startBtnTpl: '<button class="' + BTN_CLASS + '">' 
				// Button start
				+ '<%this.messages.start%>' 
				+ PLAY_ICO 
				+ '</button>',
			prevBtnTpl: '<button class="' + BTN_CLASS + '">' 
				+ BACKWARD_ICO 
				// Button previous
				+ '<%this.messages.prev%>' 
				+ '</button>',
			nextBtnTpl: '<button class="' + BTN_CLASS + '">' 
				// Button next
				+ '<%this.messages.next%>' 
				+ FORWARD_ICO 
				+ '</button>',
			resultBtnTpl: '<button class="' + BTN_CLASS + '">' 
				// Button go to results
				+ '<%this.messages.results%>' 
				+ FORWARD_ICO 
				+ '</button>',
			restartBtnTpl: '<button class="' + BTN_CLASS + '">' 
				+ REPEAT_ICO 
				// Button restart
				+ '<%this.messages.restart%>' 
				+ '</button>',
			modalBtnTpl: '<button class="' + BTN_CLASS + '" data-dismiss="modal">' 
				+ REPEAT_ICO 
				// Button restart (modal)
				+ '<%this.messages.restart%>' 
				+ '</button>',
			progressTpl: false
		};
		
		// Plugin methods
		var methods = {
			
			// Localization of messages
			localization: function(translation)
			{
				// If 'translation' is an Object...
				if(typeof translation == 'object'){
					
					// Change 'messages' with 'translation'
					$.extend(messages, translation);
				}
			}
		};
		
		// If 'options' is a string...
		if(typeof options == 'string'){
			
			// If 'options' is a method's name...
			if(methods[options]){
				
				// Call method
				return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
			} 
			
			// Else...
			else{
				
				// 'Options' must be the url to quiz json file
				options = {
					quizJson: options
				};
			}
		}
		
		// If 'options' is an object, but the url to quiz json file isn't set...
		if(typeof options == 'object' && !options.quizJson){
			
			// Search for data-quiz-json in container tag
			var url = CONTAINER.data('quizJson');
			
			// If 'url' is a string...
			if(typeof url == 'string'){
				
				options.quizJson = url;
			}
		}
		
		// Merge 'options' with 'defaults'
		$.extend(settings, defaults, options);
		
		
		/*** EVENTS ***/
		// Event: Intercept hash change
		$(window).bind('hashchange', function(e)
		{
			// If hide previous button is true...
			if(settings.hidePrevBtn){
				
				return;
			}
			
			// If hash is empty...
			if(window.location.hash == '' && hashActual != null){
				
				// Open first question or intro
				fadeFirst();
				return;
			}
			
			// Step ID
			var stepid = window.location.hash.substr(1).split('=')[1];
			
			// If step is an integer...
			if(/^\+?(0|[1-9]\d*)$/.test(stepid)){
				
				// If actual hash is disegual to step ID
				if(parseInt(hashActual) != parseInt(stepid)){
					
					// Open question
					fadeQuestion(stepid - 1);
				}
			} 
			
			// If step ID is equal to results...
			else if(stepid == 'results' && hashActual != stepid){
				
				// Open results
				fadeResults();
			}
		});
		
		
		/*** FUNCTIONS ***/
		// Function: Set up the quiz
		function init()
		{
			try{
				
				// Bootstrap 4 is required
				if(!$(document).modal){
					
					throw new Error('Bootstrap 4 is required');
				}
				
				// Set url to quiz json file
				if(!settings.quizJson){
					
					throw new Error('Set url to quiz json file');
				}
			}
			
			// Else...
			catch(e){
				
				// Get error
				console.error(e);
			}
			
			// Set HTML structure
			htmlStructure();
			
			// Get quiz json file via ajax
			$.getJSON(settings.quizJson + '?_=' + new Date().getTime())
				.done(function(data, textStatus, jqXHR)
				{
					// Questions
					quizJson = data[0].questions;
					
					// If randomize questions is true...
					if(settings.randomQuestions){
						
						shuffleQuestions(quizJson);
						settings.hidePrevBtn = true;
					}
					
					// If num questions is integer...
					if(typeof settings.numQuestions == 'number' && settings.numQuestions < quizJson.length){
						
						quizJson = quizJson.slice(0, parseInt(settings.numQuestions));
					}
					
					// Intro
					intro = data[0].intro? data[0].intro: false;
					
					// Number of questions
					steps = quizJson.length;
					
					// If there is a hash...
					if(!settings.hidePrevBtn && window.location.hash){
						
						// Step ID
						var stepid = window.location.hash.substr(1).split('=')[1];

						// If step is an integer...
						if(/^\+?(0|[1-9]\d*)$/.test(stepid)){
							
							// Open question
							fadeQuestion(stepid - 1);
						} 
						
						// If step is results...
						else if(stepid == 'results'){
							
							// Open results
							fadeResults();
						}
					} 
					
					// Else...
					else{
						
						// Open first question or intro
						fadeFirst();					
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown)
				{
					// Ajax error
					console.error('Fail');
					console.error('Error ' + textStatus);
					console.error('Incoming Text ' + jqXHR.responseText);
				});
		}
		
		// Function: Open first question or intro
		function openFirst()
		{
			// If is set html...
			if(htmlFirst()){
				
				// Unset actual hash
				hashChange('intro');
				
				// Set class to quiz body
				quizClass('step_intro');
				
				// Unset progress bar
				showProgress(0);
				
				// If 'onStep' is a function...
				if(typeof settings.onStep === 'function'){
					
					// Call onStep function
					settings.onStep.apply($('#' + QUIZ_ID), ['intro', steps]);
				}
			}
		}
		
		// Function: Fade first question or intro
		function fadeFirst()
		{
			// If fase is true...
			if(settings.fade){
				
				// Fadeout quiz body
				$('#' + BODY_ID)
					.fadeOut(300, function()
					{
						// Open first question or intro
						openFirst();
						
						// Fadein quiz body
						$('#' + BODY_ID).fadeIn(300);
					});
			} 
			
			// Else...
			else{
				
				// Open first question or intro
				openFirst();
			}
		}
		
		// Function: Open a question
		function openQuestion(id)
		{
			// Get question from quiz json
			var question = getQuestion(id);
			
			// If 'question' is set...
			if(question){
				
				// Question ID
				var id = question[0] + 1;
				
				// Set actual hash
				hashChange(id);
				
				// Insert html into quiz container
				htmlQuestion(question);
				
				// Set class to quiz body
				quizClass('step_' + id);
				
				// Set progress bar
				showProgress(id);
				
				// If 'onStep' is a function...
				if(typeof settings.onStep === 'function'){
					
					// Call onStep function
					settings.onStep.apply($('#' + QUIZ_ID), [id, steps]);
				}
			}
		}
		
		// Function: Fade a question
		function fadeQuestion(id)
		{
			// If fase is true...
			if(settings.fade){
				
				// Fadeout quiz body
				$('#' + BODY_ID)
					.fadeOut(300, function()
					{
						// Open question
						openQuestion(id);
						
						// Fadein quiz body
						$('#' + BODY_ID).fadeIn(300);
					});
			} 
			
			// Else...
			else{
				
				// Open question
				openQuestion(id);
			}
		}
		
		// Function: Open results
		function openResults()
		{
			// Set actual hash
			hashChange('results');
			
			// Insert html into quiz container
			htmlResults();
			
			// Set class to quiz body
			quizClass('step_results');
			
			// Unset progress bar
			showProgress(steps);
			
			// If 'onStep' is a function...
			if(typeof settings.onStep === 'function'){
				
				// Call onStep function
				settings.onStep.apply($('#' + QUIZ_ID), ['results', steps]);
			}
			
			// If 'onResults' is a function...
			if(typeof settings.onResults === 'function'){
				
				// Call onResult function
				settings.onResults.apply($('#' + QUIZ_ID), [good, steps]);
			}
		}
		
		// Function: Fade results
		function fadeResults()
		{
			// If fase is true...
			if(settings.fade){
				
				// Fadeout quiz body
				$('#' + BODY_ID)
					.fadeOut(300, function()
					{
						// Open results
						openResults();
						
						// Fadein quiz body
						$('#' + BODY_ID).fadeIn(300);
					});
			} 
			
			// Else...
			else{
				
				// Open results
				openResults();
			}
		}
	
		// Function: Returns a question starting from the id
		function getQuestion(id)
		{
			var question;
			
			// Search for question
			$.each(quizJson, function(i, q)
			{
				// If question key is equal to id...
				if(i == id){
					
					// Set array with key and question
					question = [i, q];
				}
			});
			
			return question;
		}
		
		// Function: Check for unanswered questions
		function hasErrors(id)
		{
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			var questionId;
			var result = true;
			
			// If cookie response doesn't exist...
			if(!response){
				
				// Set an empty cookie response
				response = {};
				setCookie('response', JSON.stringify(response), settings.cookieExpire);
			}
			
			// Search for unanswered questions
			$.each(quizJson, function(i, q)
			{
				questionId = 'question' + i;
				
				// If previous question is without answer...
				if(i < id && !response[questionId]){
					
					// Open modal
					showModal(messages.errmsg[1], true);
					
					result = false;
					return false;
				} 
				
				// If current question is without answer...
				else if(i == id && !response[questionId]){
					
					// Open modal
					showModal(messages.errmsg[0], false);
					
					result = false;
					return false;
				}
			});
			
			return result;
		}
	
		// Function: Check if it is the last question
		function hasLast(id)
		{
			var lastquestion = true;
			
			// Search for question
			$.each(quizJson, function(i, q)
			{
				// If question key is greater than id...
				if(i > id){
					
					lastquestion = false;
				}
			});
			
			return lastquestion;
		}
		
		// Function: Set actual hash
		function hashChange(id)
		{
			// If hide previous button is false...
			if(!settings.hidePrevBtn){
				
				switch(id){
					
					case 'intro':
						hashActual = null;
						window.location.hash = '';
					break;
					
					case 'results':
						hashActual = 'results';
						window.location.hash = 'step=results';
					break;
					
					default:
						hashActual = id;
						window.location.hash = 'step=' + id;
				}
			}
		}
		
		// Function: Randomize array in-place using Durstenfeld shuffle algorithm
		function shuffleQuestions(array)
		{
			for(var i = array.length - 1; i > 0; i--){
				
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
		
		// Function: Get html of quiz structure
		function htmlStructure()
		{
			// Append quiz to container
			var $quiz = $(DIV).prop('id', QUIZ_ID)
				.appendTo(CONTAINER);
			
			// Append body area to quiz
			$(DIV).prop('id', BODY_ID)
				.appendTo($quiz);
			
			// Append buttons area to quiz body
			$(DIV).prop('id', BUTTONS_ID)
				.attr('role', 'group')
				.appendTo($quiz);
			
			// Append progress area to quiz
			$(DIV).prop('id', PROGRESS_ID)
				.appendTo($quiz);
		}
		
		// Function: Set class attribute of quiz area
		function quizClass(css)
		{
			$('#' + QUIZ_ID)
				.removeClass()
				.addClass(css);
		}
		
		// Function: Empty body area e buttons area
		function htmlClear()
		{
			$('#' + BODY_ID).empty();
			$('#' + BUTTONS_ID).empty();
		}
		
		// Function: Get html of first question or intro
		function htmlFirst()
		{
			// Empty quiz body and quiz buttons areas
			htmlClear();
			
			// If the intro is set in the json... 
			if(intro){
				
				// Append intro to quiz body area
				$(TemplateEngine(settings.introTpl, intro))
					.appendTo('#' + BODY_ID);
				
				// Append start button to quiz buttons area
				$(TemplateEngine(settings.startBtnTpl, {
						'messages': messages
					}))
					.appendTo('#' + BUTTONS_ID)
					
					// Event: Start the quiz
					.on('click', function(e)
					{
						e.preventDefault();
						
						// Open first question
						fadeQuestion(first);
					});
				
				return true;
			} 
			
			// Open first question
			fadeQuestion(first);
		}
		
		// Function: Get html of a question
		function htmlQuestion(q)
		{	
			// Empty quiz body and quiz buttons areas
			htmlClear();
			
			var questionId = 'question' + q[0];
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			// Question object
			var question = q[1];
			question.id = q[0];
			question.num = q[0] + 1;
			
			// Answers array
			var answers = [];
			
			// Answers
			$.each(question.answers, function(i, r)
			{
				// Answer object
				var answer = r;
				answer.num = i;
				answer.checked = '';
				
				// If an answer has already been chosen for the question...
				if(response && response[questionId] && response[questionId] == i){
					
					answer.checked = ' checked';
				}
				
				// Push answer in answers array
				answers.push(answer);
			});
			
			// Append question to quiz body area
			$question = $(TemplateEngine(settings.questionTpl, {
					'question': question,
					'answers': answers
				}))
				.appendTo('#' + BODY_ID);
			
			try{
				
				var $input = $question.find('[data-quiz-name]');
				
				// If radio buttons exist...
				if($input.length){
					
					// Event: Record response
					$input.on('click', function(e)
					{
						// Get cookie response
						var response = JSON.parse(getCookie('response')) || {};
						
						var name = $(this).data('quizName');
						var value = $(this).data('quizValue');
			
						// New response
						var obj = {};
						obj[name] = '' + value;
						
						// Merge new response with other responses
						$.extend(response, obj);
						
						// Set cookie response
						setCookie('response', JSON.stringify(response), settings.cookieExpire);
					});
				} 
				
				// Else...
				else{
					
					// No response set
					throw new Error('No response set!');
				}
			}
			
			// Else no response set...
			catch(e){
				
				// Get error
				console.error(e);
			}
			
			// If hide previous button is false...
			if(!settings.hidePrevBtn){
				
				// Append prev button to quiz buttons area
				$(TemplateEngine(settings.prevBtnTpl, {
						'question': question,
						'messages': messages
					}))
					.appendTo('#' + BUTTONS_ID)
					
					// Event: Move on to the prev question
					.on('click', function(e)
					{
						e.preventDefault();
						
						// Question num
						var questnum = q[0];
						
						// If 'question ID' is less than zero...
						if((questnum - 1) < 0){
							
							// Open first question or intro
							fadeFirst();
						} 
						
						// Else...
						else{
							
							// Open previous question
							fadeQuestion(questnum - 1);
						}
					});
			}
			
			// If it is the last question...
			if(hasLast(q[0])){
				
				// Append results button to quiz buttons area
				$(TemplateEngine(settings.resultBtnTpl, {
						'question': question,
						'messages': messages
					}))
					.appendTo('#' + BUTTONS_ID)
					
					// Event: Show results
					.on('click', function(e)
					{
						e.preventDefault();
						
						// Question num
						var questnum = q[0];
						
						// If there isn't errors...
						if(hasErrors(questnum)){
							
							// Open results
							fadeResults();
						}
					});
			} 
			
			// Else if...
			else{
				
				// Append next button to quiz buttons area
				$(TemplateEngine(settings.nextBtnTpl, {
						'question': question,
						'messages': messages
					}))
					.appendTo('#' + BUTTONS_ID)
					
					// Event: Move on to the next question
					.on('click', function(e)
					{
						e.preventDefault();
						
						// Question num
						var questnum = q[0];
						
						// If there isn't errors...
						if(hasErrors(questnum)){
							
							// Open next question
							fadeQuestion(questnum + 1);
						}
					});
			}
		}
	
		// Function: Get html of results
		function htmlResults()
		{
			// Empty quiz body and quiz buttons areas
			htmlClear();
			
			// Reset good response
			good = 0;
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			// Search for question
			$.each(quizJson, function(i, q)
			{
				var questionId = 'question' + i;
				
				// Question object
				var question = q;
				question.id = i;
				question.num = i + 1;
				
				// Answers
				$.each(q.answers, function(i, r)
				{
					// If an answer has already been chosen for the question...
					if(response && response[questionId] && response[questionId] == i){
						
						// Answer object
						answer = r;
						answer.num = i;
						
						// If the answer is right...
						if(r.true == 1){
							
							// Correct answers
							good++;
						} 
					}
				});
				
				// Append question to quiz body area
				$question = $(TemplateEngine(settings.resultsTpl, {
						'question': question,
						'answer': answer || false
					}))
					.appendTo('#' + BODY_ID);
			});
			
			// If hide restart button is false...
			if(!settings.hideRestartBtn){
				
				// Append restart button to quiz buttons area
				$(TemplateEngine(settings.restartBtnTpl, {
						'messages': messages
					}))
					.appendTo('#' + BUTTONS_ID)
					
					// Event: Start over from the beginning
					.on('click', function(e)
					{
						e.preventDefault();
						
						// Empty cookie response
						var response = {};
						setCookie('response', JSON.stringify(response), settings.cookieExpire);
						
						// If randomize questions is true...
						if(settings.randomQuestions){
							
							shuffleQuestions(quizJson);
						}
					
						// Open first question or intro
						fadeFirst();
					});
			}
		}	
		
		// Function: Set progress bar, if it doesn't exists, and show/hide it
		function showProgress(id)
		{
			// Width of bar
			var perc = (id / steps) * 100;
			
			if(settings.progressTpl){
				
				// Progress object
				var progress = {
					'step': id,
					'total': steps,
					'percent': perc
				}
				
				// Append progress bar to quiz progress area
				$('#' + PROGRESS_ID)
					.html(TemplateEngine(settings.progressTpl, {
						'progress': progress
					}));
			} else{
				
				// Search for quiz progress area
				var $bar = $('#' + PROGRESS_ID)
					.find('.' + PROGRESSBAR_CLASS);
				
				// If no progress bar exist...
				if(!$bar.length){
					
					// Append progress bar to quiz progress area
					$bar = $('<div class="' + PROGRESSBAR_CLASS + '" ' 
						+ 'role="progressbar" ' 
						+ 'aria-valuenow="0" ' 
						+ 'aria-valuemin="0" ' 
						+ 'aria-valuemax="100">' 
						+ '</div>')
						.appendTo('#' + PROGRESS_ID);
				}
				
				// Set width and counter
				$bar.attr('aria-valuenow', perc)
					.css('width', perc + '%')
					.html(id + '/' + steps);
			}
		}
		
		// Function: Set bootstrap modal, if it doesn't exists, and show it
		function showModal(error, back)
		{
			// Search for modal
			var $mdl = $('#' + MODAL_ID);
			
			// If modal html doesn't exist...
			if(!$mdl.length){
	
				// Modal structure
				var html = '<div id="' + MODAL_ID + '" class="modal fade" role="dialog" aria-hidden="true" aria-labelledby="quiz_mdltitle" tabindex="-1">' 
					+ '<div class="modal-dialog modal-dialog-centered" role="document">' 
					+ '<div class="modal-content">';
				
				// Header
				html += '<div class="modal-header">' 
					+ '<h5 class="modal-title">' 
					+ messages.error 
					+ '</h5>' 
					
					// Close button
					+ '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' 
					+ '</div>';
				
				// Body
				html += '<div class="modal-body text-danger" aria-live="polite"></div>';
				
				// Footer
				html += '<div class="modal-footer"></div>';
				
				html += '</div>';
				html += '</div>';
				html += '</div>';
				
				// Append modal to body
				$(html).appendTo('body');
				
				// If hide restart button is false...
				if(!settings.hideRestartBtn){
					
					// Append restart button to quiz buttons area
					$(TemplateEngine(settings.modalBtnTpl, {
							'messages': messages
						}))
						.appendTo('#' + MODAL_ID + ' .modal-footer')
						
						// Event: Start over from the beginning
						.on('click', function(e)
						{
							e.preventDefault();
							
							// Empty cookie response
							var response = {};
							setCookie('response', JSON.stringify(response), settings.cookieExpire);
							
							// Open first question or intro
							fadeFirst();
						});
				}
			
				// Wait ten millisecond before to open modal 
				setTimeout(function()
				{
					showModal(error, back);
				}, 10);
			} 
			
			// Else...
			else{
				
				// Set error message and footer button, then open modal
				$mdl.find('.modal-body').text(error)
					.end().find('.modal-footer').css('display', back? 'flex': 'none')
					.end().modal('show');
			}
		}
		
	
		/*** COOKIE ***/
		// Set a cookie
		function setCookie(name, value, seconds)
		{
			var expires = '';
			
			// If seconds is set...
			if(seconds){
				
				// Set cookie expiring date
				var date = new Date();
				date.setTime(date.getTime() + (seconds * 1000));
				expires = '; expires=' + date.toUTCString();
			}
			
			document.cookie = name + '=' + (value || '')  + expires + '; path=/';
		}
		
		// Get a cookie
		function getCookie(name)
		{
			var nameEQ = name + '=';
			var ca = document.cookie.split(';');
			
			for(var i = 0; i < ca.length; i++){
				
				var c = ca[i];
				
				while(c.charAt(0) == ' '){
					
					c = c.substring(1, c.length);
				}
				
				if(c.indexOf(nameEQ) == 0){
					
					return c.substring(nameEQ.length, c.length);
				}
			}
			
			return null;
		}
		
		// Delete a cookie
		function eraseCookie(name)
		{
			document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
		
		
		/*** TEMPLATE ENGINE ***/
		// JavaScript template engine by Krasimir Tsonev
		// https://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
		function TemplateEngine(html, options)
		{
			var re = /<%(.+?)%>/g, 
				reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g, 
				code = 'with(obj) { var r=[];\n', 
				cursor = 0,
				result,  
				match;
			
			function add(line, js)
			{
				js? (code += line.match(reExp)? 
					line + '\n' : 'r.push(' + line + ');\n'):
					(code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
				
				return add;
			}
			
			while(match = re.exec(html)){
				
				add(html.slice(cursor, match.index))(match[1], true);
				cursor = match.index + match[0].length;
			}
			
			add(html.substr(cursor, html.length - cursor));
			
			code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
			
			try{
				
				result = new Function('obj', code).apply(options, [options]);
			}
			catch(err){
				
				console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
			}
			
			return result;
		}
		
	
		/*** INIT ***/
		init();
		
		return this;
	}
}(jQuery));