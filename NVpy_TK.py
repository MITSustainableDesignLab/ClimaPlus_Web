import os

import Tkinter
from Tkinter import *
from tkFileDialog import *
import tkMessageBox

from subprocess import Popen


from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2TkAgg
from PIL import Image, ImageTk

import NVpy_DATA as mainPY
import SimFilesAccess as F

import re

#--------------------------
#--------------------------
#TKINTER
fg='black'
bg='white'
fg2='orange'
xLoc3=0.67
wrapLenP2=210
rightPane=0.18
leftPane=0.95
R='Residence'
Off='Office'
Rt='Retail'


class Page(Frame):
    def __init__(self, *args, **kwargs):
        Frame.__init__(self, *args, **kwargs)

        self.cwdPy=os.getcwd()
        self.eplusProgramPath= str(self.cwdPy)+'\EnergyPlusV8-1-0 '
        self.eplusDir=str(self.cwdPy)+'\EnergyPlusV8-1-0\RunEplusV811CLIMA.bat '
        self.wthDir=str(self.cwdPy)+'\WeatherFile\USA_IL_Chicago'
        self.wth=['Chicago','Chicago','Chicago','Chicago']
        self.envelop='temperate'
        self.TM='on'
        self.tolLevel='low'

        self.programSelected=R

    def show(self):
        self.lift()

