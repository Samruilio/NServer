var request = require('request').defaults({jar: true});
var cheerio = require('cheerio');
var AdmZip = require('adm-zip');
var fs = require('fs');

var Task = require('../app/models/task');
var currentTask;

var requestTime;
var fromDate;
var toDate;

var username;
var password;
var address;
var exportType;
var debtor;
var dateType;
var startDate;
var endDate;
var segmentType;
var emailTo;
var notificationEmailTo;

var companyNameConvention;
var segmentTypeConvention;

var retryTimes;
var tramadaAPIResult;

module.exports = function notifier() {
	//login();
	searchForIncompleteTasks();
};

function padZero(d) {
	d = d + '';
	return d.length < 2 ? '0' + d : d;
}

function diffMinute(ldate, gdate) {
	var date1 = new Date(ldate);
		var date2 = new Date(gdate);

		var diff = date2.getTime() - date1.getTime();
		var minute = 60 * 1000;

		return diff / minute;
}

function diffDay(ldate, gdate) {
		var date1 = new Date(ldate);
		var date2 = new Date(gdate);

		var diff = date2.getTime() - date1.getTime();
	    var day = 1000 * 60 * 60 * 24;

	    return diff / day;
}

function diffMonth(ldate, gdate) {
	return diffDay(ldate, gdate) / 30;
}

function diffYear(ldate, gdate) {
	return diffMonth(ldate, gdate) / 12;
}

function updateTask() {
	if(tramadaAPIResult === 'failed') {
		currentTask.completed = tramadaAPIResult;
	} else if(currentTask.repeat === 'Once') {
		currentTask.completed = 'true';
	} else {
		currentTask.completed = 'running';
	}
	
	var d = new Date();
	currentTask.completetime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
	currentTask.save(function(err) {
		if (err)
			console.log(err);
		else
			console.log(currentTask);
	});
}

function invokeTask() {
	username = currentTask.accountname;
	password = currentTask.accountpass;
	address = currentTask.accountaddr;
	exportType = currentTask.exporttype;
	debtor = currentTask.debtor;
	dateType = currentTask.datetype;
	if(currentTask.repeat === 'Monthly Previous Month') {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		startDate = currentTask.startdate = padZero(firstDay.getDate()) + '-' + padZero((firstDay.getMonth() + 1)) + '-' + firstDay.getFullYear();
		endDate = currentTask.enddate = padZero(lastDay.getDate()) + '-' + padZero((lastDay.getMonth() + 1)) + '-' + lastDay.getFullYear();
	} else {
		startDate = currentTask.startdate;
		endDate = currentTask.enddate;
	}
	segmentType = currentTask.segmenttype;
	emailTo = currentTask.emailto;
	exportEmailTo = currentTask.exportemailto;

	login();
}

var searchForIncompleteTasks = function() {
	Task.find({}).sort({starttime: 'asc'}).find(function(err, docs) {
		if (err)
			console.log(err);
		else {
			if(docs !== null && docs.length >= 1) {
				for(var i = 0; i < docs.length; i++) {
					currentTask = docs[i];
					var isRun = false;
					var startTime = new Date(currentTask.starttime);
					var completeTime = new Date(currentTask.completetime);
					var currentTime = new Date();
					switch(currentTask.repeat) {
						case 'Once':
							if(currentTime.getTime() > startTime.getTime() && currentTask.completed === 'false') {
								isRun = true;
							} else if(diffMinute(completeTime, currentTime) >= 1 && currentTask.completed === 'failed') {
								isRun = true;
							}
							break;
						case 'Monthly':
							if(currentTime.getTime() > startTime.getTime() && currentTask.completed === 'false') {
								isRun = true;
							} else if(diffMinute(completeTime, currentTime) >= 1 && currentTask.completed === 'failed') {
								isRun = true;
							} else if(diffMonth(completeTime, currentTime) >= 1) {
								isRun = true;
							}
							break;
						case 'Monthly Previous Month':
							if(currentTime.getTime() > startTime.getTime() && currentTask.completed === 'false') {
								isRun = true;
							} else if(diffMinute(completeTime, currentTime) >= 1 && currentTask.completed === 'failed'){
								isRun = true;
							} else if(diffMonth(completeTime, currentTime) >= 1) {
								isRun = true;
							}
							break;
						case 'Weekly':
							if(currentTime.getTime() > startTime.getTime() && currentTask.completed === 'false') {
								isRun = true;
							} else if(diffMinute(completeTime, currentTime) >= 1 && currentTask.completed === 'failed') {
								isRun = true;
							} else if(diffDay(completeTime, currentTime) >= 7) {
								isRun = true;
							}
							break;
						case 'Daily':
							if(currentTime.getTime() > startTime.getTime() && currentTask.completed === 'false') {
								isRun = true;
							} else if(diffMinute(completeTime, currentTime) >= 1 && currentTask.completed === 'failed') {
								isRun = true;
							} else if(diffDay(completeTime, currentTime) >= 1) {
								isRun = true;
							}
							break;
					}
					if (isRun) {
						break;
					}
				}
				if(isRun) {
					invokeTask();
				} else {
					console.log('Wait for the time of task comes!');
					setTimeout(searchForIncompleteTasks, 5000);
				}
			} else {
				console.log('There is no task at this moment!');
				setTimeout(searchForIncompleteTasks, 5000);
			}
		}
	});
}

