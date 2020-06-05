
import os
import CPlus_Climate as cc
import json
import csv

import data_climates as ddc

class findEPWN():
	def __init__(self,city_code):
		cityL = city_code.split(' (')
		cityN = cityL[0]
		self.fileEPW = ''
		for city in ddc.epwList_: #choices: 
			if cityN == city[1]:
				self.fileEPW=city[0]
				break

class findMaxRad():
	def __init__(self,cityN):
		self.maxRad = 0
		for city in ddc.city_rad: 
			if cityN == city[1]:
				self.maxRad=str(city[2])
				print (self.maxRad)
				break

# city_rad = []
# for f in choices:
# 	_radMaxF = "__RadScale/"+f[0]+"/autoscale.txt"
# 	with open(_radMaxF, "r") as lf:
# 		maxRad = lf.read(10)
# 		city_rad.append((f[0],f[1],maxRad))

# print (city_rad)


# epwDir = 'D:/WTHCODE/epw/' #desktop
# epwDir = 'D:/EC2/AWSMOOC/static/epw_temp/' #desktop
epwDir = 'B:/Dropbox (MIT)/EC2/AWSMOOC/static/epw_temp/'
class citylists():
	def __init__(self):
		epwList = []
		htmlList =[]
		with os.scandir(epwDir) as entries:
			for entry in entries: 
				filename_ = entry.name
				filename = filename_.replace('.epw','')
				fileloc = epwDir+filename_
				with open (fileloc) as data:
					reader= csv.reader(data)
					epwdata = list(reader)
					city= epwdata[0][1]
					countryCode= epwdata[0][3]
					lat, lon, tz = round((float(epwdata[0][6])),0), round((float(epwdata[0][7]))*-1,0), round((float(epwdata[0][8]))*-15,0)
					epwList.append((filename,city,lat,lon,tz))
					htmlList.append(city+" ("+countryCode+")")
			with open ('filecitylist_temp.txt','w') as fl:
				fl.write(json.dumps(epwList))
			with open ('cityhtml_temp.txt','w') as fl:
				fl.write(json.dumps(htmlList))

# citylists()

class runCumRad():
	def __init__(self, ff):
		epwMainList = []
		epwList = ddc.epwList_temp
		for epw in range (0,1):
			EPW_FILE = 'static/epw/'+epwList[epw][0]+'.epw'
			# EPW_FILE = 'WeatherFile/'+epwList[epw][0]+'.epw'
			print (EPW_FILE)
			filename, loc_,maxRad, lat, lon, tz = epwList[epw][0],epwList[epw][1],1700,epwList[epw][2],epwList[epw][3],epwList[epw][4]
			loc__ = loc_.replace(" ", "")
			location = loc__.replace(".", "")
			
			os.system('cp '+EPW_FILE+' '+ff+'/climate_file.epw')
			os.system('./'+ff+'/CreateRadiationMap.sh ' + ff + ' ' + str(lat) + ' ' + str(lon) + ' ' + str(tz)) # takes 'climate_file.epw'
			os.system('./'+ff+'/CreateRadiationMap_t.sh '+ ff + ' ' + filename)

			_radMaxF = "static/radmap/"+filename+".txt"
			with open(_radMaxF, "r") as lf:
				maxRad = lf.read(10)
			os.remove(_radMaxF)
			epwMainList.append((filename, location, maxRad, lat, lon, tz))

		#print (epwMainList)
		#with open("static/radmap/maxRadVals.txt",'w') as _maxRadVals:
			#_maxRadVals.write(epwMainList)
		with open ("static/radmap/maxRadVals_temp.txt",'w') as fl:
			fl.write(json.dumps(epwMainList))
		#return epwMainList