class Page1(Page):
    def __init__(self, *args, **kwargs):
        Page.__init__(self, *args, **kwargs)

        ##Labels
        backgroundP1=Frame(self, bg=bg)
        backgroundP1.pack(expand=1, fill=BOTH)

        ##Load EPW Buttons
        imgGo = ImageTk.PhotoImage(Image.open('image\w_.png'))
        iconGo=Button(self,image=imgGo, bg=bg, command=self.askdirectory)
        iconGo.image=imgGo
        iconGo.place(relx=0.5,rely=0.50,anchor=CENTER)
        #Button(self, text='LOAD EPW', font=12, bg=bg, fg=fg,command=self.askdirectory).place(relx=0.43, rely=0.45, relwidth=0.15, relheight=0.04)
        self.wthFileUsed=Label(self, text=self.wth[3], fg=fg, bg=bg, font=(None,11)).place(relx=0.5, rely=0.60, anchor=CENTER)

        ##Choose Function Button
        imgFunc = ImageTk.PhotoImage(Image.open('image\Build_.png'))
        iconFunc=Label(self,image=imgGo, bg=bg)
        iconFunc.image=imgFunc
        #iconFunc.place(relx=0.35,rely=0.50, anchor=CENTER)
        #Label(self, text="SELECT PROGRAM", bg=bg, fg=fg, font=(None,8)).place(relx=0.3, rely=0.55, relwidth=0.15,)
        var = StringVar(self)
        var.set('Residence')
        choices = ['Residence', 'Office', 'Retail']
        option = OptionMenu(self, var, *choices, command=self.get_Val)
        option.place(relx=0.35,rely=0.50, anchor=CENTER)
        option.configure(font=(None,12), bg=bg, fg=fg, image=imgFunc)
        menu = option.nametowidget(option.menuname)
        menu.configure(font=10)
        Label(self, text=self.programSelected, fg=fg, bg=bg, font=(None,11)).place(relx=0.35, rely=0.60, anchor=CENTER)

        #run eplus icon button
        imgEplus = ImageTk.PhotoImage(Image.open('image\EPlus_.png'))
        iconEplus=Button(self,image=imgEplus, bg=bg,command=self.runEPlusRes)
        iconEplus.image=imgEplus
        iconEplus.place(relx=0.65,rely=0.5,anchor=CENTER)
        Label(self, text="Run", fg=fg, bg=bg, font=(None,11)).place(relx=0.65, rely=0.60, anchor=CENTER)

        #upload eplus csv icon button
        imgCSV = ImageTk.PhotoImage(Image.open('image\CSV_.png'))
        iconCSV=Button(self,image=imgCSV, bg=bg,command=self.askdirectoryCSV)
        iconCSV.image=imgCSV
        iconCSV.place(relx=0.80,rely=0.5,anchor=CENTER)
        Label(self, text="Load Result", fg=fg, bg=bg, font=(None,11)).place(relx=0.80, rely=0.60, anchor=CENTER)

    def get_Val(self,value):
        if str(value)=='Residence':
            self.programSelected=R
        elif str(value)=='Office':
            self.programSelected=Off
        else: self.programSelected=Rt
        Label(self, bg=bg).place(relx=0.35, rely=0.60, anchor=CENTER, relwidth=0.15)
        Label(self, text=self.programSelected, fg=fg, bg=bg, font=(None,11)).place(relx=0.35, rely=0.60, anchor=CENTER)
        print self.programSelected

    def progressRepo(self):
        self.pro=Label(rootM, text='R  U  N  N  I  N  G . . . ',width=8, bg=fg, fg=bg, font=(None,15))
        self.pro.place(relx=0, rely=0.95, relwidth=1, relheight=0.04)

    def progressEnd(self):
        self.pro.place_forget()

    def runEPlusRes(self):
        wth=self.wthDir
        if self.programSelected==R:
            p=Popen(self.eplusDir + F.idfR_0 + wth, cwd=F.cwdPyR_0)
            p.communicate()
            p1=Popen(self.eplusDir + F.idfR_1 + wth, cwd=F.cwdPyR_1)
            p1.communicate()
            p2=Popen(self.eplusDir + F.idfR_2 + wth, cwd=F.cwdPyR_2)
            p2.communicate()

            p3=Popen(self.eplusDir + F.idfR_3 + wth, cwd=F.cwdPyR_3)
            p3.communicate()
            p4=Popen(self.eplusDir + F.idfR_4 + wth, cwd=F.cwdPyR_4)
            p4.communicate()
            p5=Popen(self.eplusDir + F.idfR_5 + wth, cwd=F.cwdPyR_5)
            p5.communicate()
            recreate()

        if self.programSelected==Off:
            p=Popen(self.eplusDir + F.idfO_0 + wth, cwd=F.cwdPyR_0)
            p.communicate()
            p1=Popen(self.eplusDir + F.idfO_1 + wth, cwd=F.cwdPyR_1)
            p1.communicate()
            p2=Popen(self.eplusDir + F.idfO_2 + wth, cwd=F.cwdPyR_2)
            p2.communicate()

            p3=Popen(self.eplusDir + F.idfO_3 + wth, cwd=F.cwdPyR_3)
            p3.communicate()
            p4=Popen(self.eplusDir + F.idfO_4 + wth, cwd=F.cwdPyR_4)
            p4.communicate()
            p5=Popen(self.eplusDir + F.idfO_5 + wth, cwd=F.cwdPyR_5)
            p5.communicate()
            recreate()

    def askdirectory(self):
        self.dirname = askopenfilename(filetypes = (("epw weather files","*.epw"),("all files","*.*")))
        self.wthDes()

    def askdirectoryCSV(self):
        self.dirnameCSV = askopenfilename(filetypes = (("eplus simulation result files","*.csv"),("all files","*.*")))
        self.openCSV()

    def openCSV(self):
        self.resultCSV= str(self.dirnameCSV)
        print self.resultCSV

        mainPY.plt.close('all')
        s=mainPY.simImp(self.resultCSV)
        sim=s.dataSim()
        mainData= mainPY.wrangleData(sim)
        figM=mainPY.plotAll(mainData)

        main.p2.figM=figM
        figX= figM.fig_LT

        main.p2.canvasF.get_tk_widget().place_forget()
        main.p2.canvasF = FigureCanvasTkAgg(figX, master=main.p2)
        main.p2.canvasF.get_tk_widget().place(relx=rightPane, rely=0.065, relwidth=0.8, relheight=0.87)
        main.p2.show()
        main.p2.hotHours= mainData.lowTolHeatHours
        main.p2.heatLabel()
        Label(main.p2, bg=bg).place(relx=rightPane, y=2, relwidth=0.5)
        Label(main.p2, fg=fg, bg=bg, text='CSV Result File: '+ str(self.resultCSV), font=(None, 10)).place(relx=rightPane, y=2)

    def wthDes(self):
        wth_=str(self.dirname).replace('.epw','')
        wth__=str(wth_).replace('/','\ ')
        self.wthDir=str(wth__).replace(' ','')
        #self.wth=self.wthDir
        delimiters='.','/'
        regexPattern = '|'.join(map(re.escape, delimiters))
        self.wth=re.split(regexPattern, wth_)
        print self.wth[3]

        Label(self, bg=bg).place(relx=0.43, rely=0.40, relwidth=0.5)
        self.wthFileUsed=Label(self, text=self.wth[3], fg=fg, bg=bg,font=(None,11)).place(relx=0.5, rely=0.60,anchor=CENTER)


