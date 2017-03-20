import csv
from pylab import *

class simImp:
    def __init__(self, fileName):
        self.fileSim= fileName
        data= open (fileName)
        reader= csv.reader(data)
        self.dataList= list(reader)
        #del (self.dataList[0])

    def dataSim(self):
        return self.dataList

class wrangleData:
    def __init__(self,dataSim):
        self.dataSim= dataSim
        self.overHeatingHours=0
        self.overHeatingHours_noNV=0
        self.effWindVelocity=0
        self.adaptiveComfortHours=0
        self.highTolHeatHours=0
        self.lowTolHeatHours=0

        self.tempOut=[]
        self.tempOpe=[]
        self.outdoorMean=[]
        self.windVel=[]
        self.RHin=[]
        self.RHout=[]

        colNo=len(self.dataSim[0])
        print colNo
        iTout=1; iRHout=2; iWV=3; iTope=6; iRHin=8; iToutMean=9
        for i in arange(colNo):
            if self.dataSim[0][i]=='Environment:Site Outdoor Air Drybulb Temperature [C](Hourly)': iTout=i
            elif self.dataSim[0][i]=='Environment:Site Outdoor Air Relative Humidity [%](Hourly)': iRHout=i
            elif self.dataSim[0][i]=='Environment:Site Wind Speed [m/s](Hourly)': iWV=i
            elif self.dataSim[0][i]=='UNZ_0:Zone Operative Temperature [C](Hourly)': iTope=i
            elif self.dataSim[0][i]=='UNZ_0:Zone Air Relative Humidity [%](Hourly)': iRHin=i
            elif self.dataSim[0][i]=='PEOPLE UNZ_0:Zone Thermal Comfort ASHRAE 55 Adaptive Model Running Average Outdoor Air Temperature [C](Hourly) ': iToutMean=i

        del (self.dataSim[0])
        for i in self.dataSim:
            self.tempOpe.append(float(i[iTope]))
            self.outdoorMean.append(float(i[iToutMean]))
            self.RHin.append(float(i[iRHin]))

            self.tempOut.append(float(i[iTout]))
            self.windVel.append(float(i[iWV]))
            self.RHout.append(float(i[iRHout]))

        self.tempOptiIndoor=[]
        self.accHigh=[]
        self.accLow=[]
        self.accHigh_lowTol=[]
        self.accHigh_highTol=[]
        self.hours=[]
        self.indicator_AC=[]
        self.indicator_HT=[]
        self.indicator_LT=[]
        self.effWindIndicator=[]
        self.effHumidityIndicator=[]

        self.totalHours= len(self.dataSim)
        for i in range (0,self.totalHours):
            self.hours.append(i)
            calcTemp= 17.8 + 0.31*self.outdoorMean[i]
            self.tempOptiIndoor.append(calcTemp)
            self.accHigh.append(calcTemp+3.5)
            if self.tempOut>=12:
                self.accHigh_highTol.append(calcTemp+3.5+1.2)
                self.accHigh_lowTol.append(calcTemp+3.5+0.8)
            if self.tempOut<12:
                self.accHigh_lowTol.append(calcTemp+3.5)
                self.accHigh_lowTol.append(calcTemp+3.5+0.8)
            self.accLow.append(calcTemp-3.5)
            if (self.tempOpe[i]>self.accHigh[i]):
                self.overHeatingHours+=1
            if (self.tempOpe[i]>self.accHigh_highTol[i]):
                self.highTolHeatHours+=1
            if (self.tempOpe[i]>self.accHigh_lowTol[i]):
                self.lowTolHeatHours+=1

            if self.accLow[i] <= self.tempOpe[i] <= self.accHigh[i]:
                self.adaptiveComfortHours+=1
                self.indicator_AC.append(-200)
                self.indicator_LT.append(-200)
                self.indicator_HT.append(-200)
            elif self.tempOpe[i]< self.accLow[i]:
                self.indicator_AC.append(-200)
                self.indicator_LT.append(-200)
                self.indicator_HT.append(-200)
            elif self.accLow[i]<self.tempOpe[i]<=self.accHigh_lowTol[i]:
                self.indicator_AC.append(100)
                self.indicator_LT.append(-200)
                self.indicator_HT.append(-200)
            elif self.accHigh_lowTol[i]<self.tempOpe[i]<=self.accHigh_highTol[i]:
                self.indicator_AC.append(100)
                self.indicator_LT.append(100)
                self.indicator_HT.append(-200)
            elif self.tempOpe[i]>=self.accHigh_highTol[i]:
                self.indicator_AC.append(100)
                self.indicator_LT.append(100)
                self.indicator_HT.append(100)

            if self.RHin[i] > 85:
                self.effHumidityIndicator.append(1)
            elif self.RHin[i]<20:
                self.effHumidityIndicator.append(-1)
            elif 20<=self.RHin[i]<=80:
                self.effHumidityIndicator.append(-1)
        self.ventiEff=(self.overHeatingHours_noNV-self.overHeatingHours)/self.totalHours

