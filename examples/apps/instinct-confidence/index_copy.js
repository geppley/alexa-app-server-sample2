'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('confidence');

var TRPDataHelper = require('./confidence_helper.js');


app.launch(function(req, res) {
	var firstName;

	res.session('firstName',firstName);
	var prompt = 'Hello, I\'m Trusty, your T Rowe Price automated assistant.';
	
	console.log('launch: session'+' first name :'+ firstName + ' isempty: '+_.isEmpty(firstName));
	
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('confidence', {
		'slots': {
			'UserKey': 'string'
		},
		'utterances': ['{|what is my} {|confidence}','{|key|my key is} {-|UserKey}']		
		/*
		'slots': {
			'FIRSTNAME': 'AMAZON.US_FIRST_NAME'
		},
		'utterances': ['{|I am} {|my name is} {-|FIRSTNAME}']
		*/
	},
	 function(req, res) {
		//get the slot
		var  ses_firstName = req.session('firstName');
		var req_firstName = req.slot('FIRSTNAME');
		console.log('request: '+' first name :'+ req_firstName + ' isempty: '+_.isEmpty(req_firstName));
		console.log('session:'+' first name :'+ ses_firstName + ' isempty: '+_.isEmpty(ses_firstName));
		
		if (_.isEmpty(ses_firstName) && _.isEmpty(req_firstName)) { //both session and request do not have a name

			var prompt = 'I didn\'t hear that, please say your name again.';

			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//return true;
	    }
		else if(
			( _.isEmpty(ses_firstName) && !_.isEmpty(req_firstName) )
			|
			(ses_firstName !== req_firstName )
			) { //session doesn't exists, request does
			//go get user info from database
			res.session('firstName',req_firstName);
			var prompt = req_firstName + ', let me look up your info?';
			
			var dataHelper = new TRPDataHelper();
			console.log(dataHelper);
			dataHelper.readUserInfo(req_firstName);
			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//return true;		
		}
		else if (!_.isEmpty(ses_firstName) && !_.isEmpty(req_firstName)){ //session name exists, request
			//ask session 
			//get info
			var prompt = ses_firstName + ', what would you like to do?';

			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//return true;		
		}
		else {
			var prompt = 'I\'m confused, life if pointless';
			res.session('firstName',undefined);
			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//res.say(prompt).reprompt(prompt).shouldEndSession(false);
			//return true;		
		}
	}
);


module.exports = app;