function searchForExports() {
	var date = new Date();
	console.log('fromDate-toDate: ' + date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear());
	fromDate = toDate = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
	var options = {
		url: 'https://asp.tramada.com.au/ttms/' + address +'/admin/exports-search.htm',
		method: 'post', 
		form: {
			'form_name': 'searchForm', 
			'exportType': 'RAW_DATA', 
			'fromDate': fromDate, 
			'toDate': toDate, 
			'groupCode': '', 
			'debtor': '', 
			'branch': '', 
			'consultant': '', 
			'searchButton': 'Search'
		}
	};
	request.post( options, function (error, response, body) {
		var $ = cheerio.load(body);

		var siblings = $("a[title='View Export File']").parent().siblings();
		var receiveTime = new Date(siblings.eq(1).text());
		console.log('receiveTime: ' + receiveTime);

		console.log(siblings.eq(5).text());
		console.log(siblings.eq(6).text());

		console.log('time difference: ' + Math.abs(receiveTime.getTime() - requestTime.getTime()));
		if(Math.abs(receiveTime.getTime() - requestTime.getTime()) <= 5000 && 
			startDate === siblings.eq(5).text() && 
			endDate === siblings.eq(6).text()) {
			downloadExport($("a[title='View Export File']").attr('href'));
		} else {
			retryTimes += 1;
			if(retryTimes > 30) {
				tramadaAPIResult = 'failed';
				updateTask();
				setTimeout(searchForIncompleteTasks, 5000);
			} else {
				console.log('waiting for latest data ... tried ' + retryTimes);
				setTimeout(searchForExports, 5000);
			}
		}
    });
}

function downloadExport(filename) {
	var options = {
		url: 'https://asp.tramada.com.au' + filename, 
		method: 'post'
	};

	var r = request.post(options).pipe(fs.createWriteStream('file.zip'));

	r.on('close', function () {

		var zip = new AdmZip('file.zip');
		var zipEntries = zip.getEntries();

		console.log(zipEntries[0].name);

		zip.extractAllTo(/*target path*/'./', /*overwrite*/true);

		var email   = require('emailjs');
		var server  = email.server.connect({
			user:    'traveledge.reporter', 
			password:'123456qazwsx', 
			host:    'smtp.gmail.com', 
			ssl:     true
		});

		if(segmentType === 'All except Flight') {
			segmentTypeConvention = 'ALL';
		} else if(segmentType === 'Flight') {
			segmentTypeConvention = 'AIR';
		} else {
			segmentTypeConvention = segmentType;
		}

		if(address === 'communico') {
			companyNameConvention = 'TNG';
		} else if(address === 'traveledge') {
			companyNameConvention = 'TNG2';
		} else if(address === 'thetraveldepartment') {
			companyNameConvention = 'CBA';
		} else if(address === 'gsstravel') {
			companyNameConvention = 'GHD';
		}

		var dv = startDate.split("-");

		var rename = companyNameConvention + '_' + segmentTypeConvention + '_DEPT_' + dv[2] + dv[1] + '.csv';

		var message = {
			text:    'See in the attachment!', 
			from:    'Tramada.ReportUI <sam.li@traveledge.com.au>', 
			to:      exportEmailTo,
			subject: 'Tramada data export from ' + startDate + ' to ' + endDate,
			attachment: 
			[
			{path:'././' + zipEntries[0].name, type:'text/csv', name: rename}
			]
		};
	    server.send(message, function(err, message) { 
	    	console.log(err || message); 
	    	console.log('loop tasks finished start again');
	    	updateTask();
			setTimeout(searchForIncompleteTasks, 5000);
	    });
	});
}

