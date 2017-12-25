const request = require("request");
const url = require("url");
const datetime = require('node-datetime');
const h2p = require('html2plaintext');
const merge = require('lodash.merge');
const cookie = require('cookie');
const random = require('randomatic');
const retry = require('p-retry');

const stationIdRequestUrl = url.parse("http://fahrplan.oebb.at/bin/ajax-getstop.exe/dn");
const stationDepaturesUrl = url.parse("http://fahrplan.oebb.at/bin/stboard.exe/dn");
const authenticationUrl = url.parse("https://tickets.oebb.at/api/domain/v3/init");
const timetableUrl = url.parse("https://tickets.oebb.at/api/hafas/v4/timetable");
const newStationsSearchUrl = url.parse("https://tickets.oebb.at/api/hafas/v1/stations");
const pricesUrl = url.parse("https://tickets.oebb.at/api/offer/v1/prices");

const stationSearchOptions={
	REQ0JourneyStopsS0A:1,//typ der antowort (addresse, poi, usw.) 255 jedern typ zulassen 1 ist bahnhof
	REQ0JourneyStopsB:12, //wieviel antworten
	S:"",//suchwort
	js:true//macht nichts
};
const stationBoardDataOptions={
	L:"vs_scotty.vs_liveticker",
	evaId: "", //bahnhof
	dirInput: "", //richtung Zahl int
	boardType:"dep",
	time:"12:00",//HH:MM 01:15
	productsFilter:"1111111111111111",//0000110000000000 für sbahn und regional züge
	additionalTime:0,
	maxJourneys:19, //n+1
	outputMode:"tickerDataOnly",
	start:"yes",
	selectDate:"period",
	dateBegin:"",//dd.mm.YYYY 01.02.2017
	dateEnd:""//dd.mm.YYYY 01.02.2017
};
const journeyOptions = {
        //"travelActionId":"",
        "reverse":false,
        "datetimeDeparture":"",//YYY-MM-DDTHH:MM:SS.mmm
        "filter":
            {
                "regionaltrains":false,
                "direct":false,
                "changeTime":false,
                "wheelchair":false,
                "bikes":false,
                "trains":false,
                "motorail":false,
                "droppedConnections":false
            },
                "passengers":
                    [
                    ],
        "count":5,
        "debugFilter":
            {
                "noAggregationFilter":false,
                "noEqclassFilter":false,
                "noNrtpathFilter":false,
                "noPaymentFilter":false,
                "useTripartFilter":false,
                "noVbxFilter":false,
                "noCategoriesFilter":false},
        "from":
            {
            },
        "to":
            {
            },
        "timeout":{}
    };
const journeyStation ={
    "latitude":0,
    "longitude":0,
    "name":"",
    "number":0
};
const journeyAdult = {
    "type":"ADULT",
    "id":1514028726,
    "me":false,
    "remembered":false,
    "challengedFlags":
        {
            "hasHandicappedPass":false,
            "hasAssistanceDog":false,
            "hasWheelchair":false,
            "hasAttendant":false
        },
    "relations":[],
    "cards":[],
    "birthdateChangeable":true,
    "birthdateDeletable":true,
    "nameChangeable":true,
    "passengerDeletable":true
};
const journeyChild ={
    "type": "CHILD",
    "id": 1514035596,
    "fakeBirthDate": true,
    "me": false,
    "remembered": false,
    "challengedFlags": {
        "hasHandicappedPass": false,
        "hasAssistanceDog": false,
        "hasWheelchair": false,
        "hasAttendant": false
    },
    "relations": [],
    "cards": [],
    "birthdateChangeable": true,
    "birthdateDeletable": true,
    "nameChangeable": true,
    "passengerDeletable": true,
    "birthDate": ""//YYY-MM-DDTHH:MM:SS.mmm
};
const journeyYoungster={
    "type": "YOUNGSTER",
    "id": 1514035602,
    "fakeBirthDate": true,
    "me": false,
    "remembered": false,
    "challengedFlags": {
        "hasHandicappedPass": false,
        "hasAssistanceDog": false,
        "hasWheelchair": false,
        "hasAttendant": false
    },
    "relations": [],
    "cards": [],
    "birthdateChangeable": true,
    "birthdateDeletable": true,
    "nameChangeable": true,
    "passengerDeletable": true,
    "birthDate": "2001-12-23T13:26:47.281"
};

function authenticationRequest() {
    return new Promise((resolve, reject)=>
    {
        request(
            {
                url: authenticationUrl,
                method: "GET",
                json: true,
                headers: {Channel: "inet"},
                qs: {userId: generateUserId()},
                timeout: 5000
            },
            (error, response, body) =>
            {
                if(body.accessToken && body.accessToken !== ""){
                    resolve(merge(body, {cookie: cookie.parse(response.headers['set-cookie'][0])['ts-cookie']}));
                }else{
                    reject(body)//TODO proper reject
                }
            }
        );
    });
}

