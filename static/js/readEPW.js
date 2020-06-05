/*
The main charting function is contained in psychrometricCart(). formatEPW() handles an epw
text string. psychrometrics() returns an object that has all the line informtion for drawing
the psychrometric chart, along with helper functions to derive humidity ratios, enthalpy, an rh
from various inputs. Based on functions in ASHRAE Book of Fundamentals.
*/

//this part of the function works if wth file is selected form the the dorpdown.
function formatEpw(epwCSV) {
	var ps = new psychrometrics();
	var la = d3.csvParseRows(epwCSV)[0];
	var l = {city: la[1], state: la[2], country: globalCodes[la[3]].country, latitude: Number(la[6]), longitude: Number(la[7]), elevation: la[9], code: la[3]};
	// var l = {city: la[1], state: la[2], latitude: Number(la[6]), longitude: Number(la[7]), elevation: la[9], code: la[3]};
	var w = d3.csvParseRows(epwCSV, function(d, i) {
		if (i > 7) {
			return {
				hour: i-8,
				date: hoursToDate(i-8), 
				db: Number(d[6]), 
				rh: Number(d[8]), 
				bp: Number(d[9]), 
				dp: Number(d[7]), 
				hr: ps.calcHumidRatio(Number(d[6]), Number(d[8]), Number(d[9])).hr 
			};
		}
	});
	return {"psych_wth":{location: l, weather: w}};
}

//this part of the function works if wth file is selected form the the dorpdown and it formats the json files to fit the psychrometric chart parameters.
function formatJS(epwJS_) {
	var ps = new psychrometrics();
	
	var epwJS = JSON.parse(epwJS_)

	var l = {city: epwJS.city, state: epwJS.region, country:globalCodes[epwJS.country].country,latitude: Number(epwJS.latitude), longitude: Number(epwJS.longitude), code: epwJS.country};
	
	var w = []
	epwJS.db.forEach(function (d, i) {
		w.push ( {
				hour: i,
				date: hoursToDate(i), 
				db: Number(epwJS.db[i]), 
				rh: Number(epwJS.rh[i]), 
				bp: Number(epwJS.bp[i]), 
				dp: Number(epwJS.dp[i]), 
				hr: ps.calcHumidRatio(Number(epwJS.db[i]), Number(epwJS.rh[i]), Number(epwJS.bp[i])).hr 
			} )
		});

	return {"psych_wth":{location: l, weather: w}};
}

//this part of the function works if epw is loaded manually.
function formatEpwM(epwCSV) {
	var ps = new psychrometrics();
	var la = d3.csvParseRows(epwCSV)[0];
	var code = globalCodes[la[3]].code;
	var Tdb = [], Tdp = [], RHout = [], BP = [], RadGlobal = [], RadNormal = [], RadDif = [] , windDir = [] , windVel = [], HR =[]; 
	var l = {city: la[1], state: la[2], country: globalCodes[la[3]].country, latitude: Number(la[6]), longitude: Number(la[7]), elevation: la[9], code: la[3]};
	console.log(' identifying global country code  ' ,l.country)
	var w = d3.csvParseRows(epwCSV, function(d, i) {
		if (i > 7) {
			Tdb.push(Number(d[6])), 
			RHout.push(Number(d[8])), 
			BP.push(Number(d[9])),
			RadGlobal.push(Number(d[13])),
			RadNormal.push(Number(d[14])),
			RadDif.push(Number(d[15])),
			windDir.push(Number(d[20])),
			windVel.push(Number(d[21])), 
			Tdp.push(Number(d[7])), 
			Tdp.push(ps.calcHumidRatio(Number(d[6]), Number(d[8]), Number(d[9])).hr) 
			return {
				hour: i-8,
				date: hoursToDate(i-8), 
				db: Number(d[6]), 
				rh: Number(d[8]), 
				bp: Number(d[9]), 
				dp: Number(d[7]), 
				hr: ps.calcHumidRatio(Number(d[6]), Number(d[8]), Number(d[9])).hr 
			};
		};
		
	});

	return {"city":la[1], "code":code, "latitude":Number(la[6]), "longitude":Number(la[7]), "timezone":Number(la[8]),
            "db":Tdb, "dp":Tdp, "rh":RHout, "bp":BP, 
            "radg":RadGlobal, "radn":RadNormal, "radd":RadDif, 
            "wd":windDir, "wv":windVel, "psych_wth":{location: l, weather: w}};
}


