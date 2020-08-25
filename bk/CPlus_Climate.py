
import csv
from statistics import mean
import math


class wthImp:
    def __init__(self, epwWthFile):
        data= open (epwWthFile)
        reader= csv.reader(data)
        self.dataList= list(reader)

    def dataWth(self):
        return self.dataList

class wrangleWth:
    def __init__(self,importedWth):
        self.wth=importedWth
        self.latitude=float(self.wth[0][6])
        self.longitude=float(self.wth[0][7])
        self.timezone=float(self.wth[0][8])
        self.city=str(self.wth[0][1])
        self.region=str(self.wth[0][2])
        self.country=self.wth[0][3]

        self.month=[] #epw at column[1]
        self.day=[] #epw at column[2]
        self.hour=[] #epw at column[3]
        self.Tdb=[] #epw at column[6]
        self.Tdp=[] #epw at column[7]
        self.RHout=[] #epw at column[8]
        self.BP=[] #epw at column[9]
        self.RadGlobal=[] #epw at column[13] in Wh/m2
        self.RadNormal=[] #epw at column[14] in Wh/m2
        self.RadDif=[] #epw at column[15] in Wh/m2
        self.windDir=[] #epw at column[20]
        self.windVel=[] #epw at column[21]
        del (self.wth[0:8])
        self.len= len(self.wth)

        for i in self.wth:
            self.month.append(i[1])
            self.day.append(i[2])
            self.hour.append(int(i[3]))
            self.Tdb.append(float(i[6]))
            self.Tdp.append(float(i[7]))
            self.RHout.append(float(i[8]))
            self.BP.append(float(i[9]))
            self.RadGlobal.append(float(i[13]))
            self.RadNormal.append(float(i[14]))
            self.RadDif.append(float(i[15]))
            self.windDir.append(float(i[20]))
            self.windVel.append(float(i[21])) 

    def WTH(self):
        return {"latitude":self.latitude, "longitude":self.longitude, "timezone":self.timezone,
            "db":self.Tdb, "dp":self.Tdp, "rh":self.RHout, "bp":self.BP, 
            "radg":self.RadGlobal, "radn":self.RadNormal, "radd":self.RadDif, 
            "wd":self.windDir, "wv":self.windVel}

