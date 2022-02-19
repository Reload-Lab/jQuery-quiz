/*!
 * jQuery Quiz Plugin
 * https://github.com/Reload-Lab/jQuery-quiz
 *
 * @updated February 18, 2022
 * @version 1.0
 *
 * @author Domenico Gigante - domenico.gigante@reloadlab.it
 * @copyright (c) 2022 Reload Laboratorio Multimediale - httpa://www.reloadlab.it
 * @license MIT
 */
 
(function($){
	
	var version = 1.0;
	
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
	$.quiz = $.fn.quiz = function(options)
	{
		// Internal variables
		var quizJson,
			settings = {},
			params,
			step = 0,
			good = 0,
			first = 0,
			hashActual;
		
		// Visual variable
		var CONTAINER = typeof this == 'object'? this.first(): null,
			QUIZ_ID = 'quiz_container',
			ANSWER_ID = 'quiz_answer',
			MODAL_ID = 'quiz_modal',
			MODAL_TITLE_ID = 'quiz_mdltitle',
			PROGRESS_ID = 'quiz_progress',
			BTN_START_ID = 'quiz_start',
			BTN_PREV_ID = 'quiz_prev',
			BTN_NEXT_ID = 'quiz_next',
			BTN_RESULTS_ID = 'quiz_results',
			BTN_RESTART_ID = 'quiz_restart',
			BTN_RESTART_MDL_ID = 'quiz_restart_modal',
			INTRO_CLASS = 'quiz_intro',
			FLEX_CLASS = 'quiz_flex',
			FLEXFILL_CLASS = 'quiz_flex-fill',
			NUM_CLASS = 'quiz_num',
			RADIO_CLASS = 'quiz_radio-button',
			ALERT_CLASS = 'quiz_alert',
			SUCCESS_CLASS = 'quiz_alert-success',
			FAIL_CLASS = 'quiz_alert-fail',
			BTN_START_CLASS = 'quiz_btn',
			BTN_CLASS = 'quiz_btn',
			BTN_GROUP_CLASS = 'quiz_btn-group',
			RESPONSE_CLASS = 'quiz_response',
			PROGRESS_CLASS = 'quiz_progress',
			PROGRESSBAR_CLASS = 'quiz_progress-bar',
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
			onResults: function(good, total)
			{
				
				// Perform some operations to show a message about the results
			}
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
		// Event: Record response
		$(document).on('click', '*[data-quiz-value]', function(e)
		{
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
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
		
		// Event: Start the quiz
		$(document).on('click', '#' + BTN_START_ID, function(e)
		{
			e.preventDefault();
			
			// Open first question
			openQuestion(first);
		});
	
		// Event: Move on to the prev question
		$(document).on('click', '#' + BTN_PREV_ID, function(e)
		{
			e.preventDefault();
			
			// Question ID
			var question = $(this).data('quizId');
			
			// If 'question ID' is less than zero...
			if((question - 1) < 0){
				
				// Open first question or intro
				openFirst();
			} 
			
			// Else...
			else{
				
				// Open previous question
				openQuestion(question - 1);
			}
		});
		
		// Event: Move on to the next question
		$(document).on('click', '#' + BTN_NEXT_ID, function(e)
		{
			e.preventDefault();
			
			// Question ID
			var question = $(this).data('quizId');
			
			// If there isn't errors...
			if(hasErrors(question)){
				
				// Open next question
				openQuestion(question + 1);
			}
		});
		
		// Event: Show results
		$(document).on('click', '#' + BTN_RESULTS_ID, function(e)
		{
			e.preventDefault();
			
			// Question ID
			var question = $(this).data('quizId');
			
			// If there isn't errors...
			if(hasErrors(question)){
				
				// Open results
				openResults();
			}
		});
		
		// Event: Start over from the beginning
		$(document).on('click', '#' + BTN_RESTART_ID + ', #' + BTN_RESTART_MDL_ID, function(e)
		{
			e.preventDefault();
			
			// Empty cookie response
			var response = {};
			setCookie('response', JSON.stringify(response), settings.cookieExpire);
			
			// Open first question or intro
			openFirst();
		});		 		
	
		// Event: Intercept hash change
		$(window).bind('hashchange', function(e)
		{
			// If hash is empty...
			if(window.location.hash == ''){
				
				// Open first question or intro
				openFirst();
				return;
			}
			
			// Step ID
			var stepid = window.location.hash.substr(1).split('=')[1];
			
			// If step is an integer...
			if(/^\+?(0|[1-9]\d*)$/.test(stepid)){
				
				// If actual hash is disegual to step ID
				if(parseInt(hashActual) != parseInt(stepid)){
					
					// Open question
					openQuestion(stepid - 1);
				}
			} 
			
			// If step ID is equal to results...
			else if(stepid == 'results'){
				
				// Open results
				openResults();
			}
		});
		
		
		/*** FUNCTIONS ***/
		// Function: Set up the quiz
		function init()
		{
			// Bootstrap 4 is required
			if(!$(document).modal){
				
				console.error('Bootstrap 4 is required');
				return;
			}
			
			// Set url to quiz json file
			if(!settings.quizJson){
				
				console.error('Set url to quiz json file');
				return;
			}
			
			// Append quiz container
			$('<div id="' + QUIZ_ID + '"></div>').appendTo(CONTAINER);
			
			// Append progress bar container
			$('<div id="' + PROGRESS_ID + '"></div>').appendTo(CONTAINER)
				.addClass(PROGRESS_CLASS);
			
			// Get quiz json file via ajax
			$.getJSON(settings.quizJson + '?_=' + new Date().getTime())
				.done(function(data, textStatus, jqXHR)
				{
					// Questions
					quizJson = data[0].questions;
					
					// Params
					params = data[0].params;
					
					// Number of questions
					step = quizJson.length;
					
					// If there is a hash...
					if(window.location.hash){
						
						// Step ID
						var stepid = window.location.hash.substr(1).split('=')[1];

						// If step is an integer...
						if(/^\+?(0|[1-9]\d*)$/.test(stepid)){
							
							// Open question
							openQuestion(stepid - 1);
						} 
						
						// If step is results...
						else if(stepid == 'results'){
							
							// Open results
							openResults();
						}
					} 
					
					// Else...
					else{
						
						// Open first question or intro
						openFirst();					
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
			// Get html
			var html = htmlFirst();
			
			// If is set html...
			if(html){
				
				// Unset actual hash
				hashActual = null;
				window.location.hash = '';
				
				// Insert html into quiz container
				$('#' + QUIZ_ID).html(html);
				
				// Unset progress bar
				showProgress(false);
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
				hashActual = id;
				window.location.hash = 'step=' + id;
				
				// Insert html into quiz container
				$('#' + QUIZ_ID).html(htmlQuestion(question));
				
				// Set progress bar
				showProgress(id);
			}
		}
		
		// Function: Open results
		function openResults(id)
		{
			// Set actual hash
			hashActual = 'results';
			window.location.hash = 'step=results';
			
			// Insert html into quiz container
			$('#' + QUIZ_ID).html(htmlResults());
			
			// Unset progress bar
			showProgress(false);
			
			// If 'onResults' is a function...
			if(typeof settings.onResults === 'function'){
				
				// Call onResult function
				settings.onResults.apply($('#' + QUIZ_ID), [good, step]);
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
		
		// Function: Get html of first question or intro
		function htmlFirst()
		{
			// If the intro is set in the json... 
			if(params.intro == 1){
				
				// An intro message is displayed
				var html = '<div class="' + INTRO_CLASS + '">' 
					+ params.intromessage 
					+ '<button id="' + BTN_START_ID + '" class="' + BTN_START_CLASS + '">' 
					+ messages.start 
					+ PLAY_ICO 
					+ '</button>' 
					+ '</div>';
			
				return html;
			} 
			
			// Else...
			else{
				
				// Open first question
				openQuestion(first);
			}						
		}
		
		// Function: Get html of a question
		function htmlQuestion(q)
		{	
			var questionId = 'question' + q[0];
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			var html = '<div class="' + FLEX_CLASS + '">';
			
			// Question number
			html += '<div class="' + NUM_CLASS + '">' 
				+ (q[0] + 1) 
				+ '.</div>';
			
			html += '<div class="' + FLEXFILL_CLASS + '">';
			
			// Question text
			html += '<h2>' 
				+ q[1].question 
				+ '</h2>';
			
			// Question description
			if(q[1].description){
				
				html += '<p>' 
					+ q[1].description 
					+ '</p>';
			}
			
			// Answers
			$.each(q[1].answers, function(i, r)
			{
				var checked = '';
				
				// If an answer has already been chosen for the question...
				if(response && response[questionId] && response[questionId] == i){
					
					checked = ' checked';
				}
				
				// Input and Label
				html += '<div class="' + RADIO_CLASS + '">' 
					+ '<input type="radio" id="' + ANSWER_ID + '-' + i + '" ' 
					+ 'name="question' + q[0] + '" ' 
					+ 'value="' + i + '" ' 
					+ 'data-quiz-name="question' + q[0] + '" ' 
					+ 'data-quiz-value="' + i + '"' + checked + '>' 
					+ '<label for="' + ANSWER_ID + '-' + i + '"><span></span> ' 
					+ r.answer 
					+ '</label>' 
					+ '</div>';
			});
		
			html += '</div>';
			html += '</div>';
			
			// If it is the last question...
			if(hasLast(q[0])){
				
				// Prev and Results buttons
				html += '<div class="' + BTN_GROUP_CLASS + '" role="group">' 
					+ '<button id="' + BTN_PREV_ID + '" class="' + BTN_CLASS + '" data-quiz-id="' + q[0] + '">' 
					+ BACKWARD_ICO 
					+ messages.prev 
					+ '</button>' 
					+ '<button id="' + BTN_RESULTS_ID + '" class="' + BTN_CLASS + '" data-quiz-id="' + q[0] + '">' 
					+ messages.results 
					+ FORWARD_ICO 
					+ '</button>' 
					+ '</div>';
			} 
			
			// Else if...
			else{
				
				// Prev and Next buttons
				html += '<div class="' + BTN_GROUP_CLASS + '" role="group">' 
					+ '<button id="' + BTN_PREV_ID + '" class="' + BTN_CLASS + '" data-quiz-id="' + q[0] + '">' 
					+ BACKWARD_ICO 
					+ messages.prev 
					+ '</button>' 
					+ '<button id="' + BTN_NEXT_ID + '" class="' + BTN_CLASS + '" data-quiz-id="' + q[0] + '">' 
					+ messages.next 
					+ FORWARD_ICO 
					+ '</button>' 
					+ '</div>';
			}
			
			return html;
		}
	
		// Function: Get html of results
		function htmlResults()
		{
			var html = '';
			
			// Reset good response
			good = 0;
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			// Search for question
			$.each(quizJson, function(i, q)
			{
				var questionId = 'question' + i;
				
				html += '<div class="' + FLEX_CLASS + '">';
				
				// Question number
				html += '<div class="' + NUM_CLASS + '">' 
					+ (i + 1) 
					+ '.</div>';
				
				html += '<div class="' + FLEXFILL_CLASS + '">';
				
				// Question text
				html += '<h2>' 
					+ q.question 
					+ '</h2>';
				
				// Question description
				if(q.description){
					
					html += '<p>' 
						+ q.description 
						+ '</p>';
				}
				
				// Answers
				$.each(q.answers, function(i, r)
				{
					// If an answer has already been chosen for the question...
					if(response && response[questionId] && response[questionId] == i){
						
						// If the answer is right...
						if(r.true == 1){
							
							// Correct answers
							good++;
							
							// Alert success
							html += '<div class="' + RESPONSE_CLASS + '"><strong>' 
								+ (i + 1) 
								+ '.</strong> ' 
								+ r.answer 
								+ '</div>' 
								+ '<div class="' + ALERT_CLASS + ' ' + SUCCESS_CLASS + '">' 
								+ THUMBSUP_ICO 
								+ r.alert 
								+ '</div>';
						} 
						
						// Else if is wrong...
						else{
							
							// Alert fail
							html += '<div class="' + RESPONSE_CLASS + '"><strong>' 
								+ (i + 1) 
								+ '.</strong> ' 
								+ r.answer 
								+ '</div>' 
								+ '<div class="' + ALERT_CLASS + ' ' + FAIL_CLASS + '">' 
								+ THUMBSDOWN_ICO 
								+ r.alert 
								+ '</div>';
						}
					}
				});
				
				html += '</div>';
				html += '</div>';
			});
			
			// Restart button
			html += '<button id="' + BTN_RESTART_ID + '" ' 
				+ 'class="' + BTN_CLASS + '">' 
				+ REPEAT_ICO 
				+ messages.restart 
				+ '</button>';
			
			return html;
		}	
		
		// Function: Set progress bar, if it doesn't exists, and show/hide it
		function showProgress(id)
		{
			// Width of bar
			var perc = (id / step) * 100;
			
			// Search for progress bar
			var bar = $('#' + PROGRESS_ID).show()
				.find('.' + PROGRESSBAR_CLASS);
			
			// If no progress bar exist...
			if(!bar.length){
				
				// Append progress bar to progress container
				bar = $('<div class="' + PROGRESSBAR_CLASS + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>')
					.appendTo('#' + PROGRESS_ID);
			}
			
			// Set width and counter
			bar.attr('aria-valuenow', perc)
				.css('width', perc + '%')
				.html(id + '/' + step);
			
			// If 'id' is false...
			if(!id){
				
				// Hide progress bar
				$('#' + PROGRESS_ID).hide();
			}
		}
		
		// Function: Set bootstrap modal, if it doesn't exists, and show it
		function showModal(error, back)
		{
			var mdl = $('#' + MODAL_ID);
			
			// If modal html doesn't exist...
			if(!mdl.length){
	
				// Append modal to body
				var html = '<div id="' + MODAL_ID + '" class="modal fade" role="dialog" aria-hidden="true" aria-labelledby="quiz_mdltitle" tabindex="-1">' 
					+ '<div class="modal-dialog modal-dialog-centered" role="document">' 
					 + '<div class="modal-content">';
				
				// Header
				html += '<div class="modal-header">' 
					+ '<h5 id="' + MODAL_TITLE_ID + '" class="modal-title">' 
					+ messages.error 
					+ '</h5>' 
					+ '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' 
					+ '</div>';
				
				// Body
				html += '<div class="modal-body text-danger" aria-live="polite"></div>';
				
				// Footer
				html += '<div class="modal-footer">' 
					+ '<button id="' + BTN_RESTART_MDL_ID + '" type="button" class="' + BTN_CLASS + '" data-dismiss="modal">' 
					+ REPEAT_ICO 
					+ messages.restart 
					+ '</button>' 
					+ '</div>';
				
				html += '</div>';
				html += '</div>';
				html += '</div>';
				
				$(html)
					.appendTo('body');
				
				// Wait ten millisecond before to open modal 
				setTimeout(function()
				{
					showModal(error, back);
				}, 10);
			} 
			
			// Else...
			else{
				
				// Set error message and footer button, then open modal
				mdl.find('.modal-body').text(error)
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
		
	
		/*** INIT ***/
		init();
		
		return this;
	}
}(jQuery));