function hoursToDate(hour) {
	var d = Math.floor(hour/24),
	h = hour%24,
	date = new Date(2015, 0);
	// date = new Date();
	date.setDate(d + 1);	
	return new Date(date.setHours(h));
}


function psychrometrics() {
	var barPress = 101300;
	this.barPress = function(value) {
		if (!arguments.length) return barPress;
		barPress = value;
		return this;
	};

	var humidityRange = [0, 0.03];
	this.humidityRange = function(value) {
		if (!arguments.length) return humidityRange;
		humidityRange = value;
		return this;
	};

	var tempRange = [-20, 55];
	this.tempRange = function(value) {
		if (!arguments.length) return tempRange;
		tempRange = value;
		return this;
	};

	this.calcHumidRatio = function(temp, rh, bar) {

		var saturationPressure = this.calcVaporPressure(temp + 273.15);
		var humidityRatio = 0.62198 * (rh/100) * (saturationPressure/1000) / (bar / 1000 - (rh/100) * saturationPressure / 1000);
		var partialPressure = rh/100 * saturationPressure;
		var enthalpy = 1.006 * temp + humidityRatio * (2501 + 1.86 * temp);

		return {hr: humidityRatio, e: enthalpy, pp: partialPressure, sp: saturationPressure};
	}

	this.calcRhFromHumidRatio = function(absHumidity, bar, temp) {
		var ppW = bar/1000 * absHumidity / (0.62198 + absHumidity),
		spW = this.calcVaporPressure(temp + 273.15);
		return (ppW/spW) * 100;
	}

	this.calcTempFromEnthalpy = function(enthalpy, absHumidity) {
		return (enthalpy - (2501*absHumidity))/(1.006 + (1.86 * absHumidity));

	}


	//from ASHRAE fundamentals
	this.calcVaporPressure = function(tempK) {
		
		var C1 = -5674.5359,
    	C2 = 6.3925247,
    	C3 = -0.009677843,
    	C4 = 0.00000062215701,
    	C5 = 0.00000000020747825,
    	C6 = -0.0000000000009484024,
    	C7 = 4.1635019,
    	C8 = -5800.2206,
    	C9 = 1.3914993,
    	C10 = -0.048640239,
    	C11 = 0.000041764768,
    	C12 = -0.000000014452093,
    	C13 = 6.5459673;

    	if (tempK <= 273.15) {
    		var result = Math.exp(C1/tempK + C2 + C3*tempK + C4*Math.pow(tempK, 2) + C5*Math.pow(tempK, 3) + C6*Math.pow(tempK, 4) + C7*Math.log(tempK));
    	}
    	else {
    		var result = Math.exp(C8/tempK + C9 + C10*tempK + C11*Math.pow(tempK, 2) + C12*Math.pow(tempK, 3) + C13*Math.log(tempK));
    	}

    	return result;

	}

	/* Untested functions from excel psychtools
	this.calcHumidRatiofromWetBulb = function(temp, wb, bar) {
		var saturationPressure = this.calcVaporPressure(wb) / 1000;
		var ws = 0.62198 * saturationPressure / (bar/1000 - saturationPressure);
		if (temp >= 0) {
			var result = (((2501 - 2.326*wb)*ws - 1.006*(temp - wb))/(2501 + 1.86*temp - 4.186*wb));
		}
		else {
			var result = (((2830 - 0.24*wb)*ws - 1.006*(temp - wb))/(2830 + 1.86*temp - 2.1*wb));
		}
		return result;
	}

	// from remcmurry python psych tool kit - uses newton-Rhapson iteration method
	this.calcWetBulb = function(temp, rh, bar) {
		var wNorm = this.calcHumidRatio(temp, rh, bar);
		var result = temp;
		var wNew = this.calcHumidRatiofromWetBulb(temp, result, bar);

		while (Math.abs((wNew - wNorm) / wNorm) > 0.00001) {
			var wNew2 = this.calcHumidRatiofromWetBulb(temp, result - 0.001, bar);
			var dw = (wNew - wNew2) / 0.001;
			result = result - (wNew - wNorm) / dw;
			wNew = this.calcHumidRatiofromWetBulb(temp, result, bar);
		}
		return result;

	}
	*/

	this.rhCurves = function() {
		var psych = this;
		
		var temps = [];
		for (var i=tempRange[0]; i<=tempRange[1]; i+=5) {
			temps.push(i);
		}
		var relHumid = [];
		for (var i=10; i<110; i+=10) {
			relHumid.push(i);
		}
		var rhCoordinates = {};
		relHumid.forEach(function(d) { 
			var key = "rh" + d,
			value = temps.map(function(dd) {
				return {db: dd, hr: psych.calcHumidRatio(dd, d, barPress).hr};
			});
			rhCoordinates[key] = value;
		});
		return rhCoordinates;
	}


	this.wbCurves = function() {
		var wb = [];
		var psych = this;
		for (var i=tempRange[0]; i<40; i+=5) {
			wb.push(i);
		}

		var wbCoordinates = {};
		
		wb.forEach(function(d) {
			var key = d + " C",
			lineStart = {db: d, hr: psych.calcHumidRatio(d, 100, barPress).hr},
			lineEnd = {db: psych.calcTempFromEnthalpy(psych.calcHumidRatio(d, 100, barPress).e, 0.0), hr: 0.0},
			value = [lineStart, lineEnd];
			wbCoordinates[key] = value;
		});
		return wbCoordinates;
	}

	this.tempCurves = function() {
		var t = [];
		var psych = this;
		for (var i=tempRange[0]; i<tempRange[1]; i+=5) {
			t.push(i);
		}

		var tempCoordinates = {};

		t.forEach(function(d) {
			var key = d + " C",
			lineStart = {db: d, hr: 0.0},
			lineEnd = {db: d, hr: psych.calcHumidRatio(d, 100, barPress).hr},
			value = [lineStart, lineEnd];
			tempCoordinates[key] = value;
		});
		return tempCoordinates;
	}

	this.hrCurves = function() {
		var h = [];

		for (var i=humidityRange[0]; i<=humidityRange[1]; i+=0.005) {
			h.push(i);
		}
		h.push(humidityRange[1]);

		var hrCoordinates = {};

		h.forEach(function(d) {
			var key = d + " kg/kg",
			lineStart = {db: tempRange[0], hr: d},
			lineEnd = {db: tempRange[1], hr: d},
			value = [lineStart, lineEnd];
			hrCoordinates[key] = value;
		});
		return hrCoordinates;
	}
}


