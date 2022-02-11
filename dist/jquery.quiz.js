/**
 * MIT License
 * 
 * Copyright (c) 2021 Reload - Laboratorio multimediale (https://www.reloadlab.it/)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
 
(function($){
	
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
			'Please choose an answer',
			'Some questions have not been answered. Please, back to the top to answer all questions'
		]
	}
	
	// Plugin
	$.quiz = $.fn.quiz = function(options){
		
		// Static variables
		var quizJson,
			params,
			step = 0,
			good = 0,
			first = 0,
			hashActual,
			container = typeof this == 'object'? this.first(): null,
			quiz = 'quiz_container',
			modal = 'quiz_modal',
			progress = 'quiz_progress';
		
		// Default settings
		var defaults = {
			quizJson: null,
			cookieExpire: 3600,
			onResults: function(good, total){
				
				// Perform some operations to show a message about the results
			}
		};
		
		// Plugin methods
		var methods = {
			
			// Localization of messages
			localization: function(translation){
				
				if(typeof translation == 'object'){
					
					text = $.extend(messages, translation);
				}
			}
		};
		
		// If options is a string...
		if(typeof options == 'string'){
			
			// If options is a method's name...
			if(methods[options]){
				
				// Call method
				return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
			} else{
				
				// Options must be the url to quiz json file
				options = {
					quizJson: options
				};
			}
		}
		
		// If options is an object, but the url to quiz json file isn't set...
		if(typeof options == 'object' && !options.quizJson){
			
			// Search for data-quiz-json in container tag
			var url = container.data('quizJson');
			if(url){
				
				options.quizJson = url;
			}
		}
		
		// Merge options with default settings
		var settings = $.extend(defaults, options);
		
		
		/*** EVENTS ***/
		// Event: Record response
		$(document).on('click', 'input[type="radio"]', function(e){
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			// New response
			var obj = {};
			obj[this.name] = this.value;
			
			// Merge new response with other responses
			response = $.extend(response, obj);
			
			// Set cookie response
			setCookie('response', JSON.stringify(response), settings.cookieExpire);
		});
		
		// Event: Start the quiz
		$(document).on('click', '#quiz_start', function(e){
			e.preventDefault();
			
			// Open first question
			openQuestion(first);
		});
	
		// Event: Move on to the next question
		$(document).on('click', '#quiz_prev', function(e){
			e.preventDefault();
			
			// Question ID
			var question = $(this).data('quizId');
			
			// If question ID is less than zero...
			if((question - 1) < 0){
				
				// Open first question or intro
				openFirst();
			} else{
				
				// Open previous question
				openQuestion(question - 1);
			}
		});
		
		// Event: Move on to the next question
		$(document).on('click', '#quiz_next', function(e){
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
		$(document).on('click', '#quiz_results', function(e){
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
		$(document).on('click', '#quiz_restart, #quiz_restart_modal', function(e){
			e.preventDefault();
			
			// Empty cookie response
			response = {};
			setCookie('response', JSON.stringify(response), settings.cookieExpire);
			
			// Open first question or intro
			openFirst();
		});		 		
	
		// Event: Intercept hash change
		$(window).bind('hashchange', function(e){
			
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
			
				if(parseInt(hashActual) != parseInt(stepid)){
					
					// Open question
					openQuestion(stepid - 1);
				}
			} 
			
			// If step is results...
			else if(stepid == 'results'){
				
				// Open results
				openResults();
			}
		});
		
		
		/*** FUNCTIONS ***/
		// Function: Set up the quiz
		function init(){
			
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
			$('<div id="' + quiz + '"></div>').appendTo(container);
			
			// Append progress bar container
			$('<div id="' + progress + '"></div>').appendTo(container)
				.addClass('quiz_progress');
			
			// Get quiz json file via ajax
			$.getJSON(settings.quizJson + '?_=' + new Date().getTime())
				.done(function(data, textStatus, jqXHR){
					
					// Qyestions
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
					} else{
						
						// Open first question or intro
						openFirst();					
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown){
					
					// Ajax error
					console.error('Fail');
					console.error('Error ' + textStatus);
					console.error('Incoming Text ' + jqXHR.responseText);
				});
		}
		
		// Function: Open first question or intro
		function openFirst(){
			
			// Get html
			var html = htmlFirst();
			if(html){
				
				// Unset actual hash
				hashActual = null;
				window.location.hash = '';
				
				// Insert html into quiz container
				$('#' + quiz).html(html);
				
				// Unset progress bar
				showProgress(false);
			}
		}
		
		// Function: Open a question
		function openQuestion(id){
			
			// Get question from quiz json
			var question = getQuestion(id);
			
			if(question){
				
				// Question ID
				var id = question[0] + 1;
				
				// Set actual hash
				hashActual = id;
				window.location.hash = 'step=' + id;
				
				// Insert html into quiz container
				$('#' + quiz).html(htmlQuestion(question));
				
				// Set progress bar
				showProgress(id);
			}
		}
		
		// Function: Open results
		function openResults(id){
			
			// Set actual hash
			hashActual = 'results';
			window.location.hash = 'step=results';
			
			// Insert html into quiz container
			$('#' + quiz).html(htmlResults());
			
			// Unset progress bar
			showProgress(false);
			
			// Call onResult function
			if(typeof settings.onResults === 'function'){
				
				settings.onResults.apply($('#' + quiz), [good, step]);
			}
		}
	
		// Function: Returns a question starting from the id
		function getQuestion(id){
			
			var question;
			
			// Search for question
			$.each(quizJson, function(i, q){
				
				// If question key is equal to id...
				if(i == id){
					
					// Set array with key and question
					question = [i, q];
				}
			});
			
			return question;
		}
		
		// Function: Check for unanswered questions
		function hasErrors(id){
			
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
			$.each(quizJson, function(i, q){
				
				questionId = 'question' + i;
				
				// Previous question with no answer
				if(i < id && !response[questionId]){
					
					// Open modal
					showModal(messages.errmsg[1], true);
					
					result = false;
					return false;
				} 
				
				// Current question with no answer
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
		function hasLast(id){
			
			var lastquestion = true;
			
			// Search for question
			$.each(quizJson, function(i, q){
				
				// If question key is greater than id...
				if(i > id){
					
					lastquestion = false;
				}
			});
			
			return lastquestion;
		}
		
		// Function: Get html of first question or intro
		function htmlFirst(){
			
			var items = [];
			
			// If the intro is set in the json... 
			if(params.intro == 1){
				
				// An intro message is displayed
				items.push('<div class="quiz_intro">');
				items.push(params.intromessage);
				items.push('<button id="quiz_start" class="quiz_btn">' + messages.start + '<i class="fa fa-play" aria-hidden="true"></i></button>');
				items.push('</div>');
			
				return items.join('');
			} else{
				
				// Open first question
				openQuestion(first);
			}						
		}
		
		// Function: Get html of a question
		function htmlQuestion(q){	
			
			var items = [];
			
			var questionId = 'question' + q[0];
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			items.push('<div class="quiz_flex">');
			
			// Question number
			items.push('<div class="quiz_num">' + (q[0] + 1) + '.</div>');
			
			items.push('<div class="quiz_flex-fill">');
			
			// Question text
			items.push('<h2>' + q[1].question + '</h2>');
			
			// Question description
			if(q[1].description){
				
				items.push('<p>' + q[1].description + '</p>');
			}
			
			// Answers
			$.each(q[1].answers, function(i, r){
				
				var checked = '';
				
				// If an answer has already been chosen for the question...
				if(response && response[questionId] && response[questionId] == i){
					
					checked = ' checked';
				}
				
				// Input and Label
				items.push('<div class="quiz_radio-button">');
				items.push('<input type="radio" id="quiz_answer-' + i + '" name="question' + q[0] + '" value="' + i + '"' + checked + '>');
				items.push('<label for="quiz_answer-' + i + '"><span></span> ' + r.answer + '</label>');
				items.push('</div>');
			});
		
			items.push('</div>');
			items.push('</div>');
			
			// If it is the last question...
			if(hasLast(q[0])){
				
				// Prev and Results buttons
				items.push('<div class="quiz_btn-group" role="group">');
				items.push('<button id="quiz_prev" class="quiz_btn" data-quiz-id="' + q[0] + '"><i class="fa fa-step-backward" aria-hidden="true"></i>' + messages.prev + '</button>');
				items.push('<button id="quiz_results" class="quiz_btn" data-quiz-id="' + q[0] + '">' + messages.results + '<i class="fa fa-step-forward" aria-hidden="true"></i></button>');
				items.push('</div>');
			} else{
				
				// Prev and Next buttons
				items.push('<div class="quiz_btn-group" role="group">');
				items.push('<button id="quiz_prev" class="quiz_btn" data-quiz-id="' + q[0] + '"><i class="fa fa-step-backward" aria-hidden="true"></i>' + messages.prev + '</button>');
				items.push('<button id="quiz_next" class="quiz_btn" data-quiz-id="' + q[0] + '">' + messages.next + '<i class="fa fa-step-forward" aria-hidden="true"></i></button>');
				items.push('</div>');
			}
			
			return items.join('');
		}
	
		// Function: Get html of results
		function htmlResults(){
			
			var items = [];
			
			// Reset good response
			good = 0;
			
			// Get cookie response
			var response = JSON.parse(getCookie('response'));
			
			// Search for question
			$.each(quizJson, function(i, q){
	
				var questionId = 'question' + i;
				
				items.push('<div class="quiz_flex">');
				
				// Question number
				items.push('<div class="quiz_num">' + (i + 1) + '.</div>');
				
				items.push('<div class="quiz_flex-fill">');
				
				// Question text
				items.push('<h2>' + q.question + '</h2>');
				
				// Question description
				if(q.description){
					
					items.push('<p>' + q.description + '</p>');
				}
				
				// Answers
				$.each(q.answers, function(i, r){
					
					// If an answer has already been chosen for the question...
					if(response && response[questionId] && response[questionId] == i){
						
						// If the answer is right...
						if(r.true == 1){
							
							// Correct answers
							good++;
							
							// Alert success
							items.push('<div class="quiz_response"><strong>' + (i + 1) + '.</strong> ' + r.answer + '</div>');
							items.push('<div class="quiz_alert quiz_alert-success">');
							items.push('<i class="fa fa-thumbs-up" aria-hidden="true"></i>' + r.alert);
							items.push('</div>');
						} else{
							
							// Alert fail
							items.push('<div class="quiz_response"><strong>' + (i + 1) + '.</strong> ' + r.answer + '</div>');
							items.push('<div class="quiz_alert quiz_alert-fail">');
							items.push('<i class="fa fa-thumbs-down" aria-hidden="true"></i>' + r.alert);
							items.push('</div>');
						}
					} else{
						
						//items.push('<div class="quiz_response"><strong>' + (i + 1) + '.</strong> ' + r.answer + '</div>');
					}
				});
				
				items.push('</div>');
				items.push('</div>');
			});
			
			// Restart button
			items.push('<button id="quiz_restart" class="quiz_btn"><i class="fa fa-repeat" aria-hidden="true"></i>' + messages.restart + '</button>');
			
			return items.join('');
		}	
		
		// Function: Set progress bar, if it doesn't exists, and show/hide it
		function showProgress(id){
			
			// Width of bar
			var perc = (id / step) * 100;
			
			// Search for progress bar
			var bar = $('#' + progress).show()
				.find('.quiz_progress-bar');
			
			// if no progress bar exist...
			if(!bar.length){
				
				// Append progress bar to progress container
				bar = $('<div class="quiz_progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>')
					.appendTo('#' + progress);
			}
			
			// Set width and counter
			bar.attr('aria-valuenow', perc)
				.css('width', perc + '%')
				.html(id + '/' + step);
			
			// If id is false...
			if(!id){
				
				// Hide progress bar
				$('#' + progress).hide();
			}
		}
		
		// Function: Set bootstrap modal, if it doesn't exists, and show it
		function showModal(error, back){
			
			var mdl = $('#' + modal);
			
			// If modal html doesn't exist, append one to body
			if(!mdl.length){
	
				var items = [];
				
				items.push('<div id="' + modal + '" class="modal fade" role="dialog" aria-hidden="true" aria-labelledby="quiz_mdltitle" tabindex="-1">');
				items.push('<div class="modal-dialog modal-dialog-centered" role="document">');
				items.push('<div class="modal-content">');
				
				// Header
				items.push('<div class="modal-header">');
				items.push('<h5 id="quiz_mdltitle" class="modal-title">' + messages.error + '</h5>');
				items.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
				items.push('</div>');
				
				// Body
				items.push('<div class="modal-body text-danger" aria-live="polite"></div>');
				
				// Footer
				items.push('<div class="modal-footer">');
				items.push('<button id="quiz_restart_modal" type="button" class="quiz_btn" data-dismiss="modal"><i class="fa fa-repeat" aria-hidden="true"></i>' + messages.restart + '</button>');
				items.push('</div>');
				
				items.push('</div>');
				items.push('</div>');
				items.push('</div>');
				
				$(items.join(''))
					.appendTo('body');
				
				// Wait ten millisecond before to open modal 
				setTimeout(function(){
					
					showModal(error, back);
				}, 10);
			} else{
				
				// Set error message and footer button, then open modal
				mdl.find('.modal-body').text(error)
					.end().find('.modal-footer').css('display', back? 'flex': 'none')
					.end().modal('show');
			}
		}
		
	
		/*** COOKIE ***/
		// Set a cookie
		function setCookie(name, value, seconds){
			
			var expires = '';
			
			// Set cookie expiring date
			if(seconds){
				
				var date = new Date();
				date.setTime(date.getTime() + (seconds * 1000));
				expires = '; expires=' + date.toUTCString();
			}
			
			document.cookie = name + '=' + (value || '')  + expires + '; path=/';
		}
		
		// Get a cookie
		function getCookie(name){
			
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
		function eraseCookie(name){
			   
			document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
		
	
		/*** INIT ***/
		init();
		
		return this;
	}
}(jQuery));