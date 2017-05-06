var Nightmare= require('nightmare');
var nightmare = Nightmare({ show: true, typeInterval: 2});
var config = require('config-lite')({
	config_basedir: __dirname
});
var http = require('http');
var scanResult= [];
var Eventproxy= require('eventproxy');
var eventproxy= new Eventproxy();
var ticketList=[];
var idx=0;
var cheerio= require('cheerio');
var baseUrl= 'https://jira.successfactors.com/browse/';

eventproxy.on('DefectFinished', function(){
	console.log(ticketList.length);
	gotoDefectPage(ticketList[idx++]);
});

nightmare
	.goto(config.loginInfo.logoutUrl)
	.goto(config.loginInfo.loginUrl)
	.type('#login-form-username', config.loginInfo.employeeId)
	.type('#login-form-password', config.loginInfo.password)
	.click('#login-form-submit')
	.wait('#log_out')
	.goto('https://jira.successfactors.com/issues/?jql=')
	.type('#advanced-search', config.querySelector)
	.click('.search-options-container .search-button')
	.wait(2000)
	.click('.saved-search-operations ul li:last-child a')
	.wait('#bulkedit_all')
	.click('#bulkedit_all')
	.evaluate(function(){
		var ticketIdList= [];
		console.log('info', 'Login successfully!');
		var ticketList= document.querySelectorAll('#issuetable tbody tr');
		for(var idx=0; idx< ticketList.length; idx++){
			ticketIdList.push(ticketList[idx].getAttribute('data-issuekey'));
		}
		return ticketIdList;
	})
	.then(function(ticketIdList){
		ticketList= ticketIdList;
		eventproxy.emit('DefectFinished');
	})
	.catch(function (error) {
	  console.log('error', 'login failed!');
	});

function gotoDefectPage(defectId){
	var url= baseUrl+defectId;
	nightmare
	.goto(url)
	.click('#changehistory-tabpanel')
	.wait('.issuePanelWrapper .issuePanelContainer>div')
	.wait(2000)
	.evaluate(function(){
		var element= document.querySelector('.issuePanelWrapper .issuePanelContainer').innerHTML;
		return element;
	})
	.then(function(res){
		var tempResult= [];
		var $= cheerio.load(res);
		var tdList= $('div .changehistory tbody tr td');
		tdList.each(function(i, ele){
			tempResult.push($(this).text());
		})
		for(var idx=0; idx< tempResult.length; idx++){
			if(regValidation(config.queryCondition.key, tempResult[idx])&& regValidation(config.queryCondition.oldValue, tempResult[idx+1])&& regValidation(config.queryCondition.newValue, tempResult[idx+2])){
				scanResult.push(defectId);
				console.log(scanResult);

			}
		}
		eventproxy.emit('DefectFinished');
	})
	.catch(function (error) {
	  console.log('error', error);
	});
}

function regValidation(keyList, targetStr){
	for(var idx=0; idx< keyList.length; idx++){
		if(new RegExp(keyList[idx], 'i').test(targetStr)){
			return true;
		}
	}
	return false;
}