function createExport() {
	var options = {
		url: 'https://asp.tramada.com.au/ttms/' + address +'/admin/export.htm',
		method: 'post', 
		form: {
			'form_name': 'form', 
			'mode': '', 
			'hiddendebtor': '', 
			'hiddendepartment': '', 
			'hiddencostCentre': '', 
			'exportType': exportType, 
			'iBankInvoiceDateFrom': '', 
			'iBankInvoiceDateTo': '', 
			'issueDateFrom': '', 
			'issueDateTo': '', 
			'creationDateFrom': '', 
			'creationDateTo': '', 
			'invoiceDateFrom': '', 
			'invoiceDateTo': '', 
			'flindersReportingGroupCode': '', 
			'corporateTravellerExtractMonth': '', 
			'reportingGroupCode': '', 
			'debtorOnly': '', 
			'debtor': '', 
			'department': '', 
			'costCentre': '', 
			'branch': '', 
			'exportClient.prefConsultant': '', 
			'exportClient.profile': '', 
			'exportClient.budgetType': '', 
			'exportClient.clientSource': '', 
			'exportClient.travellerType': '', 
			'exportClient.activeInterest': '', 
			'exportClient.cultureInterest': '', 
			'exportClient.leisureInterest': '', 
			'exportClient.themedInterest': '', 
			'exportClient.birthdayMonth': '', 
			'clientProfile': '', 
			'rangeFrom': '', 
			'rangeTo': '', 
			'exportCorporate.branch': '', 
			'exportCorporate.reportingGroupCode': '', 
			'exportCorporate.debtor': debtor, 
			'exportCorporate.domIntType': '', 
			'exportCorporate.creditor': '', 
			'exportCorporate.dateType': dateType, 
			'exportCorporate.startDate': startDate, 
			'exportCorporate.endDate': endDate, 
			'exportCorporate.segmentType': segmentType, 
			'exportCreditor.creditorSegmentType': '', 
			'exportCreditor.hotelChainCode': '', 
			'exportCreditor.cityCode': '', 
			'exportDebtor.debtorSource': '', 
			'exportDebtor.debtorType': '', 
			'exportDebtor.accountManager': '', 
			'skmDebtor': '', 
			'skmInvoiceNoFrom': '', 
			'skmInvoiceNoTo': '', 
			'skmInvoiceDateFrom': '', 
			'skmInvoiceDateTo': '', 
			'pdCommissionDateFrom': '', 
			'pdCommissionDateTo': '', 
			'pdCommissionConsultant': '', 
			'pdCommissionSort': 'CONSULTANT', 
			'bayTvlDebtorOnly': '', 
			'bayTvlDateFrom': '', 
			'bayTvlDateTo': '', 
			'emailTo': emailTo, 
			'export': 'Export'
		}
	};

	requestTime = new Date();
	console.log('requestTime: ' + requestTime);

	request.post(options, function (error, response, body) {

		retryTimes = 0;

		if(response.statusCode.toString() === '302') {
			searchForExports();
		} else {
			tramadaAPIResult = 'failed';
		}

	});
}

function login() {
	var options = {
		url: 'https://asp.tramada.com.au/ttms/' + address +'/login.htm',
		method: 'post', 
	    form: {
	    	'form_name': 'loginForm', 
	    	'pendingSessions': 'true', 
	    	'userURL': '', 
	    	'username': username, 
	    	'password': password, 
	    	'clearPendingSessions': 'on', 
	    	'login': 'Login'
	    }
	};

	tramadaAPIResult = 'succeeded';

	request.post( options, function (error, response, body) {

		if(response.statusCode.toString() === '302'){
			createExport();
		} else {
			tramadaAPIResult = 'failed';
		}

	});
}