class sunPath: 
    def __init__(self,radfacade):
        _rf = radfacade
        self.analemma= {}
        self.june, self.dec, self.mar=[],[],[] #june21 is on day 172
        self.june_, self.dec_, self.mar_=[],[],[] #new lists if there is a change of direction.
        dir_shift, dir_shiftM, dir_shiftD = 0,0,0
        hourCounterJ, firstHrJ = 0, 0
        hourCounterD, firstHrD = 0, 0
        hourCounterM, firstHrM = 0, 0

        for dhr in range (24):
            alt_temp, azi_temp = [], []
            for hr in range (0+dhr,len(_rf.altitude),24):
                if _rf.altitude[hr] > 0 :
                    alt_temp.append(_rf.altitude[hr]) 
                    azi_temp.append(_rf.azimuth[hr])
            self.analemma.update({dhr : [alt_temp,azi_temp]})
            
            # if alt_temp != []: 
            #     maxIndex = alt_temp.index(max(alt_temp))
                # self.june.append([alt_temp[maxIndex],azi_temp[maxIndex]])
                # self.june[1].append(azi_temp[maxIndex])

            if _rf.azimuth[171*24+dhr] != 0:
                hourCounterJ += 1
                if hourCounterJ == 1 : 
                    firstHrJ = dhr
                    self.june.append([0,_rf.azimuth[171*24+dhr]+0.3*(_rf.azimuth[171*24+dhr]-_rf.azimuth[171*24+dhr+1])])
                if (_rf.altitude[171*24+dhr] - self.june[-1][0]) > 0 :
                    self.june.append([_rf.altitude[171*24+dhr],_rf.azimuth[171*24+dhr]])
                else: 
                    dir_shift += 1
                    if dir_shift == 1: 
                        if abs(_rf.azimuth[171*24+dhr-1] - _rf.azimuth[171*24+dhr])<75: 
                            self.june_.append([_rf.altitude[171*24+dhr-1],_rf.azimuth[171*24+dhr-1]])
                        else: self.june_.append([_rf.altitude[171*24+dhr-1],-1*(_rf.azimuth[171*24+dhr-1])])
                    self.june_.append([_rf.altitude[171*24+dhr],_rf.azimuth[171*24+dhr]])
            
            if _rf.azimuth[355*24+dhr] != 0:
                hourCounterD += 1
                if hourCounterD == 1 : 
                    firstHrD = dhr
                    self.dec.append([0,_rf.azimuth[355*24+dhr]+0.3*(_rf.azimuth[355*24+dhr]-_rf.azimuth[355*24+dhr+1])])
                if (_rf.altitude[355*24+dhr] - self.dec[-1][0]) > 0 and (_rf.azimuth[355*24+dhr]*self.dec[-1][1] > 0):
                # if (_rf.azimuth[355*24+dhr] + self.dec[-1][1]) < 0 :
                    self.dec.append([_rf.altitude[355*24+dhr],_rf.azimuth[355*24+dhr]])
                else: 
                    dir_shiftD += 1
                    if dir_shiftD == 1: 
                        if abs(_rf.azimuth[355*24+dhr-1] - _rf.azimuth[355*24+dhr])<75: 
                            self.dec_.append([_rf.altitude[355*24+dhr-1],_rf.azimuth[355*24+dhr-1]])
                        else: self.dec_.append([_rf.altitude[355*24+dhr-1],-1*(_rf.azimuth[355*24+dhr-1])])
                    self.dec_.append([_rf.altitude[355*24+dhr],_rf.azimuth[355*24+dhr]])

                # self.dec.append([_rf.altitude[355*24+dhr],_rf.azimuth[355*24+dhr]])
            
            if _rf.azimuth[80*24+dhr] != 0:
                hourCounterM += 1
                if hourCounterM == 1 : 
                    firstHrM = dhr
                    self.mar.append([0,_rf.azimuth[80*24+dhr]+0.3*(_rf.azimuth[80*24+dhr]-_rf.azimuth[80*24+dhr+1])])
                if (_rf.altitude[80*24+dhr] - self.mar[-1][0]) > 0 :
                    self.mar.append([_rf.altitude[80*24+dhr],_rf.azimuth[80*24+dhr]])
                else: 
                    dir_shiftM += 1
                    if dir_shiftM == 1: 
                        if abs(_rf.azimuth[80*24+dhr-1] - _rf.azimuth[80*24+dhr])<75: 
                            self.mar_.append([_rf.altitude[80*24+dhr-1],_rf.azimuth[80*24+dhr-1]])
                        else: self.mar_.append([_rf.altitude[80*24+dhr-1],-1*(_rf.azimuth[80*24+dhr-1])])
                    self.mar_.append([_rf.altitude[80*24+dhr],_rf.azimuth[80*24+dhr]])
        self.june_.append([0,_rf.azimuth[171*24+hourCounterJ+firstHrJ-1]+0.3*(_rf.azimuth[171*24+hourCounterJ+firstHrJ-1]-_rf.azimuth[171*24+hourCounterJ+firstHrJ-2])])
        self.mar_.append([0,_rf.azimuth[80*24+hourCounterM+firstHrM-1]+0.3*(_rf.azimuth[80*24+hourCounterM+firstHrM-1]-_rf.azimuth[80*24+hourCounterM+firstHrM-2])])
        self.dec_.append([0,_rf.azimuth[355*24+hourCounterD+firstHrD-1]+0.3*(_rf.azimuth[355*24+hourCounterD+firstHrD-1]-_rf.azimuth[355*24+hourCounterD+firstHrD-2])])
        # print ('+++++++++',self.mar, self.mar_)
        # print ('+++++++++',self.dec, self.dec_)