getAuthentication = function(retries=3){
    return(retry(authenticationRequest, {retries: retries}));
};

getRequest = (url, params) => (authentication) => {
    return new Promise((resolve, reject)=>
    {
        request(
            {
                url:url,
                json:true,
                qs:params,
                method:"GET",
                headers:
                    {
                        cookie: cookie.serialize('ts-cookie', authentication.cookie),
                        Channel: authentication.channel,
                        AccessToken: authentication.accessToken,
                        SessionId: authentication.sessionId,
                        'x-ts-supportid': "WEB_" + authentication.supportId
                    }
            },
            (error, response, body) =>
            {
                if(error){
                    reject(error)//TODO proper reject;
                }else {
                    resolve(body);
                }
            }
        );
    });
};

postRequest = (url, body) => (authentication) => {
    return new Promise((resolve, reject)=>{
        request(
            {
                url:url,
                json: true,
                body:body,
                method:"POST",
                headers:
                    {
                        cookie: cookie.serialize('ts-cookie', authentication.cookie),
                        Channel: authentication.channel,
                        AccessToken: authentication.accessToken,
                        SessionId: authentication.sessionId,
                        'x-ts-supportid': "WEB_" + authentication.supportId
                    },
            },
            (error, response, body) => {
                if(error){
                    reject(error)//TODO proper reject;
                }else {
                    resolve(body);
                }
            }
        );
    });
};

exports.searchStationsNew = function (name){
        return getAuthentication().then(getRequest(newStationsSearchUrl, {count: 15, name: name}));
};

exports.searchStations = function (options){
	return new Promise((resolve, reject) =>
    {
		request(
            {
                url:stationIdRequestUrl,
                method:"GET",
                qs:options,
                encoding:"latin1"
            },
            (error, response, body) =>
                {
                    body = body.split(/=(.+)/)[1];
                    body = body.split(/(;SLs.+)/)[0];
                    body = JSON.parse(body).suggestions;
                    if(!error && body && body.length > 0)
                    {
                        resolve(body);
                    }else {
                        reject(body)//TODO proper reject;
                    }
                }
		);
	})
};

exports.getJourneys = function(from, to, add_offers=false, date = datetime.create()){

    return new Promise((resolve, reject)=>{

        let authentication = getAuthentication();
        let options = Object.assign({}, journeyOptions);
        options.passengers.push(Object.assign({}, journeyAdult));
        options.from=from;
        options.to=to;
        options.datetimeDeparture = date.format("Y-m-dTH:M:S.N");//YYY-MM-DDTHH:MM:SS.mmm
        let journeys = authentication.then(postRequest(timetableUrl, options ));

        if(add_offers){
            journeys.then((journeys_res)=>{
                let connections = journeys_res.connections;
                let ids = connections.map((x) => x.id);
                authentication.then((auth)=>{
                    findPrices(ids)(auth).then((offers)=>{
                        offers = offers.offers;
                        resolve({connections: connections.map((connection) => ({connection, offer: offers.find((offer) => offer.connectionId == connection.id)}))});
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        }else {
            resolve(journeys);
        }
    });
};

findPrices = (ids) => (authentication) => {//Very important has to be same authentication as used for journeys, therefore add directly to get journeys
    return getRequest(pricesUrl, {"connectionIds":ids})(authentication);
};

exports.getStationBoardData = function(options){
	return new Promise((resolve, reject) =>
    {
        request(
            {
                url:stationDepaturesUrl,
                method:"GET", qs:options,
                encoding:"latin1"
            },
            (error, response, body) =>
                {
                    body = body.replace(/[\n\r]/g, "");
                    body = body.split(/ = (.+)/)[1];
                    body = h2p(body);
                    body = JSON.parse(body);
                    if(!error && body.headTexts)
                    {
                        resolve(body);
                    }else {
                        reject(error, body);
                    }
                }
            );
	})
};

exports.getDelayed = function(stationInfo){
	let journey = stationInfo.journey;
	let delays = [];
	let canceled = [];
	if( journey  && journey.length > 0)
	{
		journey.forEach(
			function(transport)
            {
				if(transport.rt)
				{
					if(transport.rt.status)
					{
						canceled.push(transport);
					}else{
						delays.push(transport);
					}
				}
			}
		);
	}
	return({"delayed":delays, "canceled":canceled});
};

exports.getStationBoardDataOptions = function(){
	let dt = datetime.create();
	let options = Object.assign({}, stationBoardDataOptions);
	options.time = dt.format("H:M");
	options.dateBegin = dt.format("d.m.Y");
	options.dateEnd = dt.format("d.m.Y");
	return(options);
};

exports.getStationSearchOptions = function(){
	return(Object.assign({},stationSearchOptions));
};

function generateUserId(){
    return(`anonym-${random('A0', 8)}-${random('A0', 4)}-${random('A0', 2)}`.toLowerCase());
}