class Page2(Page):
    def __init__(self, *args, **kwargs):
        Page.__init__(self, *args, **kwargs)
        Frame(self, bg=bg).pack(expand=1, fill=BOTH)

        ##------Side Pane Contents
        #icons left pane
        imgG = ImageTk.PhotoImage(Image.open('image\g_2.png'))
        iconGraph=Label(self,image=imgG, bg=bg)
        iconGraph.image=imgG
        self.graphLabel='Hourly'
        varG = StringVar(self)
        varG.set('Hourly')
        choices = ['Hourly', 'Monthly']
        option = OptionMenu(self, varG, *choices)#, command=self.get_ValG)
        option.place(relx=0.1, rely=0.1, anchor=CENTER)
        option.configure(font=(None,12), bg=bg, fg=fg, image=imgG)
        menu = option.nametowidget(option.menuname)
        menu.configure(font=(None,8))
        Label(self, text=self.graphLabel, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.15, anchor=CENTER)


        #Label(self,wraplength=wrapLenP2, fg=fg, bg=bg, text='Physiological Cooling:').place(x=10, y=120, height=25)
        imgFan= ImageTk.PhotoImage(Image.open('image\Fan_.png'))
        iconFan=Label(self,image=imgFan, bg=bg)
        iconFan.image=imgFan
        self.fanSpeed='0.8m/s'
        self.tolLevel='low'
        varV = StringVar(self)
        varV.set('0.8m/s')
        choices = ['1.2m/s', '0.8m/s', 'off']
        option = OptionMenu(self, varV, *choices, command=self.get_ValV)
        option.place(relx=0.1, rely=0.28, anchor=CENTER)
        option.configure(font=(None,12), bg=bg, fg=fg, image=imgFan)
        menu = option.nametowidget(option.menuname)
        menu.configure(font=(None,8 ))
        Label(self, text=self.fanSpeed, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.33, anchor=CENTER)


        imgEnv= ImageTk.PhotoImage(Image.open('image\Facade.png'))
        iconEnv=Label(self,image=imgEnv, bg=bg)
        iconEnv.image=imgEnv
        self.envelop='Temperate'
        varEnv = StringVar(self)
        varEnv.set('Temperate')
        choices = ['Cold', 'Temperate', 'Hot']
        option = OptionMenu(self, varEnv, *choices, command=self.get_ValEnv)
        option.place(relx=0.1, rely=0.50, anchor=CENTER)
        option.configure(font=(None,12), bg=bg, fg=fg, image=imgEnv)
        menu = option.nametowidget(option.menuname)
        menu.configure(font=(None,8 ))
        Label(self, text=self.envelop, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.55, anchor=CENTER)


        imgTM= ImageTk.PhotoImage(Image.open('image\TM.png'))
        iconTM=Label(self,image=imgTM, bg=bg)
        iconTM.image=imgTM
        self.TMlabel='TM Active'
        varTM = StringVar(self)
        varTM.set('TM Active')
        choices = ['TM Active', 'TM Off']
        option = OptionMenu(self, varTM, *choices, command=self.get_ValTM)
        option.place(relx=0.1, rely=0.63, anchor=CENTER)
        option.configure(font=(None,12), bg=bg, fg=fg, image=imgTM)
        menu = option.nametowidget(option.menuname)
        menu.configure(font=(None,8 ))
        Label(self, text=self.TMlabel, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.69, anchor=CENTER)

        imgO = ImageTk.PhotoImage(Image.open('image\m_.png'))
        iconOcc=Label(self,image=imgO, bg=bg)
        iconOcc.image=imgO
        iconOcc.place(relx=0.02,rely=0.27,anchor=CENTER)

        imgH = ImageTk.PhotoImage(Image.open('image\Build_2.png'))
        iconH=Label(self,image=imgH, bg=bg)
        iconH.image=imgH
        iconH.place(relx=0.02,rely=0.5, anchor=CENTER)

        #icons lower bars
        imgT = ImageTk.PhotoImage(Image.open('image\imgT_.png'))
        iconT=Label(self,image=imgT, bg=bg)
        iconT.image=imgT
        iconT.place(relx=0.155,rely=0.79)

        imgRH = ImageTk.PhotoImage(Image.open('image\imgRH_.png'))
        iconRH=Label(self,image=imgRH, bg=bg)
        iconRH.image=imgRH
        iconRH.place(relx=0.155,rely=0.87)

        #fig.canvas.draw_idle()

    def get_ValV(self,value):
        if str(value)=='1.2m/s':
            self.fanSpeed='1.2m/s'
            self.highTol()
        elif str(value)=='0.8m/s':
            self.fanSpeed='0.8m/s'
            self.lowTol()
        elif str(value)=='off':
            self.fanSpeed='off'
            self.offTol()
        Label(self, bg=bg).place(relx=0.1, rely=0.33, anchor=CENTER, relwidth=0.05)
        Label(self, text=self.fanSpeed, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.33, anchor=CENTER)

    def get_ValEnv(self,value):
        if str(value)=='Cold':
            self.envelop='Cold'
            self.cold()
        elif str(value)=='Temperate':
            self.envelop='Temperate'
            self.temp()
        elif str(value)=='Hot':
            self.envelop='Hot'
            self.hot()
        Label(self, bg=bg).place(relx=0.1, rely=0.55, anchor=CENTER, relwidth=0.1)
        Label(self, text=self.envelop, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.55, anchor=CENTER)

    def get_ValTM(self,value):
        if str(value)=='TM Active':
            self.TMlabel='TM Active'
            self.TM_on()
        elif str(value)=='TM Off':
            self.TMlabel='TM Off'
            self.TM_off()
        Label(self, bg=bg).place(relx=0.1, rely=0.69, anchor=CENTER, relwidth=0.1)
        Label(self, text=self.TMlabel, fg=fg, bg=bg, font=(None,11)).place(relx=0.1, rely=0.69, anchor=CENTER)

    def simLabel(self):
        tab2='      '
        BPro=str(main.p1.programSelected).upper()+' PROTOTYPE,'
        wth=main.p1.wth[3]
        Label(self, bg=bg).place(relx=rightPane, y=2, relwidth=0.5)
        Label(self, fg=fg, bg=bg, text=BPro+tab2+str(wth), font=(None, 10)).place(relx=rightPane, y=2)
        print (str(BPro)+tab2+str(wth))

    def initializeCanvas(self):
        mainPY.plt.close('all')
        self.selectedCSV=F.csvR_1
        self.canvasInput(main.p1.programSelected)
        print main.p1.programSelected
        print self.selectedCSV
        #s=mainPY.simImp(self.selectedCSV)
        s=mainPY.simImp(self.selectedCSV)
        sim=s.dataSim()
        self.mainData= mainPY.wrangleData(sim)
        self.figM=mainPY.plotAll(self.mainData)

        self.figX= self.figM.fig_LT
        self.canvasF = FigureCanvasTkAgg(self.figX, master=self)
        self.hotHours= self.mainData.lowTolHeatHours


    def canvasInput(self,program):
        print ('this is the updated'+program)
        if program==R:
            if self.envelop=='cold':
                if self.TM=='on':
                    self.selectedCSV=F.csvR_0
                if self.TM=='off':
                    self.selectedCSV=F.csvR_3
            if self.envelop=='temperate':
                if self.TM=='on':
                    self.selectedCSV=F.csvR_1
                if self.TM=='off':
                    self.selectedCSV=F.csvR_4
            if self.envelop=='hot':
                if self.TM=='on':
                    self.selectedCSV=F.csvR_2
                if self.TM=='off':
                    self.selectedCSV=F.csvR_5

        if program==Off:
            if self.envelop=='cold':
                if self.TM=='on':
                    self.selectedCSV=F.csvO_0
                if self.TM=='off':
                    self.selectedCSV=F.csvO_3
            if self.envelop=='temperate':
                if self.TM=='on':
                    self.selectedCSV=F.csvO_1
                if self.TM=='off':
                    self.selectedCSV=F.csvO_4
            if self.envelop=='hot':
                if self.TM=='on':
                    self.selectedCSV=F.csvO_2
                if self.TM=='off':
                    self.selectedCSV=F.csvO_5

    def reFig(self,f):
        self.figMain=f
        self.canvasF.get_tk_widget().place_forget()
        self.canvasF = FigureCanvasTkAgg(self.figMain, master=self)
        self.canvasF.get_tk_widget().place(relx=rightPane, rely=0.065, relwidth=0.8, relheight=0.87)

    def canvasCreate(self):
        self.canvasInput(main.p1.programSelected)
        if self.tolLevel=='low':
            self.figX= self.figM.fig_LT
            self.hotHours=self.mainData.lowTolHeatHours
        elif self.tolLevel=='high':
            self.figX=self.figM.fig_HT
            self.hotHours=self.mainData.highTolHeatHours
        elif self.tolLevel=='AC':
            self.figX=self.figM.fig_AC
            self.hotHours=self.mainData.overHeatingHours

        self.reFig(self.figX)
        #self.func=Label(self, wraplength=350, text='Over Heating Hours:', bg=fg).place(x=0, y=450, height=25, width= 210, anchor=NW)
        #self.heatingLabel_1=Label(self,wraplength=wrapLenP2, fg=fg, bg=None, text='Adaptive Comfort: '+str(self.mainData.overHeatingHours)).place(x=10, y=500, height=20,width=200)
        #self.heatingLabel_2=Label(self,wraplength=wrapLenP2, fg=fg, bg=None, text='Low Air Speed: '+str(self.mainData.lowTolHeatHours)).place(x=10, y=520, height=20,width=200)
        #self.heatingLabel_3=Label(self,wraplength=wrapLenP2, fg=fg, bg=None, text='High Air Speed: '+str(self.mainData.highTolHeatHours)).place(x=10, y=540, height=20,width=200)

    def heatLabel(self):
        recom='Good'
        if self.hotHours<=500: self.Bc='palegreen'
        elif self.hotHours>=3000: self.Bc='maroon';   recom='Very Hot'
        else: self.Bc='gold';  recom='Acceptable'
        Label(main.p2, text='Over Heated Hours', fg=fg, bg=bg, font=(None,10)).place(relx=0.88, rely=0.072, relwidth=0.10)
        Label(main.p2, text=recom, fg=fg, bg=bg, font=(None,10)).place(relx=0.88, rely=0.17, relwidth=0.10)
        Label(main.p2, text=str(self.hotHours), fg=fg, bg=self.Bc, font=(None,28)).place(relx=0.88, rely=0.1, relwidth=0.10)

    def highTol(self):
        self.tolLevel='high'
        self.canvasCreate()
        self.heatLabel()
    def lowTol(self):
        self.tolLevel='low'
        self.canvasCreate()
        self.heatLabel()
    def offTol(self):
        self.tolLevel='AC'
        self.canvasCreate()
        self.heatLabel()

    def cold(self):
        self.envelop='cold'
        self.initializeCanvas()
        self.canvasCreate()
        self.heatLabel()
        self.simLabel()
    def temp(self):
        self.envelop='temperate'
        self.initializeCanvas()
        self.canvasCreate()
        self.heatLabel()
        self.simLabel()
    def hot(self):
        self.envelop='hot'
        self.initializeCanvas()
        self.canvasCreate()
        self.heatLabel()
        self.simLabel()

    def TM_on(self):
        self.TM='on'
        self.initializeCanvas()
        self.canvasCreate()
        self.heatLabel()
        self.simLabel()
    def TM_off(self):
        self.TM='off'
        self.initializeCanvas()
        self.canvasCreate()
        self.heatLabel()
        self.simLabel()