class plotAll:
    def __init__(self,wrangledData):

        AC=wrangledData.indicator_AC
        HT=wrangledData.indicator_HT
        LT=wrangledData.indicator_LT
        humIndi=wrangledData.effHumidityIndicator
        self.totalH=wrangledData.totalHours
        Ind_HT=[]
        Ind_LT=[]
        Ind_AC=[]
        Hum=[]
        for i in range (0,1):
            Ind_HT.append(HT)
            Ind_LT.append(LT)
            Ind_AC.append(AC)
            Hum.append(humIndi)


        #////////////////
        self.fig_LT= plt.figure(dpi=100, figsize=(10,5))
        lt=plt.subplot2grid((11,1),(0,0), rowspan=9)
        lt.plot(wrangledData.tempOut, linewidth=0.5, color='darkslategrey', alpha=0.4)
        lt.plot(wrangledData.tempOpe, 'o', markersize=1.5, markerfacecolor='#808080', markeredgecolor='darkslategrey')
        lt.fill_between(wrangledData.hours, wrangledData.accLow, wrangledData.accHigh, facecolor='#808080', edgecolor='none', alpha=0.4)
        lt.fill_between(wrangledData.hours, wrangledData.accHigh, wrangledData.accHigh_lowTol, facecolor='#808080', edgecolor='none', alpha=0.3)
        self.axesHideM(lt)

        t1=plt.subplot2grid((11,1),(9,0))
        t1.pcolor(Ind_LT, cmap='Reds')
        rh1=plt.subplot2grid((11,1),(10,0))
        rh1.pcolor(Hum, cmap='Greens')
        self.axesHideS(t1)
        self.axesHideS(rh1)
        plt.subplots_adjust(hspace = .005)
        self.plotProp()

        #////////////////
        self.fig_HT= plt.figure(dpi=100, figsize=(10,5))
        ht=plt.subplot2grid((11,1),(0,0), rowspan=9)
        ht.plot(wrangledData.tempOut, linewidth=0.5, color='darkslategrey', alpha=0.4)
        #ht.plot(wrangledData.tempOpe, 'o', markersize=1.5, markerfacecolor='#808080', markeredgecolor='#DAA520')
        ht.plot(wrangledData.tempOpe, 'o', markersize=1.5, markerfacecolor='#808080', markeredgecolor='darkslategrey')
        ht.fill_between(wrangledData.hours, wrangledData.accLow, wrangledData.accHigh, facecolor='#808080', edgecolor='none', alpha=0.4)
        ht.fill_between(wrangledData.hours, wrangledData.accHigh, wrangledData.accHigh_lowTol, facecolor='#808080', edgecolor='none', alpha=0.3)
        ht.fill_between(wrangledData.hours, wrangledData.accHigh_lowTol, wrangledData.accHigh_highTol, facecolor='#808080', edgecolor='none', alpha=0.2)
        self.axesHideM(ht)
        t2=plt.subplot2grid((11,1),(9,0))
        t2.pcolor(Ind_HT, cmap='Reds')
        rh2=plt.subplot2grid((11,1),(10,0))
        rh2.pcolor(Hum, cmap='Greens')
        self.axesHideS(t2)
        self.axesHideS(rh2)
        plt.subplots_adjust(hspace = .005)
        self.plotProp()

        #////////////////
        self.fig_AC= plt.figure(dpi=100, figsize=(10,5))
        psyCoolOff=plt.subplot2grid((11,1),(0,0), rowspan=9)
        psyCoolOff.plot(wrangledData.tempOut, linewidth=0.5, color='darkslategrey', alpha=0.4)
        psyCoolOff.plot(wrangledData.tempOpe, 'o', markersize=1.5, markerfacecolor='#808080', markeredgecolor='darkslategrey')
        psyCoolOff.fill_between(wrangledData.hours, wrangledData.accLow, wrangledData.accHigh, facecolor='#808080', edgecolor='none', alpha=0.4)
        self.axesHideM(psyCoolOff)
        t3=plt.subplot2grid((11,1),(9,0))
        t3.pcolor(Ind_AC, cmap='Reds')
        rh3=plt.subplot2grid((11,1),(10,0))
        rh3.pcolor(Hum, cmap='Greens')
        self.axesHideS(t3)
        self.axesHideS(rh3)
        plt.subplots_adjust(hspace = .005)
        self.plotProp()

    def axesHideM(self,subplot):
        xgap=self.totalH/12
        plt.yticks((45,40,35,30,25,20,15,10,5,0,-5,-10,-15,-20),(45,40,35,30,25,20,15,10,5,0,-5,-10,-15,-20))
        plt.xticks((xgap/2,xgap*3/2,xgap*5/2,xgap*7/2,xgap*9/2,xgap*11/2,xgap*13/2,xgap*15/2,xgap*17/2,xgap*19/2,xgap*21/2,xgap*23/2),
                   ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"))
        for xlabel_i in subplot.axes.get_xticklabels():
            #xlabel_i.set_visible(True)
            xlabel_i.set_fontsize(8.0)
        for ylabel_i in subplot.axes.get_yticklabels():
            ylabel_i.set_fontsize(0.0)
            ylabel_i.set_visible(False)
        for tick in subplot.axes.get_xticklines():
            tick.set_visible(True)
        for tick in subplot.axes.get_yticklines():
            tick.set_visible(True)

    def axesHideS(self,subplot):
        plt.yticks((0,1),(0,1))
        for xlabel_i in subplot.axes.get_xticklabels():
            xlabel_i.set_visible(False)
            xlabel_i.set_fontsize(0.0)
        for xlabel_i in subplot.axes.get_yticklabels():
            xlabel_i.set_fontsize(0.0)
            xlabel_i.set_visible(False)
        for tick in subplot.axes.get_xticklines():
            tick.set_visible(True)
        for tick in subplot.axes.get_yticklines():
            tick.set_visible(False)

    def plotProp(self):
        #plt.ylim(-15)
        #plt.xlim(self.totalH)
        plt.plot( edgecolor='darkslategray', facecolor='darkslategray', color='darkslategray')
        #plt.figure(edgecolor='darkslategray', facecolor='darkslategray')
        plt.subplots_adjust(left=None, bottom=None, right=None, top=None, wspace=None, hspace=None)
        plt.tight_layout(pad=0)
        #plt.axis('off')
        #plt.show()
"""
Classes for data uploading and computation ends here
"""
#s=simImp('RESIDENTIAL.csv')
#w=wrangleData(s.dataSim())
#plotAll(w)