class degreeDays:
    def __init__(self,db, HDDsp, CDDsp):
        # self.wth=wrangledWth
        self.hSchedule=[]
        self.cSchedule=[]
        
        self.heatingHours=0
        self.coolingHours=0

        #/////////////////////////////
        #calculating for CDD10 and HDD18 as per ASHRAE 90.1
        binDD=24
        if isinstance (CDDsp,str):  CDDsp = 10
        if isinstance (HDDsp,str):  HDDsp = 18
        self.setCDD=round(float(CDDsp),1)
        self.setHDD=round(float(HDDsp),1)
        self.CDD=0
        self.HDD=0
        cddL, hddL=[], []
        self.CDDL, self.HDDL = [], []

        for i in range (0,len(db),binDD):
            temp=0.5*(max(db[i:i+binDD-1])+min(db[i:i+binDD-1]))
            #temp/=binDD
            #temp is the average daily temperature for CDD calculation
            if temp>self.setCDD:
                cdd = round((temp-self.setCDD),1)
                self.CDD += cdd
                cddL.append(cdd)
                hddL.append(0)
            elif temp<self.setHDD: 
                hdd = round((self.setHDD-temp),1)
                self.HDD += hdd
                hddL.append(hdd)
                cddL.append(0)
        
        for month in range(12): # for every month in the year
            months = [31,28,31,30,31,30,31,31,30,31,30,31] # the number of days in each month
            m = int(sum(months[:month]))
            numDays = months[month] # the number of days in this month
            cddm = round(sum(cddL[m:m+numDays]),1)
            hddm = round(sum(hddL[m:m+numDays]),1)
            self.CDDL.append(cddm)
            self.HDDL.append(hddm)

        # print ('daily heating degree days',len(self.HDDL))


class CZdef:
    def __init__(self,degreeDays):

        self.DD = degreeDays
        self.CZ=''
        if 6000<self.DD.CDD: self.CZ='CZ0'
        elif 5000<self.DD.CDD<=6000: self.CZ='CZ1'
        elif 3500<self.DD.CDD<=5000: self.CZ='CZ2'
        elif self.DD.CDD<3500 and self.DD.HDD<=2000: self.CZ='CZ3'
        elif 2000<self.DD.HDD<=3000 and self.DD.CDD<3500: self.CZ='CZ4'
        elif 3000<self.DD.HDD<=4000 and self.DD.CDD<=3500: self.CZ='CZ5'
        elif 4000<self.DD.HDD<=5000: self.CZ='CZ6'
        elif 5000<self.DD.HDD<=7000: self.CZ='CZ7'
        else: self.CZ='CZ8'


class windEnergy:
    def __init__(self, wv, turb_D, turb_H):

        #Wind turbine power curve (wind speed given in m/s, wind wpoer in kW). values are given from 1m/s to 30 m/s.
        #WTPCurve00 is for NEG Micon 1000/54, source: danish wind industry association
        self.WTPCurve00 = [0,0,0,10,51,104,186,291,412,529,655,794,911,986,1006,998,984,971,960,962,967,974,980,985,991,0,0,0,0,0]
        self.WTPCdefault = [0,0,2,17,45,72,124,196,277,364,444,533,584,618,619,620,610,594,592,590,580,575,570,0,0,0,0,0]

         # P = Power output, kWh/year. P output in watts for every hour
        self.Cp = 0.3 # Cp = Maximum power coefficient, ranging from 0.25 to 0.45, dimension less (theoretical maximum = 0.59)
        ρ = 1.225 # ρ = Air density, kg/m³
        self.D = turb_D # A = Rotor swept area, m² or π D² / 4 (D is the rotor diameter in m, π = 3.1416)
        self.H = turb_H
        δmet, αmet, δ, α, hmet = 270,0.14,370,0.22, 10
        self.P = 0
        for V in wv: # V = Wind speed, mps; Power = Cp 1/2 ρ A V³
            _met = round((δmet/hmet)**αmet,1)
            _tur = round((self.H/δ)**α,1)
            U = round(V * _met * _tur,1)
    
            P = self.Cp * 0.5 * ρ * math.pi * self.D**2 * 0.25 * U**3
           
            self.P += round(P/1000,0)
            # print ("**************", self.P, V, U)
        # self.powerCurve = []
        # for v in range(0,30): 
        #     p = self.Cp * 0.5 * ρ * math.pi * self.D**2 * 0.25 * v**3
        #     self.powerCurve.append(round(p,0)) 

        