class MainView(Tkinter.Frame):
    def __init__(self, *args, **kwargs):
        Tkinter.Frame.__init__(self, *args, **kwargs)
        self.p1 = Page1(self)
        self.p2 = Page2(self)

        self.container = Tkinter.Frame(self)
        self.container.pack(side="top", fill="both", expand=True)

        self.p1.place(in_=self.container, x=0, y=0, relwidth=1, relheight=1)
        self.p2.place(in_=self.container, x=0, y=0, relwidth=1, relheight=1)

        self.p2.show()

print('creating progress. . .')

toolName='C L I M A +'
rootM = Tkinter.Tk()
rootM.wm_geometry("1200x600")
rootM.title(toolName)
rootM.resizable(0,0)
main=MainView(rootM)

#settings icon
imgSet = ImageTk.PhotoImage(Image.open('image\set_.png'))
iconSet=Button(main.p1,image=imgSet, bg=bg,command=main.p2.lift)
iconSet.image=imgSet
iconSet.place(relx=0.92,rely=0.033, anchor=CENTER)

#help icon
imgHelp = ImageTk.PhotoImage(Image.open('image\help_.png'))
iconHelp=Button(main.p1,image=imgHelp, bg=bg,command=main.p2.lift)
iconHelp.image=imgHelp
iconHelp.place(relx=0.96,rely=0.033, anchor=CENTER)