var globalCodes = {"DZA": {"country": "Algeria", "code": "DZ"}, "AGO": {"country": "Angola", "code": "AO"}, "EGY": {"country": "Egypt", "code": "EG"}, "BGD": {"country": "Bangladesh", "code": "BD"}, "NER": {"country": "Niger", "code": "NE"}, "LIE": {"country": "Liechtenstein", "code": "LI"}, "NAM": {"country": "Namibia", "code": "NA"}, "BGR": {"country": "Bulgaria", "code": "BG"}, "BOL": {"country": "Bolivia", "code": "BO"}, "GHA": {"country": "Ghana", "code": "GH"}, "CCK": {"country": "Cocos (Keeling) Islands", "code": "CC"}, "PAK": {"country": "Pakistan", "code": "PK"}, "CPV": {"country": "Cape Verde", "code": "CV"}, "JOR": {"country": "Jordan", "code": "JO"}, "LBR": {"country": "Liberia", "code": "LR"}, "LBY": {"country": "Libya", "code": "LY"}, "MYS": {"country": "Malaysia", "code": "MY"}, "DOM": {"country": "Dominican Republic", "code": "DO"}, "PRI": {"country": "Puerto Rico", "code": "PR"}, "MYT": {"country": "Mayotte", "code": "YT"}, "PRK": {"country": "Korea, Democratic People's Republic of", "code": "KP"}, "PSE": {"country": "Palestine, State of", "code": "PS"}, "TZA": {"country": "United Republic of Tanzania", "code": "TZ"}, "BWA": {"country": "Botswana", "code": "BW"}, "KHM": {"country": "Cambodia", "code": "KH"}, "UMI": {"country": "United States Minor Outlying Islands", "code": "UM"}, "TTO": {"country": "Trinidad and Tobago", "code": "TT"}, "PRY": {"country": "Paraguay", "code": "PY"}, "HKG": {"country": "Hong Kong", "code": "HK"}, "SAU": {"country": "Saudi Arabia", "code": "SA"}, "LBN": {"country": "Lebanon", "code": "LB"}, "SVN": {"country": "Slovenia", "code": "SI"}, "BFA": {"country": "Burkina Faso", "code": "BF"}, "SVK": {"country": "Slovakia", "code": "SK"}, "MRT": {"country": "Mauritania", "code": "MR"}, "HRV": {"country": "Croatia", "code": "HR"}, "CHL": {"country": "Chile", "code": "CL"}, "CHN": {"country": "China", "code": "CN"}, "KNA": {"country": "Saint Kitts and Nevis", "code": "KN"}, "JAM": {"country": "Jamaica", "code": "JM"}, "SMR": {"country": "San Marino", "code": "SM"}, "GIB": {"country": "Gibraltar", "code": "GI"}, "DJI": {"country": "Djibouti", "code": "DJ"}, "GIN": {"country": "Guinea", "code": "GN"}, "FIN": {"country": "Finland", "code": "FI"}, "URY": {"country": "Uruguay", "code": "UY"}, "VAT": {"country": "Holy See (Vatican City State)", "code": "VA"}, "STP": {"country": "Sao Tome and Principe", "code": "ST"}, "SYC": {"country": "Seychelles", "code": "SC"}, "NPL": {"country": "Nepal", "code": "NP"}, "CXR": {"country": "Christmas Island", "code": "CX"}, "LAO": {"country": "Lao People's Democratic Republic", "code": "LA"}, "YEM": {"country": "Yemen", "code": "YE"}, "BVT": {"country": "Bouvet Island", "code": "BV"}, "ZAF": {"country": "South Africa", "code": "ZA"}, "KIR": {"country": "Kiribati", "code": "KI"}, "PHL": {"country": "Philippines", "code": "PH"}, "SXM": {"country": "Sint Maarten (Dutch part)", "code": "SX"}, "ROU": {"country": "Romania", "code": "RO"}, "VIR": {"country": "US Virgin Islands", "code": "VI"}, "SYR": {"country": "Syrian Arab Republic", "code": "SY"}, "MAC": {"country": "Macao", "code": "MO"}, "NIC": {"country": "Nicaragua", "code": "NI"}, "MLT": {"country": "Malta", "code": "MT"}, "KAZ": {"country": "Kazakhstan", "code": "KZ"}, "TCA": {"country": "Turks and Caicos Islands", "code": "TC"}, "PYF": {"country": "French Polynesia", "code": "PF"}, "NIU": {"country": "Niue", "code": "NU"}, "DMA": {"country": "Dominica", "code": "DM"}, "GBR": {"country": "United Kingdom", "code": "GB"}, "BEN": {"country": "Benin", "code": "BJ"}, "GUF": {"country": "French Guiana", "code": "GF"}, "BEL": {"country": "Belgium", "code": "BE"}, "MSR": {"country": "Montserrat", "code": "MS"}, "TGO": {"country": "Togo", "code": "TG"}, "DEU": {"country": "Germany", "code": "DE"}, "GUM": {"country": "Guam", "code": "GU"}, "LKA": {"country": "Sri Lanka", "code": "LK"}, "SSD": {"country": "South Sudan", "code": "SS"}, "FLK": {"country": "Falkland Islands (Malvinas)", "code": "FK"}, "PCN": {"country": "Pitcairn", "code": "PN"}, "BES": {"country": "Bonaire", "code": "BQ"}, "GUY": {"country": "Guyana", "code": "GY"}, "CRI": {"country": "Costa Rica", "code": "CR"}, "COK": {"country": "Cook Islands", "code": "CK"}, "MAR": {"country": "Morocco", "code": "MA"}, "MNP": {"country": "Northern Mariana Islands", "code": "MP"}, "LSO": {"country": "Lesotho", "code": "LS"}, "HUN": {"country": "Hungary", "code": "HU"}, "TKM": {"country": "Turkmenistan", "code": "TM"}, "SUR": {"country": "Suriname", "code": "SR"}, "NLD": {"country": "Netherlands", "code": "NL"}, "BMU": {"country": "Bermuda", "code": "BM"}, "HMD": {"country": "Heard Island and McDonald Mcdonald Islands", "code": "HM"}, "TCD": {"country": "Chad", "code": "TD"}, "GEO": {"country": "Georgia", "code": "GE"}, "MNE": {"country": "Montenegro", "code": "ME"}, "MNG": {"country": "Mongolia", "code": "MN"}, "MHL": {"country": "Marshall Islands", "code": "MH"}, "MTQ": {"country": "Martinique", "code": "MQ"}, "BLZ": {"country": "Belize", "code": "BZ"}, "NFK": {"country": "Norfolk Island", "code": "NF"}, "MMR": {"country": "Myanmar", "code": "MM"}, "AFG": {"country": "Afghanistan", "code": "AF"}, "BDI": {"country": "Burundi", "code": "BI"}, "VGB": {"country": "British Virgin Islands", "code": "VG"}, "BLR": {"country": "Belarus", "code": "BY"}, "BLM": {"country": "Saint Barthalemy", "code": "BL"}, "GRD": {"country": "Grenada", "code": "GD"}, "ALA": {"country": "Åland Islands", "code": "AX"}, "TKL": {"country": "Tokelau", "code": "TK"}, "GRC": {"country": "Greece", "code": "GR"}, "GRL": {"country": "Greenland", "code": "GL"}, "SHN": {"country": "Saint Helena", "code": "SH"}, "AND": {"country": "Andorra", "code": "AD"}, "MOZ": {"country": "Mozambique", "code": "MZ"}, "TJK": {"country": "Tajikistan", "code": "TJ"}, "THA": {"country": "Thailand", "code": "TH"}, "HTI": {"country": "Haiti", "code": "HT"}, "MEX": {"country": "Mexico", "code": "MX"}, "ZWE": {"country": "Zimbabwe", "code": "ZW"}, "LCA": {"country": "Saint Lucia", "code": "LC"}, "IND": {"country": "India", "code": "IN"}, "LVA": {"country": "Latvia", "code": "LV"}, "BTN": {"country": "Bhutan", "code": "BT"}, "VCT": {"country": "Saint Vincent and the Grenadines", "code": "VC"}, "VNM": {"country": "Viet Nam", "code": "VN"}, "NOR": {"country": "Norway", "code": "NO"}, "CZE": {"country": "Czech Republic", "code": "CZ"}, "ATF": {"country": "French Southern Territories", "code": "TF"}, "ATG": {"country": "Antigua and Barbuda", "code": "AG"}, "FJI": {"country": "Fiji", "code": "FJ"}, "IOT": {"country": "British Indian Ocean Territory", "code": "IO"}, "HND": {"country": "Honduras", "code": "HN"}, "MUS": {"country": "Mauritius", "code": "MU"}, "ATA": {"country": "Antarctica", "code": "AQ"}, "LUX": {"country": "Luxembourg", "code": "LU"}, "ISR": {"country": "Israel", "code": "IL"}, "FSM": {"country": "Micronesia, Federated States of", "code": "FM"}, "PER": {"country": "Peru", "code": "PE"}, "REU": {"country": "Réunion", "code": "RE"}, "IDN": {"country": "Indonesia", "code": "ID"}, "VUT": {"country": "Vanuatu", "code": "VU"}, "MKD": {"country": "Macedonia, the Former Yugoslav Republic of", "code": "MK"}, "COD": {"country": "Democratic Republic of the Congo", "code": "CD"}, "COG": {"country": "Congo", "code": "CG"}, "ISL": {"country": "Iceland", "code": "IS"}, "GLP": {"country": "Guadeloupe", "code": "GP"}, "ETH": {"country": "Ethiopia", "code": "ET"}, "COM": {"country": "Comoros", "code": "KM"}, "COL": {"country": "Colombia", "code": "CO"}, "NGA": {"country": "Nigeria", "code": "NG"}, "TLS": {"country": "Timor-Leste", "code": "TL"}, "TWN": {"country": "Taiwan, Province of China", "code": "TW"}, "PRT": {"country": "Portugal", "code": "PT"}, "MDA": {"country": "Moldova, Republic of", "code": "MD"}, "GGY": {"country": "Guernsey", "code": "GG"}, "MDG": {"country": "Madagascar", "code": "MG"}, "ECU": {"country": "Ecuador", "code": "EC"}, "SEN": {"country": "Senegal", "code": "SN"}, "ESH": {"country": "Western Sahara", "code": "EH"}, "MDV": {"country": "Maldives", "code": "MV"}, "ASM": {"country": "American Samoa", "code": "AS"}, "SPM": {"country": "Saint Pierre and Miquelon", "code": "PM"}, "CUW": {"country": "Curaçao", "code": "CW"}, "FRA": {"country": "France", "code": "FR"}, "LTU": {"country": "Lithuania", "code": "LT"}, "RWA": {"country": "Rwanda", "code": "RW"}, "ZMB": {"country": "Zambia", "code": "ZM"}, "GMB": {"country": "Gambia", "code": "GM"}, "WLF": {"country": "Wallis and Futuna", "code": "WF"}, "JEY": {"country": "Jersey", "code": "JE"}, "FRO": {"country": "Faroe Islands", "code": "FO"}, "GTM": {"country": "Guatemala", "code": "GT"}, "DNK": {"country": "Denmark", "code": "DK"}, "IMN": {"country": "Isle of Man", "code": "IM"}, "MAF": {"country": "Saint Martin (French part)", "code": "MF"}, "AUS": {"country": "Australia", "code": "AU"}, "AUT": {"country": "Austria", "code": "AT"}, "SJM": {"country": "Svalbard and Jan Mayen", "code": "SJ"}, "VEN": {"country": "Venezuela", "code": "VE"}, "PLW": {"country": "Palau", "code": "PW"}, "KEN": {"country": "Kenya", "code": "KE"}, "TUR": {"country": "Turkey", "code": "TR"}, "ALB": {"country": "Albania", "code": "AL"}, "OMN": {"country": "Oman", "code": "OM"}, "TUV": {"country": "Tuvalu", "code": "TV"}, "ITA": {"country": "Italy", "code": "IT"}, "BRN": {"country": "Brunei Darussalam", "code": "BN"}, "TUN": {"country": "Tunisia", "code": "TN"}, "RUS": {"country": "Russian Federation", "code": "RU"}, "BRB": {"country": "Barbados", "code": "BB"}, "BRA": {"country": "Brazil", "code": "BR"}, "CIV": {"country": "Côte d'Ivoire", "code": "CI"}, "SRB": {"country": "Serbia", "code": "RS"}, "GNQ": {"country": "Equatorial Guinea", "code": "GQ"}, "USA": {"country": "United States", "code": "US"}, "QAT": {"country": "Qatar", "code": "QA"}, "WSM": {"country": "Samoa", "code": "WS"}, "AZE": {"country": "Azerbaijan", "code": "AZ"}, "GNB": {"country": "Guinea-Bissau", "code": "GW"}, "SWZ": {"country": "Swaziland", "code": "SZ"}, "TON": {"country": "Tonga", "code": "TO"}, "CAN": {"country": "Canada", "code": "CA"}, "UKR": {"country": "Ukraine", "code": "UA"}, "KOR": {"country": "Korea, Republic of", "code": "KR"}, "AIA": {"country": "Anguilla", "code": "AI"}, "CAF": {"country": "Central African Republic", "code": "CF"}, "CHE": {"country": "Switzerland", "code": "CH"}, "CYP": {"country": "Cyprus", "code": "CY"}, "BIH": {"country": "Bosnia and Herzegovina", "code": "BA"}, "SGP": {"country": "Singapore", "code": "SG"}, "SGS": {"country": "South Georgia and the South Sandwich Islands", "code": "GS"}, "SOM": {"country": "Somalia", "code": "SO"}, "UZB": {"country": "Uzbekistan", "code": "UZ"}, "CMR": {"country": "Cameroon", "code": "CM"}, "POL": {"country": "Poland", "code": "PL"}, "KWT": {"country": "Kuwait", "code": "KW"}, "ERI": {"country": "Eritrea", "code": "ER"}, "GAB": {"country": "Gabon", "code": "GA"}, "CYM": {"country": "Cayman Islands", "code": "KY"}, "ARE": {"country": "United Arab Emirates", "code": "AE"}, "EST": {"country": "Estonia", "code": "EE"}, "MWI": {"country": "Malawi", "code": "MW"}, "ESP": {"country": "Spain", "code": "ES"}, "IRQ": {"country": "Iraq", "code": "IQ"}, "SLV": {"country": "El Salvador", "code": "SV"}, "MLI": {"country": "Mali", "code": "ML"}, "IRL": {"country": "Ireland", "code": "IE"}, "IRN": {"country": "Iran, Islamic Republic of", "code": "IR"}, "ABW": {"country": "Aruba", "code": "AW"}, "SLE": {"country": "Sierra Leone", "code": "SL"}, "PAN": {"country": "Panama", "code": "PA"}, "SDN": {"country": "Sudan", "code": "SD"}, "SLB": {"country": "Solomon Islands", "code": "SB"}, "NZL": {"country": "New Zealand", "code": "NZ"}, "MCO": {"country": "Monaco", "code": "MC"}, "JPN": {"country": "Japan", "code": "JP"}, "KGZ": {"country": "Kyrgyzstan", "code": "KG"}, "UGA": {"country": "Uganda", "code": "UG"}, "NCL": {"country": "New Caledonia", "code": "NC"}, "PNG": {"country": "Papua New Guinea", "code": "PG"}, "ARG": {"country": "Argentina", "code": "AR"}, "SWE": {"country": "Sweden", "code": "SE"}, "BHS": {"country": "Bahamas", "code": "BS"}, "BHR": {"country": "Bahrain", "code": "BH"}, "ARM": {"country": "Armenia", "code": "AM"}, "NRU": {"country": "Nauru", "code": "NR"}, "CUB": {"country": "Cuba", "code": "CU"}};