class radFacade:
    def __init__(self,lat,lon,radn,radd,radg):

        # Important input info: lon is -1*longitude of wth data and tz is -15*timezone of wth data
        print (lon, lat)
        a, b, c = 0.017453292, 57.29577951, 0.261799387
        d, e, f, g  = 0.03369, 0.0666666, 0.017699113, 0.017073873
        skyfacS, skyfacN, skyfacW, skyfacE = 50,50,50,50
        groundref, surroundref = 20, 40
        self.altitude, self.azimuth, self.june, self.dec = [],[],[],[]
        self.horradM =[]
        self.dirradHS, self.dirradMS, self.difradHS, self.difradMS, self.radMS, self.radHS = [],[],[],[],[],[]
        self.dirradHE, self.dirradME, self.radME, self.radHE = [],[],[],[]
        self.dirradHW, self.dirradMW, self.radMW,self.radHW = [],[],[],[]
        self.dirradHN, self.dirradMN, self.radMN,self.radHN = [],[],[],[]
        self.sun24hr = {}
        for days in range (1,366):
            for hour in range (24):
                jul = days
               
                dec = 0.4093 * math.sin(g * (jul - 81))
                
                solartimeadj = 1*(0.17*math.sin(d * (jul - 80) ) - 0.129 * math.sin( f * (jul - 8))) + e * (lon - lon)
                #1*(0.17*math.sin(d*(jul-80))) - 0.129*math.sin(f*(jul-8)) + e*(75-71.02)
                solartime = solartimeadj + (hour+1)

                alt = b * math.asin(math.sin(a*lat)*math.sin(dec) - (math.cos(a*lat)*math.cos(dec)*math.cos(solartime*c)))
                altitude = alt if alt>0 else 0
                self.altitude.append(round(altitude,1))

                az = math.cos(dec)*math.sin(solartime*c)
                az_ = -1*math.cos(a*lat)*math.sin(dec) - math.sin(a*lat)*math.cos(dec)*math.cos(solartime*c)
                azi = -1*b*math.atan2(az_,az)
                azimuth = 0 if alt <0 else ((azi - 270) if azi>90 else (azi+90))
                self.azimuth.append(round(azimuth,1))
                #Diffuse radiation on vertical surfaces
                #Given that sky factors for all surfaces are similar, diffuse radation on all surfaces will be the same.
                refrad = 0.5*groundref/100 + 0.5*math.cos(a*90*skyfacS/50)*surroundref/100
                # difradS = self.wth.RadDif[(days-1)*24 + hour]* (0.5*(1-math.cos(a*90*skyfacS/50)) + refrad)
                difradS = radd[(days-1)*24 + hour]* (0.5*(1-math.cos(a*90*skyfacS/50)) + refrad)
                self.difradHS.append(difradS)

                #Direct radiation on vertical surfaces
                # dirradh = self.wth.RadNormal[(days-1)*24 + hour]
                dirradh = radn[(days-1)*24 + hour]
                
                costhetaS = math.cos(a*azimuth)*math.cos(a*altitude) if altitude>0 else 0
                dirradS = dirradh*costhetaS
                if costhetaS>0: 
                    if not 90*(50-skyfacS)/50 < altitude: dirradS = 0
                else: dirradS = 0
                self.dirradHS.append(dirradS)
                self.radHS.append(dirradS+difradS)

                costhetaE = math.sin(a*azimuth)*math.cos(a*altitude) if altitude>0 else 0
                dirradE = dirradh*costhetaE if costhetaE>0 else 0
                self.dirradHE.append(dirradE)
                self.radHE.append(dirradE+difradS)

                costhetaW = -1*math.sin(a*azimuth)*math.cos(a*altitude) if altitude>0 else 0
                dirradW = dirradh*costhetaW if costhetaW>0 else 0
                self.dirradHW.append(dirradW)
                self.radHW.append(dirradW+difradS)

                costhetaN = -1*math.cos(a*azimuth)*math.cos(a*altitude) if altitude>0 else 0
                dirradN = dirradh*costhetaN if costhetaN>0 else 0
                self.dirradHN.append(dirradN)
                self.radHN.append(dirradN+difradS)
            


        #Monthly radiation on vertical surfaces
        for month in range(12): # for every month in the year
            months = [31,28,31,30,31,30,31,31,30,31,30,31] # the number of days in each month
            m = int(sum(months[:month]))
            
            numDays = months[month] # the number of days in this month  
            # horradm = sum(self.wth.RadGlobal[m*24:(m+numDays)*24])
            horradm = sum(radg[m*24:(m+numDays)*24])
            self.horradM.append(round(horradm/1000,0))
            difradms = sum(self.difradHS[m*24:(m+numDays)*24])
            self.difradMS.append(difradms/1000)

            dirradmS = sum(self.dirradHS[m*24:(m+numDays)*24]) 
            self.dirradMS.append(dirradmS/1000)
            self.radMS.append(round((dirradmS+difradms)/1000,0))

            dirradmE = sum(self.dirradHE[m*24:(m+numDays)*24]) 
            self.dirradME.append(dirradmS/1000)
            self.radME.append(round((dirradmE+difradms)/1000,0))

            dirradmW = sum(self.dirradHW[m*24:(m+numDays)*24]) 
            self.dirradMW.append(dirradmW/1000)
            self.radMW.append(round((dirradmW+difradms)/1000,0))

            dirradmN = sum(self.dirradHN[m*24:(m+numDays)*24]) 
            self.dirradMN.append(dirradmN/1000)
            self.radMN.append(round((dirradmN+difradms)/1000,0))


