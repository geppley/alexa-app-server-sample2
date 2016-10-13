'use strict';
module.change_code = 1;

var _ = require('lodash');
var rp = require('request-promise');
var promise = require('bluebird');
var T2W = require('./numbers2words.js');

var USER_TABLE = 'UserInformation';

var localUrl = 'http://localhost:8000';
var localCredentials = {
	region: 'us-east-1'
	,accessKeyId: 'fake'
	,secretAccessKey: 'fake'
}

var dynasty = require('dynasty')(localCredentials,localUrl);

var ENDPOINT = 'http://fundfundamentals.xignite.com/xfundfundamentals.json/GetFundProfile?IdentifierType=Symbol&UpdatedSince=7/1/2012&_Token=A308C93FA5CC4820820DCF6664001DA3&Identifier=';
var ENDPOINT2 = 'http://fundfundamentals.xignite.com/xfundfundamentals.json/GetFundBenchmarks?IdentifierType=Symbol&UpdatedSince=7/1/2012&_Token=A308C93FA5CC4820820DCF6664001DA3&Identifier=';

function TRPDataHelper() {
}

TRPDataHelper.prototype.readUserInfo = function(UserKey){
	return dynasty.table(USER_TABLE).find({hash:UserKey,range:'Ram'});
	//return new Promise(function(resolve){
		//	resolve(dynasty.table(USER_TABLE).find({hash:UserKey,range:'Ram'}));
	//});
};

TRPDataHelper.prototype.formatUserConfidence = function(userInfo) {
	var template = _.template(' ${name} your retirement confidence is ${confidence}.')({
		confidence: userInfo.Confidence.ConfidenceNumber
		,name: userInfo.UserInfo.FName
	});
	console.log(userInfo);
	console.log('getConfidence  2' +template);
	return template;
};

TRPDataHelper.prototype.formatUserBalance = function(userInfo) {
	var balance = _.reduce(userInfo.AccountInfo, function(sum, n) {
		console.log('sum is '+sum+' n is '+n);
		return sum + _.toNumber(n.Balance);
	}, 0);
	var translator = new T2W("EN_US");
	console.log(translator.toWords(balance));
	var template = _.template(' ${name} your retirement account balance is ${amount} dollars.')({
		amount: translator.toWords(balance)
		,name: userInfo.UserInfo.FName
	});
	console.log(userInfo);
	console.log('balance  2' +template);
	return template;
};

TRPDataHelper.prototype.requestFundInfo = function(ticker) {
  return this.getFundInfo(ticker).then(
		function(response) {
			  console.log('success - received fund info for ' + ticker);
			  return response.body;
		}
	);
};

TRPDataHelper.prototype.getFundInfo = function(ticker) {
	var options = {
		method: 'GET',
		uri: ENDPOINT + ticker,
		resolveWithFullResponse: true,
		json: true
	};
	return rp(options);
};
TRPDataHelper.prototype.requestBench = function(ticker) {
  return this.getBench(ticker).then(
		function(response) {
			  console.log('success - received fund info for ' + ticker);
			  return response.body;
		}
	);
};

TRPDataHelper.prototype.getBench= function(ticker) {
	var options = {
		method: 'GET',
		uri: ENDPOINT2 + ticker,
		resolveWithFullResponse: true,
		json: true
	};
	return rp(options);
};
TRPDataHelper.prototype.formatFundInfo= function(fundInfo,bench) {
	console.log(fundInfo);
	console.log(bench);
  var fund = _.template('You selected the ${fundName} Fund.  The objective is ${objective}  The benchmark is ${benchName}')({
		fundName: fundInfo.Profile.FundName,
		objective: fundInfo.Profile.FundObjective,
		benchName: bench.Benchmarks[0].Name
	});
	return fund;
};


module.exports = TRPDataHelper;