#settings icon
imgSet = ImageTk.PhotoImage(Image.open('image\set_.png'))
iconSet=Button(main.p2,image=imgSet, bg=bg,command=main.p2.lift)
iconSet.image=imgSet
iconSet.place(relx=0.92,rely=0.033, anchor=CENTER)

#help icon
imgHelp = ImageTk.PhotoImage(Image.open('image\help_.png'))
iconHelp=Button(main.p2,image=imgHelp, bg=bg,command=main.p2.lift)
iconHelp.image=imgHelp
iconHelp.place(relx=0.96,rely=0.033, anchor=CENTER)

#//////////////
#goback home icon
imgBack = ImageTk.PhotoImage(Image.open('image\continue_B.png'))
iconBack=Button(main.p2,image=imgBack, bg=bg,command=main.p1.lift)
iconBack.image=imgBack
iconBack.place(relx=0.03,rely=0.85)

#go to graphs icons
imgGo = ImageTk.PhotoImage(Image.open('image\continue_F.png'))
iconGo=Button(main.p1,image=imgGo, bg=bg,command=main.p2.lift)
iconGo.image=imgGo
iconGo.place(relx=0.03,rely=0.85)
#download GH icons
imgGH = ImageTk.PhotoImage(Image.open('image\gh_.png'))
iconGH=Button(main.p2,image=imgGH, bg=bg,command=main.p2.lift)
iconGH.image=imgGH
iconGH.place(relx=0.08,rely=0.85)
#download SDL icons
imgSDL = ImageTk.PhotoImage(Image.open('image\SDL.png'))
iconSDL=Label(main.p2,image=imgSDL, bg=bg)
iconSDL.image=imgSDL
iconSDL.place(relx=0.88,rely=0.94)
#download SDL icons
imgSDL = ImageTk.PhotoImage(Image.open('image\SDL.png'))
iconSDL=Label(main.p1,image=imgSDL, bg=bg)
iconSDL.image=imgSDL
iconSDL.place(relx=0.88,rely=0.94)

main.pack(side="top", fill="both", expand=True)


class recreate:
    def __init__(self):
        print('recreating . . .')
        main.p2.initializeCanvas()

        main.p2.canvasCreate()
        main.p2.heatLabel()
        main.p2.simLabel()

        main.p2.show()

        rootM.mainloop()

recreate()

#------------Tkinter defintion finished