class monthlyData:
    def __init__(self,db):

        # self.wth=wrangledWth

        '''
        Lists of hourly values. 24 hours x 12 months = 288 values total per list
        '''
        self.hourlyMean=[]
        self.hourlyMax=[]
        self.hourlyMin=[]
  
        for month in range(12): # for every month in the year
            months = [31,28,31,30,31,30,31,31,30,31,30,31] # the number of days in each month
            m = int(sum(months[:month]))
            
            numDays = months[month] # the number of days in this month
            for hour in range(24): # for every hour in the day
                # find the average hourly temp
                
                # self.wth.Tdb is the list of hourly tempuratures. Has 24 * 365 = 8760 values total.

                # calculate the average hourly temperature
                avgtemp = sum(db[m*24+hour:(m+numDays)*24+hour:24]) 
                avgtemp /= numDays # avgTemp is the sum of the hourly tempurature for each day in this month
                self.hourlyMean.append(avgtemp)

                # calculate the max hourly temperature
                maxtemp = max(db[m*24+hour:(m+numDays)*24+hour:24])
                self.hourlyMax.append(maxtemp)

                # calculate the min hourly temperature
                mintemp = min(db[m*24+hour:(m+numDays)*24+hour:24])
                self.hourlyMin.append(mintemp)


'''
Use the code here-under to test the functions in here.
'''
#'''
city = 0
HDD = 0
CDD = 0
cz = 0

# if __name__ == "__main__":

#     wi = wthImp('Boston.csv')
#     ww = wrangleWth(wi.dataWth())
#     dd = degreeDays(ww,18,10)
#     cz_ = CZdef(dd)
#     md = monthlyData(ww)

#     rf = radFacade(ww)
#     sunPath(rf)

#     city = ww.city
#     HDD = int(dd.HDD)
#     CDD = int(dd.CDD)
#     cz = cz_.CZ
#'''