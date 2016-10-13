'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('confidence');

var TRPDataHelper = require('./confidence_helper.js');


app.launch(function(req, res) {
	var UserKey;

	res.session('UserKey',UserKey);
	var prompt = 'Hello, I\'m Trusty, your T Rowe Price automated assistant.';
	
	console.log('launch: session'+' UserKey:'+ UserKey);
	
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('confidence', {
		'slots': {
			'UserKey': 'string'
		},
		'utterances': ['{|what is my} {|confidence} {-|UserKey}','{|key|my key is} {-|UserKey}']		
		/*
		'slots': {
			'FIRSTNAME': 'AMAZON.US_FIRST_NAME'
		},
		'utterances': ['{|I am} {|my name is} {-|FIRSTNAME}']
		*/
	},
	 function(req, res) {
		//get the slot
		var  ses_UserKey = req.session('UserKey');
		var req_UserKey = req.slot('UserKey');
		console.log('request: '+' UserKey :'+ ses_UserKey + ' isempty: '+_.isEmpty(ses_UserKey));
		console.log('session:'+' UserKey :'+ ses_UserKey + ' isempty: '+_.isEmpty(ses_UserKey));
		
		if (_.isEmpty(ses_UserKey) && _.isEmpty(req_UserKey)) { //both session and request do not have a name

			var prompt = 'What is your key?';

			console.log(prompt);
			res.say(prompt).shouldEndSession(false); 
			return true;
	    }
		else if(!_.isEmpty(req_UserKey) ){
			//go get user info from database
			res.session('UserKey',req_UserKey);
			var prompt = 'let me look up your info?';
			console.log(prompt);
			
			var dataHelper = new TRPDataHelper(); 
 
			dataHelper.readUserInfo(req_UserKey).then(function(userInfo){
				var fuck = dataHelper.formatUserConfidence(userInfo);
				console.log('getConfidence  1' +fuck);
				res.say(fuck).shouldEndSession(false).send(); 
			}).catch(function(error){
				console.log(error);
				var response= 'I didn\'t have confidence figure';
				res.say(response).shouldEndSession(false).send(); 
			});	
			return false;
		}
		else {
			var prompt = 'I\'m confused, life if pointless';
			res.session('UserKey',undefined);
			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//res.say(prompt).reprompt(prompt).shouldEndSession(false);
			return true;		
		}
	}
);

app.intent('account-balance', {
		'slots': {
			'UserKey': 'string'
		},
		'utterances': ['{|what is my} {|account|balance} {|balance} {-|UserKey}','{|key|my key is} {-|UserKey}']		
		/*
		'slots': {
			'FIRSTNAME': 'AMAZON.US_FIRST_NAME'
		},
		'utterances': ['{|I am} {|my name is} {-|FIRSTNAME}']
		*/
	},
	 function(req, res) {
		//get the slot
		var  ses_UserKey = req.session('UserKey');
		var req_UserKey = req.slot('UserKey');
		console.log('request: '+' UserKey :'+ ses_UserKey + ' isempty: '+_.isEmpty(ses_UserKey));
		console.log('session:'+' UserKey :'+ ses_UserKey + ' isempty: '+_.isEmpty(ses_UserKey));
		
		if (_.isEmpty(ses_UserKey) && _.isEmpty(req_UserKey)) { //both session and request do not have a name

			var prompt = 'What is your key?';

			console.log(prompt);
			res.say(prompt).shouldEndSession(false); 
			return true;
	    }
		//else if( _.isEmpty(ses_UserKey) && !_.isEmpty(req_UserKey) ){//session doesn't exists, request does
		else if(!_.isEmpty(req_UserKey) ){
			//go get user info from database
			res.session('UserKey',req_UserKey);
			var prompt = 'let me look up your info?';
			console.log(prompt);
			
			var dataHelper = new TRPDataHelper(); 
 
			dataHelper.readUserInfo(req_UserKey).then(function(userInfo){
				var fuck = dataHelper.formatUserBalance(userInfo);
				console.log('getBalance  1' +fuck);
				res.say(fuck).shouldEndSession(false).send(); 
			}).catch(function(error){
				console.log(error);
				var response= 'Sorry, but I count not find your balance.';
				res.say(response).shouldEndSession(false).send(); 
			});	
			return false;
		}
		else {
			var prompt = 'I\'m confused, life if pointless';
			res.session('UserKey',undefined);
			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			//res.say(prompt).reprompt(prompt).shouldEndSession(false);
			return true;		
		}
	}
);

app.intent('fund-info', {
		'slots': {
			'TICKER': 'string'
			,'FIELD': 'string'
		},
		'utterances': ['{TICKER}','{find} {-|FIELD}']		
		/*
		'slots': {
			'FIRSTNAME': 'AMAZON.US_FIRST_NAME'
		},
		'utterances': ['{|I am} {|my name is} {-|FIRSTNAME}']
		*/
	},
	 function(req, res) {
		//get the slot
		var input = req.slot('TICKER');
		
		if (_.isEmpty(input)) { //both session and request do not have a name

			var prompt = 'Please provide a fund ticker';

			console.log(prompt);
			res.say(prompt).shouldEndSession(false); 
			return true;
	    }
		//else if( _.isEmpty(ses_UserKey) && !_.isEmpty(req_UserKey) ){//session doesn't exists, request does
		else if(!_.isEmpty(input) ){
			//go get user info from database			
			var dataHelper = new TRPDataHelper(); 
			dataHelper.requestFundInfo(input).then(function(fundInfo){
				
				dataHelper.requestBench(input).then(function(bench){
					var fund = dataHelper.formatFundInfo(fundInfo, bench);
					console.log(fund);
					res.say(fund).shouldEndSession(false).send(); 	
				}).catch(function(error){
					console.log(error);
					var response= 'Sorry, but I count not find that fund.';
					res.say(response).shouldEndSession(false).send(); 					
				});
			}).catch(function(error){
				console.log(error);
				var response= 'Sorry, but I count not find that fund.';
				res.say(response).shouldEndSession(false).send(); 
			});	
			return false;
		}
		else {
			var prompt = 'I\'m confused, life if pointless';
			console.log(prompt);
			res.say(prompt).shouldEndSession(false);
			return true;		
		}
	}
);


module.exports = app;