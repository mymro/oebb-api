# OEBB-API (ÖBB-API)

A collection of functions fore node.js to acess train shedules, arrivals/departures, station search and ticketinformation from the [OEBB(ÖBB)](https://www.oebb.at) 

I had a lot of help help from these great ressources

 - [HAFAS Fahrplanauskunft API - Sammlung](https://www.administrator.de/wissen/hafas-fahrplanauskunft-api-sammlung-177145.html)
 - [Austrian Federal Railways (ÖBB) API client by juliuste](https://github.com/juliuste/oebb)
 
and a [documentation file](https://avb.rmv.de/vergabeverfahren/b-2020-lfd/1-qsv-avb/QSV_Anhang%203e%20%28Anlage%2017_Anh%206%20Realtime%20Datform%20HAFAS%20Parameter_MVU%20170803%29_AVB.pdf/view) I found on the web

## Installation
```shell
npm --save install oebb-api
```
## Functions

 - [searchStationsNew](#searchstationsnewname)
 - [searchStations](#searchstationsoptions)
 - [getJourneys](#getjourneysfrom-to-addoffers-date)
 - [getStationBoardData](#getstationboarddataoptions)
 - [getStationBoardDataOptions](#getstationboarddataoptions-1)
 - [getStationSearchOptions](#getstationsearchoptions)

### searchStationsNew(name)
It returns an promise that resolves to an array of possible stations matching `name`
```javascript
const oebb = require('oebb-api');

oebb.searchStationsNew("Wien").then(console.log);
```
returns
```javascript
[{ number: 1190100,
    longitude: 16372134,
    latitude: 48208547,
    name: '',
    meta: 'Wien' },
  { number: 1290401,
    longitude: 16375326,
    latitude: 48185507,
    name: 'Wien Hbf (U)',
    meta: '' },
...
...
...]
```
### searchStations(options)
*searchStation* is very similar to [*searchStationsNew*](#searchstationsnewname) it however can take more [`options`](#options) and returns more information. You can call [getStationSearchOptions](#getstationsearchoptions) to get a prefilled options object.
```javascript
const oebb = require('oebb-api');

var options = oebb.getStationSearchOptions();
options.S="wien h";
oebb.searchStations(options).then(console.log);
```
It returns an array with matching stations, POIs, etc.
```javascript
[ { value: 'Wien Hbf (U)',
    id: 'A=1@O=Wien Hbf (U)@X=16375326@Y=48185507@U=181@L=001290401@B=1@p=1513853468@',
    extId: '001290401',
    type: '1',
    typeStr: '[Bhf/Hst]',
    xcoord: '16375326',
    ycoord: '48185507',
    state: 'id',
    prodClass: '6013',
    weight: '32767' },
  { value: 'Wien Meidling',
    id: 'A=1@O=Wien Meidling@X=16333211@Y=48174559@U=181@L=001191201@B=1@p=1513853468@',
    extId: '001191201',
    type: '1',
    typeStr: '[Bhf/Hst]',
    xcoord: '16333211',
    ycoord: '48174559',
    state: 'id',
    prodClass: '4989',
    weight: '32588' },
...
...
...]
```
Name | description
--- | ---
value: | name of the station 
id  | no idea
extId | used in other queries; same as number (not quite shure if the really are the same all the time) 
type | int representing the type
typeStr | the type as string
xcoord | longitude
ycoord |latitude
state | no idea
prodClass| no idea
weight | I am guessing it represents how close a match the station is to the string


### getStationSearchOptions()

It returns an object containing the options for [searchStations](#searchstationsoptions)
```javascript
const oebb = require('oebb-api');

var options = oebb.getStationSearchOptions();
```

#### options

Name | default value | value | description
--- | --- | --- |  --- |
REQ0JourneyStopsS0A | 1 |  An int between 1 and 255. | It selects the type of station to return e.g. 1 is [Bhf/Hst]
REQ0JourneyStopsB | 12 | An int greater 0 | the amount of results which are returned
S | | a string | the string to match
js |`true` | boolean | no idea what it does

### getStationBoardData(options)
It returns a promise resolving to an object containing arrival or depature information for a specific station. You can get a prefilled [`options`](#options-1) object, by calling [getStationBoardDataOptions](#getstationboarddataoptions-1)
```javascript
const oebb = require('oebb-api');

var options = oebb.getStationBoardDataOptions();
options.evaId=1191601;//Ottakring (Wien)
oebb.getStationBoardData(options).then(console.log);
```
returns:
```javascript
{ headTexts:
   [ 'Zeit',
     'Fahrt',
     'Nach',
     'Steig',
     'Abfahrten',
     'Aktuell',
     'Ankunft' ],
  stationName: 'Ottakring (Wien)',
  stationEvaId: '1191601',
  boardType: 'dep',
  imgPath: '/img/',
  iconProductsSubPath: 'vs_oebb/',
  rtInfo: true,
  journey:
   [ { id: '875171810',
       ti: '19:46',
       da: '23.12.2017',
       pr: 'U3',
       st: 'Wien Simmering',
       lastStop: 'Wien Simmering Bahnhof (U3)',
       ati: '20:12',
       tr: '1',
       trChg: false,
       rt: false,
       rta: false },
     { id: '836641815',
       ti: '19:46',
       da: '23.12.2017',
       pr: 'Tram 46',
       st: 'Wien Ring/Volkstheater U',
       lastStop: 'Wien Dr.-K.-Renner-Ring/Volkstheater (Schleife)',
       ati: '20:00',
       tr: '',
       trChg: ,
       rt: { status: null, dlm: '2', dlt: '19:47' , dld:'23.12.2017'},
       rta: false },
       ...
       ...
       ...
 ],
  maxJ: 18 }

```
#### element description
##### general:
Name | description
--- | --- 
headTexts | headings for arrivals depatures screen
stationName | name of station
stationEvaId | Id of station
boardType | depatures or arrivals (dep/arr)
imgPath | ?
iconProductsSubPath | ?
rtInfo | ?
maxJ | number of returned entries -1

##### journey:

Name | description
--- | --- 
id | ?
ti | arrvial/depature time
da | arrival/depature date
pr | name of transport
st | ?
lastStop | last stop
ati | wehn arrivals depature time from first stop ; when depatures expected time to reach last stop
tr | track identifier
trChg | did the track change

##### rt :
it describes the delay or other status if there is one. If there is one it contains an object formated as follows:

 Name | description
 --- | --- 
 status | current status; "Ausfall" if canceled
 dlm | how many minutes too late
 dlt | actual arrival time
 dld | actual arrival date

##### rta 
it is very similar to rt I think it describes the delay for the arrival, but I am not certain.

Name | description
--- | --- 
status | current status  "Ausfall" if canceled then rt too is canceld and rt.status= "Ausfall"
dlm | never seen it other than empty
dlt | never seen it other than empty

### getStationBoardDataOptions()
returns prefilled options for [getStationBoardData](#getstationboarddataoptions)
```javascript
const oebb = require('oebb-api');

var options = oebb.getStationBoardDataOptions();
```
#### options

Name | default value | values | description
--- | --- | --- | ---
L | vs_scotty.vs_liveticker|  vs_scotty.vs_liveticker | ?
evaId | empty| integer | Id of station; extId or number from [searchStationsNew](#searchstationsnewname) or [searchStations](#searchstationsoptions)
dirInput | empty| integer | Id of Station in which transportation is heading; extId or number f from [searchStationsNew](#searchstationsnewname) or [searchStations](#searchstationsoptions). If it is set only trains which actually stop at the station specified with dirInput are shown
boardType | dep | dep/arr | depatures or arrivals
time | current time| HH:MM | time from when to start looking
productsFilter | 1111111111111111 | binary flags? | selects modes of transportation see [below](#productsfilter) for more information
additionalTime | 0 | integer | in minute. Is added to time
maxJourneys | 19 | integer | max of returned stations
outputMode | tickerDataOnly | tickerDataOnly | ?
start |yes| yes/no | wheter to start query
selectDate | period | period/tody | selects mode; if tody dateBegin and dateEnd are ignored. 
dateBegin| current date | String dd.mm.YYYY | start day for lookup ignored if selectDate=today
dateEnd | current date| String dd.mm.YYYY | end date for lookup ignored if selectDate=today

##### productsFilter
slects which modes of transports should be listed
forexample if I set `productsFilter` to 0000110000000000 only s-bahn and regionalzüge are shown

Flag number | mode of transport
 --- |  ---
 1 | railjet
 2 | ?
 3 | ec and ice
 4 | nightjet d probably also nightjet en
 5 | regionalzüge
 6 | s-bahn
 7 | Bus
 8 | ?
 9 | subway
 10 | tram
 11 | ?
 12 | AST
 13 | Westbahn
 14 | ?
 15 | ?
 16 | ?
 
### getJourneys(from, to, add_offers, date)
returns a promise, that resolves to routes [`from`](#from-and-to) [`to`](#from-and-to) at `date`. To add the offers, if they exist, set `add_offers` to `true`. 
`add_offers` is by default false. 
`date` is a node-datetime object. It has to be imported through npm

```javascript
const oebb = require('oebb-api');

oebb.searchStationsNew("Wien Hbf").then((res)=>{
	var from = res[0];
	oebb.searchStationsNew("Venezia Santa Lucia").then((res)=>{
		var to=res[0];
		oebb.getJourneys(from, to, true).then((res)=>{
            console.log(res);
        });
	})
});
```
####`from` and `to` 
they are formated:
```javascript
from/to = { 
	number: 1190100,
    longitude: 16372134,
    latitude: 48208547,
    name: 'Wien',
};
```

 This returns for example (`connections` describes the journey and `offer` contains the information about the price etc.):
 (The console output will hide most of it, but it is there)
```javascript
{
	"connections": [
		{
			"connection": {
				"id": "fb8a994b473d2931b32583890559a1dcadd736a0f2016132f6d1628b8b1d68fd",
				"from": {
					"name": "Wien Hbf",
					"esn": 8103000,
					"departure": "2017-12-24T06:25:00.000",
					"departurePlatform": "7",
					"showAsResolvedMetaStation": false
				},
				"to": {
					"name": "Venezia Santa Lucia",
					"esn": 8300094,
					"arrival": "2017-12-24T14:05:00.000",
					"showAsResolvedMetaStation": false
				},
				"sections": [
					{
						"from": {
							"name": "Wien Hbf",
							"esn": 8103000,
							"departure": "2017-12-24T06:25:00.000",
							"departurePlatform": "7"
						},
						"to": {
							"name": "Venezia Santa Lucia",
							"esn": 8300094,
							"arrival": "2017-12-24T14:05:00.000"
						},
						"duration": 27600000,
						"category": {
							"name": "RJ",
							"number": "131",
							"displayName": "RJ",
							"longName": {
								"de": "Railjet",
								"en": "Railjet",
								"it": "Railjet"
							},
							"backgroundColor": "#ffffff",
							"fontColor": "#222222",
							"barColor": "#ab0020",
							"place": {
								"de": "Bahnsteig",
								"en": "Platform",
								"it": "Banchina"
							},
							"assistantIconId": "zugAssistant",
							"train": true,
							"backgroundColorDisabled": "#F0F0F0",
							"fontColorDisabled": "#878787",
							"barColorDisabled": "#878787"
						},
						"type": "journey",
						"hasRealtime": false
					}
				],
				"switches": 0,
				"duration": 27600000
			},
			"offer": {
				"connectionId": "fb8a994b473d2931b32583890559a1dcadd736a0f2016132f6d1628b8b1d68fd",
				"price": 94.6,
				"offerError": false,
				"firstClass": false,
				"availabilityState": "available"
			}
		},
		...
		...
		...
	}
]
```
