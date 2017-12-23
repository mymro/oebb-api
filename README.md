# OEBB-API

An API to acess train shedules, arrivls/departures and ticketinformation from the OEBB

## Usage
### searchStationsNew(name)
It returns an promise that resolves to an array of possible stations matching `name`
```javascript
searchStationsNew("Wien").then(console.log)
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
*searchStation* is very similar to *searchStationsNew* it however can take more [`options`](#options) and returns more information. You can call [getStationSearchOptions](#getStationSearchOptions()) to get a prefilled options object.
```javascript
var options = getStationSearchOptions();
options.S="wien h"
searchStations(options).then(console.log)
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
extId | used in other queries; same as number 
type | number representing the type
typeStr | the type as string
xcoord | longitude
ycoord |latitude
state | no idea
prodClass| no idea
weight | I am guessing it represents how close a match the station is to the string


### getStationSearchOptions()

It returns an object containing the options for [searchStations](#searchStations(options))
```javascript
var options = getStationSearchOptions();
```
Name | default value
--- | ---
REQ0JourneyStopsS0A | 1
REQ0JourneyStopsB | 12
S | 
js |`true`

#### options

Name | value | description
--- | --- |  --- |
REQ0JourneyStopsS0A | An int between 1 and 255. | It selects the type of station to return e.g. 1 is [Bhf/Hst]
REQ0JourneyStopsB | An int greater 0 | the amount of results which are returned
S | a string | the string to match
js | boolean | no idea what it does

### getStationBoardData(options)
It returns a promise resolving to an object containing arrival or depature information for a specific station.
```javascript
var options = oebb.getStationBoardDataOptions();
options.evaId=1191601;//Ottakring (Wien) 
oebb.getStationBoardData(options).then(console.log)
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

journey:

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

rt describes the delay or other status if there is one
 Name | description
 --- | --- 
status | current status; "Ausfall" if canceled
dlm | how many minutes too late
dlt | actual arrival time
dld | actual arrival date

rta is very similar to rt I think it describes the delya for the arrival, but I am not certain

Name | description
--- | --- 
status | current status; "Ausfall" if canceled then rt too is canceld and rt.status= "Ausfall"
dlm | never seen it other than empty
dlt | never seen it other than empty

### getStationBoardDataOptions()
returns prefilled options for [getStationBoardData](#getStationBoardData(options))
```javascript
var options = getStationBoardDataOptions()
```
Name | default value
--- | ---
L | vs_scotty.vs_liveticker
evaId | empty
dirInput | empty
boardType | dep 
time | current time
productsFilter | 1111111111111111
additionalTime | 0,
maxJourneys | 19
outputMode | tickerDataOnly 
start|yes
selectDate | period 
dateBegin| current date
dateEnd| current date

#### options

Name | value | description
--- | --- | ---
L | vs_scotty.vs_liveticker | ?
evaId | integer | Id of station extId or number from searchStations or searchStationsNew
dirInput | integer | Id of Station in which transportation is heading extId or number from searchStations or searchStationsNew. If it is set only trains which actualy stop at the station specified with dirInput are shown
boardType | dep/arr | depatures or arrivals
time | HH:MM | time from when to start looking
productsFilter | 1111111111111111 | selects modes of transportation see below for more information
additionalTime | integer | in minute. Is added to time
maxJourneys | 19 | max of returned stations
outputMode | tickerDataOnly | ?
start | yes | wheter to start query
selectDate | period/tody | selects mode; if tody dateBegin and dateEnd are ignored. 
dateBegin| current date | start day for lookup ignored if selectDate=today
dateEnd| current date | end date for lookup ignored if selectDate=today

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
 12 | ?
 13 | Westbahn
 14 | ?
 15 | ?
 16 | ?
 
### journeys(from, to, date)
returns routes `from` `to` at `date`

```javascript

```
