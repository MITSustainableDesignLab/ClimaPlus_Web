import pandas as pd
import numpy as np
import math


#EnergyPlus Weatherfile Parameters, columns/fields in order
### [0, 5]   year, month, day, hour, minute, data source and uncertaintity flags, 
### [6, 9]  tdb, tdp, rh, patm, 
### [10. 12]  extraterrestrial horizontal radiation, extrat direct normal radiation, extrast infrared radiaton, 
### [14, 16] golabl horizontal radiation, direct normal radiation, diffuse horizontal radiation



#############
# Schedules to be used for ventilation evaluation. OFFICE BUILDINGS.
sch_occOff_8to5 = []
for i in range(1,8): sch_occOff_8to5.append((i,0))
for i in range(8,19): sch_occOff_8to5.append((i,1))
for i in range(19,25): sch_occOff_8to5.append((i,0))

### Occupancy Schedule
sch_occOff = []
for i in range(1,7): sch_occOff.append((i,0))
sch_occOff.append((7,0.1))
sch_occOff.append((8,0.2))
for i in range(9,13): sch_occOff.append((i,0.95))
sch_occOff.append((13,0.5))
for i in range(14,18): sch_occOff.append((i,0.95))
sch_occOff.append((18,0.3))
sch_occOff.append((19,0.1))
sch_occOff.append((20,0.1))
for i in range(21,25): sch_occOff.append((i,0.05))

sch_occOff_Sat = []
for i in range(1,8): sch_occOff_Sat.append((i,0))
sch_occOff_Sat.append((8,0.1))
for i in range(9,13): sch_occOff_Sat.append((i,0.3))
for i in range(13,18): sch_occOff_Sat.append((i,0.1))
for i in range(18,25): sch_occOff_Sat.append((i,0.0))

#No occupancy, off schedule 
sch_Off_Sun = []
for i in range(1,25): sch_Off_Sun.append((i,0))

### Light schedule
sch_lgtOff = []
for i in range(1,7): sch_lgtOff.append((i,0.05))
sch_lgtOff.append((7,0.1))
sch_lgtOff.append((8,0.3))
for i in range(9,17): sch_lgtOff.append((i,0.90))
sch_lgtOff.append((17,0.5))
sch_lgtOff.append((18,0.5))
for i in range(19,21): sch_lgtOff.append((i,0.30))
for i in range(21,23): sch_lgtOff.append((i,0.20))
sch_lgtOff.append((23,0.1))
sch_lgtOff.append((24,0.05))

sch_lgtOff_Sat = []
for i in range(1,7): sch_lgtOff_Sat.append((i,0.05))
for i in range(7,9): sch_lgtOff_Sat.append((i,0.1))
for i in range(9,13): sch_lgtOff_Sat.append((i,0.3))
for i in range(13,18): sch_lgtOff_Sat.append((i,0.15))
for i in range(18,25): sch_lgtOff_Sat.append((i,0.05))

sch_lgtOff_Sun = []
for i in range(1,25): sch_lgtOff_Sun.append((i,0.05))

#Equipment schedule
sch_eqpOff = []
for i in range(1,8): sch_eqpOff.append((i,0))
sch_eqpOff.append((8,0.4))
for i in range(9,13): sch_eqpOff.append((i,0.90))
sch_eqpOff.append((13,0.8))
for i in range(14,18): sch_eqpOff.append((i,0.90))
sch_eqpOff.append((18,0.5))
for i in range(19,25): sch_eqpOff.append((i,0.4))

sch_eqpOff_Sat = []
for i in range(1,7): sch_eqpOff_Sat.append((i,0.3))
for i in range(7,8): sch_eqpOff_Sat.append((i,0.4))
for i in range(8,13): sch_eqpOff_Sat.append((i,0.5))
for i in range(13,18): sch_eqpOff_Sat.append((i,0.35))
for i in range(18,25): sch_eqpOff_Sat.append((i,0.30))

sch_eqpOff_Sun = []
for i in range(1,25): sch_eqpOff_Sun.append((i,0.3))
######

sch_L_E = []
for i in range(1,8): sch_L_E.append((i,0.1))
for i in range(8,12): sch_L_E.append((i,0.2))
for i in range(12,19): sch_L_E.append((i,0.5))
for i in range(19,25): sch_L_E.append((i,0.1))

sch_nightV = []
for i in range(1,6): sch_nightV.append((i,1))
for i in range(6,22): sch_nightV.append((i,0))
for i in range(22,25): sch_nightV.append((i,1))

sch_preCool = []
for i in range(1,6): sch_preCool.append((i,0))
for i in range(6,9): sch_preCool.append((i,1))
for i in range(9,18): sch_preCool.append((i,0))
for i in range(18,22): sch_preCool.append((i,1))
for i in range(22,25): sch_preCool.append((i,0))


def totResistanceShoebox(A_facade, WWR, U_wall, U_glazing, V_dot, A_TM, h_convection):
	Res_1=1/((A_facade*U_wall*(1-WWR))+(A_facade*WWR*U_glazing)+ (V_dot*1.2*1000))
	Res_2 = 1/(A_TM*h_convection)
	Res_tot = Res_1 + Res_2
	return Res_tot

def totResistance(zone_input):
	W, L, H= zone_input['W'],zone_input['L'],zone_input['H']
	WWRs, WWRw, WWRn, WWRe, U_wall, U_roof, U_glazing, V_dot, A_TM_factor, h_convection=zone_input['WWRs'],zone_input['WWRw'],zone_input['WWRn'],zone_input['WWRe'],zone_input['U_wall'],zone_input['U_roof'],zone_input['U_glazing'],zone_input['V_dot'],zone_input['A_TM_factor'],zone_input['h_convection']
	_s = (L*H*U_wall*(1-WWRs))+(L*H*WWRs*U_glazing)
	_w = (W*H*U_wall*(1-WWRw))+(W*H*WWRw*U_glazing)
	_n = (L*H*U_wall*(1-WWRn))+(L*H*WWRn*U_glazing)
	_e = (W*H*U_wall*(1-WWRw))+(W*H*WWRw*U_glazing)
	_r = (W*L*U_roof)
	Res_1=1/(_s +_w +_n +_e + _r + (V_dot*1.2*1000))
	Res_2 = 1/(A_TM_factor*L*W*h_convection)
	Res_tot = Res_1 + Res_2
	return Res_tot

def intGain(W, L, H, WWRs, WWRw, WWRn, WWRe, SHGC,qradHS,qradHW,qradHN,qradHE,shadingFac):
	_allGlazing = (L*H*WWRs*qradHS)+(W*H*WWRw*qradHW)+(L*H*WWRn*qradHN)+(W*H*WWRw*qradHE)
	# print ('********solar gain calc ',L*H*WWRs*qradHS, qradHS )
	solarGain = _allGlazing*SHGC*shadingFac
	return solarGain

def timeConstant(Res_tot, zone_input):
	W, L, A_TM_factor, tickness_TM, cp_TM, density_TM = zone_input['W'],zone_input['L'], zone_input['A_TM_factor'],zone_input['T_TM'],zone_input['cp_TM'],zone_input['density_TM']
	thermalCapacitance = A_TM_factor*W*L*tickness_TM*cp_TM*density_TM
	t_tau = Res_tot * thermalCapacitance #result in seconds. Return result in hr.
	return (t_tau/3600)

def Tin_new (Res_tot, internalLoad, Tout, Tin, timeConstant):
	a = Res_tot*internalLoad + (Tout+273)
	b = 1 - math.exp(-1/timeConstant)
	c = (Tin+273) * math.exp(-1/timeConstant)
	Tin_ = a*b + c 
	return (Tin_-273)

def Qsys (Res_tot, internalLoad, Tout, TinPrevious, Ttarget_L, Ttarget_U, timeConstant):
	# if heating is needed
	qsys_h = 0

	if TinPrevious<=Ttarget_L:
		a = (Ttarget_L+273) - (TinPrevious+273)* math.exp(-1/timeConstant) 	
		b = 1 - math.exp(-1/timeConstant)
		c = a/b - (Tout+273)
		if c/Res_tot > internalLoad:
			qsys_h = (c/Res_tot) - internalLoad

	# if cooling is needed
	if TinPrevious >= Ttarget_U:
		a = (Ttarget_U+273) - (TinPrevious+273)* math.exp(-1/timeConstant)
		b = 1 - math.exp(-1/timeConstant)
		c = a/b - (Tout+273)
		qsys_c = (c/Res_tot) - internalLoad # cooling energy is negative.
	else: qsys_c = 0

	return [qsys_h, qsys_c]

def Qcool (Res_tot, internalLoad, Tout, TinPrevious, Ttarget_U, timeConstant): #for hourly calculation
	qsys_c = 0
	if TinPrevious >= Ttarget_U:
		a = (Ttarget_U+273) - (TinPrevious+273)* math.exp(-1/timeConstant)
		b = 1 - math.exp(-1/timeConstant)
		c = a/b - (Tout+273)
		# if c/Res_tot<0:
		qsys_c = (c/Res_tot) - internalLoad # cooling energy is negative.
		# else: qsys_c = -1 * internalLoad
	return qsys_c

def Qheat (Res_tot, internalLoad, Tout, TinPrevious, Ttarget_L, timeConstant): #for hourly calculation
	# if heating is needed
	qsys_h = 0
	if TinPrevious<=Ttarget_L:
		a = (Ttarget_L+273) - (TinPrevious+273)* math.exp(-1/timeConstant) 	
		b = 1 - math.exp(-1/timeConstant)
		c = a/b - (Tout+273)
		if c/Res_tot > internalLoad:
			qsys_h = (c/Res_tot) - internalLoad
	return qsys_h

def nv_Operable (zone_input, Tin, Tout, wind_angle, wind_speed, Fschedule,operableAreaFraction): #for hourly calculation
	L,W,H,WWRs,WWRw,WWRn,WWRe = zone_input["L"], zone_input["W"],zone_input["H"],zone_input["WWRs"],zone_input["WWRw"],zone_input["WWRn"],zone_input["WWRe"]
	Cwn,Cwe,Cws,Cww=0,0,0,0
	#Based on energyplus, ventilation by wind and stack with open area
	#Wind ventilation
	if wind_angle == 0: Cwn,Cwe,Cws,Cww=0.55,0,0,0
	elif wind_angle == 90: Cwn,Cwe,Cws,Cww=0,0.55,0,0
	elif wind_angle == 180: Cwn,Cwe,Cws,Cww=0,0,0.55,0
	elif wind_angle == 270: Cwn,Cwe,Cws,Cww=0,0,0,0.55
	elif 0<wind_angle<90 : Cwn,Cwe,Cws,Cww=0.3,0.3,0,0
	elif 90<wind_angle<180 : Cwn,Cwe,Cws,Cww=0,0.3,0.3,0
	elif 180<wind_angle<270 : Cwn,Cwe,Cws,Cww=0,0,0.3,0.3
	elif 270<wind_angle<360 : Cwn,Cwe,Cws,Cww=0.3,0,0,0.3

	eff_operableWin_wind = ((L*H*WWRs*Cws)+(W*H*WWRw*Cww)+(L*H*WWRn*Cwn)+(W*H*WWRe*Cwe))*operableAreaFraction
	Qw= eff_operableWin_wind*Fschedule*wind_speed
	# if Qw>0: print ("no opening scenarios   ",WWRn,WWRe,WWRs,WWRw,Cwn,Cwe,Cws,Cww)

	#buoyancy ventilation
	Cd = 0.4 + 0.0045*np.absolute(Tin-Tout)
	Hnpl= H/4 #to be checked based on ASHRAE guidance
	g = 9.8
	eff_operableWin_buoy = ((L*H*WWRs)+(W*H*WWRw)+(L*H*WWRn)+(W*H*WWRe))*operableAreaFraction
	Qs = Cd*eff_operableWin_buoy*Fschedule*np.sqrt(2*g*Hnpl*np.absolute(Tin-Tout)/(Tout+273))
	Q=np.sqrt(np.square(Qw)+np.square(Qs))

	return (round(Q,0))

## to store discomfort hours from low temperature and high temperatures.
def comfortEval(tempin_, lowerBound, upperBound,occupancy):
	discomfort_coldhrs, discomfort_hothrs = 0,0	
	hr_len = len(tempin_)
	hours = list(range(0,hr_len))
	
	for i in range (0,hr_len):
		if tempin_[i] > upperBound+0.9 and occupancy[i]>0.25: #"+0.9" to match the frequency chart, where all indoor temp between 26 and 26.9 are binned together. 			
			discomfort_hothrs+=1
		if tempin_[i] < lowerBound and occupancy[i]>0.25: 			
			discomfort_coldhrs+=1
	#print (wth+' discomfort hours ', discomforthrs)
	return ((discomfort_coldhrs, discomfort_hothrs))


def runRC(toutL,windDL,windVL,qradHS,qradHW,qradHN,qradHE,zone_input,LPD,EPD):
	t_inL, t_inL_q, t_inL_q_, qsystemL_h, qsystemL_c, qsystem_h, qsystem_c, occ, nightV, l_e, solarGL, internalGT, heatLT, ach, nvonL, nvind = [],[],[],[],[],0,0,[],[],[],[],[],[],[],[],-100
	eqpSch, lgtSch = [],[]
	occDensityOff = 0.055 #18 m2 per person, 
	loadPerPerson = 100 #w/person
	PPD = occDensityOff*loadPerPerson

	Afloor = zone_input['W']*zone_input['L']
	depth_daylit = 2.5
	dA_perimeter = ((zone_input['WWRw']+zone_input['WWRe'])*zone_input['W'] + (zone_input['WWRs']+zone_input['WWRn'])*zone_input['L'])
	dA_penetration = (zone_input['H']/2 + zone_input['H']*depth_daylit/2)
	dA_area= dA_penetration*dA_perimeter
	dA_floorPercentage = dA_area/Afloor
	LPD_floorPercentage = 1-dA_floorPercentage

	t_in0 = 20 #toutL[0] + 5
	t_in0q = t_in0
	q_light, q_eqpt = 0,0
	t_lowerSetBack, t_upperSetBack = 16,28

	operableAreaFraction,Fschedule,qL,Qinfilloss = 0.5,1,[],[]

	days = int(len(toutL)/24)

	occ_=[s[1] for s in sch_occOff]
	occ_Sat=[s[1] for s in sch_occOff_Sat]
	occ_Sun=[s[1] for s in sch_Off_Sun]
	# for d in range(1,days+1):
	# 	for i in range(1,6):
	# 		if d%i == 0:occ.extend(occ_)
	# 	if d%6 == 0:
	# 		occ.extend(occ_Sat)
	# 		occ_Sat_+=1
	# 		print (d, d%6)
	# 	if d%7 == 0:occ.extend(occ_Sun)
	
	occ_week = []
	for d in range (0,5):occ_week.extend(occ_)
	occ_week.extend(occ_Sat)
	occ_week.extend(occ_Sun)
	for w in range(0,52): occ.extend(occ_week)
	occ.extend(occ_)

	eqp_=[s[1] for s in sch_eqpOff]
	eqp_Sat=[s[1] for s in sch_eqpOff_Sat]
	eqp_Sun=[s[1] for s in sch_eqpOff_Sun]
	eqp_week = []
	for d in range (0,5):eqp_week.extend(eqp_)
	eqp_week.extend(eqp_Sat)
	eqp_week.extend(eqp_Sun)
	for w in range(0,52): eqpSch.extend(eqp_week)
	eqpSch.extend(eqp_)
	# for d in range(1,days+1):
	# 	for i in range(1,6):
	# 		if d%i == 0:eqpSch.extend(eqp_)
	# 	if d%6 == 0:eqpSch.extend(eqp_Sat)
	# 	if d%7 == 0:eqpSch.extend(eqp_Sun)

	lgt_=[s[1] for s in sch_lgtOff]
	lgt_Sat=[s[1] for s in sch_lgtOff_Sat]
	lgt_Sun=[s[1] for s in sch_lgtOff_Sun]
	lgtSch_week = []
	for d in range (0,5):lgtSch_week.extend(lgt_)
	lgtSch_week.extend(lgt_Sat)
	lgtSch_week.extend(lgt_Sun)
	for w in range(0,52): lgtSch.extend(lgtSch_week)
	lgtSch.extend(lgt_)
	# for d in range(1,days+1):
	# 	for i in range(1,6):
	# 		if d%i == 0:lgtSch.extend(lgt_)
	# 	if d%6 == 0:lgtSch.extend(lgt_Sat)
	# 	if d%7 == 0:lgtSch.extend(lgt_Sun)

	# print (len(eqp_week))
	# print (len(lgtSch), len(occ), len(eqpSch))
	l_e_=[s[1] for s in sch_L_E]
	for i in range(0,days):l_e.extend(l_e_)
	
	nightV_=[s[1] for s in sch_nightV]
	for i in range(0,days):nightV.extend(nightV_)

	occPlot = [x*-20 for x in occ]

	V_dot0 = zone_input['V_dot']

	maxVdot = 40*zone_input['W']*zone_input['L']*zone_input['H']/3600 #control for mazimum ventilation rate. 

	hr = 0
	while hr < len(toutL):
		#IF NV is turned on:
		NV_V_dot = 0
		if zone_input['NVach']>1 and (t_in0q > 20) and (t_in0q > toutL[hr]) and zone_input['sp_lower'] < toutL[hr] < zone_input['sp_upper']:
			# if zone_input['NVach']==5: 
			# 	NV_V_dot = zone_input['NVach']*zone_input['W']*zone_input['L']*zone_input['H']/3600
			# 	qL.append(NV_V_dot)
			# 	nvind = -20
			# elif zone_input['NVach']>5:
			NV_V_dot=nv_Operable(zone_input, t_in0q, toutL[hr], windDL[hr], windVL[hr], Fschedule, operableAreaFraction)#*3600
			qL.append(NV_V_dot)
			
			if NV_V_dot>0:nvind = -20
			zone_input['V_dot'] = zone_input['V_dot'] + NV_V_dot
			
		# qL.append(q_)
		# elif 5 < toutL[hr] < zone_input['sp_lower']: zone_input['V_dot'] = 0.6*zone_input['W']*zone_input['L']*zone_input['H']/3600
		else: 
			zone_input['V_dot'] = V_dot0
			nvind = -100

		ach.append(zone_input['V_dot'])
		#ventilation heat losses, considered only when within the comfort range
		if t_in0q>toutL[hr] and zone_input['V_dot']<maxVdot:infilLoss = zone_input['V_dot']*1.2*1000*(t_in0q-toutL[hr])#/3600
		else: infilLoss =0

		if t_in0q<toutL[hr]:infilGain = V_dot0*1.2*1000*(t_in0q-toutL[hr])
		else: infilGain =0

		Qinfilloss.append(infilLoss)
	
		R = totResistance(zone_input)
		t_tau = timeConstant(R,zone_input)
		# intGain(W, L, H, WWRs, WWRw, WWRn, WWRe, SHGC,qradHS,qradHW,qradHN,qradHE,shadingFac)
		solarGain = intGain(zone_input['W'],zone_input['L'],zone_input['H'],
			zone_input['WWRs'],zone_input['WWRw'],zone_input['WWRn'],zone_input['WWRe'],
			zone_input['shgc'],qradHS[hr],qradHW[hr],qradHN[hr],qradHE[hr],zone_input['shadingFac'])
		solarGL.append(solarGain)
		internalG_Total = solarGain + (LPD*lgtSch[hr] + EPD*eqpSch[hr] + PPD*occ[hr])*zone_input['W']*zone_input['L']
		loadBalance=internalG_Total-infilLoss
		internalGT.append(internalG_Total)
		q_light += LPD*lgtSch[hr]*LPD_floorPercentage
		
		q_eqpt += EPD*eqpSch[hr]

		#Check if NV is not sufficient or if cooling is needed
		qcool, qheat = 0,0
		Tin_n_ = Tin_new (R, loadBalance, toutL[hr], t_in0q, t_tau)
		if Tin_n_ >= zone_input['sp_upper'] and zone_input['Ccop']>0:
			zone_input['V_dot'] =  V_dot0
			R = totResistance(zone_input)
			t_tau = timeConstant(R,zone_input)
			if occ[hr]==0 and Tin_n_ >= t_upperSetBack: 
				qcool = Qcool(R, loadBalance, toutL[hr], t_in0q, t_upperSetBack, t_tau)
				Tin_n_ = t_upperSetBack
			else: 
				qcool = Qcool(R, loadBalance, toutL[hr], t_in0q, zone_input['sp_upper'], t_tau)
				Tin_n_ = zone_input['sp_upper']

			qsystem_c += qcool
			# qsystemL_c.append(round(qcool/1000,1))
			qsystemL_c.append(-20)
			
			# internalG_Total += qcool
			# Tin_n_ = Tin_new (R, internalG_Total, toutL[hr], t_in0q, t_tau) ##Indoor temperture after cooling
			
		else: 
			qsystemL_c.append(-100)

		if Tin_n_ <= zone_input['sp_lower'] and zone_input['Hcop']>0:
			zone_input['V_dot'] = V_dot0
			R = totResistance(zone_input)
			t_tau = timeConstant(R,zone_input)
			if occ[hr]>0: 
				qheat = Qheat(R, loadBalance, toutL[hr], t_in0q, zone_input['sp_lower'], t_tau)
				Tin_n_ = zone_input['sp_lower']
			else: 
				qheat = Qheat(R, loadBalance, toutL[hr], t_in0q, t_lowerSetBack, t_tau)
				Tin_n_ = t_lowerSetBack
			
			qsystem_h += qheat
			# qsystemL_h.append(round(qheat/1000,1))
			qsystemL_h.append(-20)
	
			# internalG_Total += qheat
			# Tin_n_ = Tin_new (R, internalG_Total, toutL[hr], t_in0q, t_tau) ##Indoor temperture after heating
			
		else: 
			qsystemL_h.append(-100)

		nvonL.append(nvind)
		t_inL_q.append(round(Tin_n_,1))
		t_inL_q_.append(Tin_n_)
		t_in0q = Tin_n_
		hr+=1
	
	hcElecCO2, hcGasCO2, hEnergy, cEnergy, hcElecCost, hcGasCost = 0,0,0,0,0,0
	EUI_C, EUI_H = 0, 0
	EUI_L = round(q_light/1000)
	EUI_E = round(q_eqpt/1000)

	if zone_input['Hcop']>0: 
		EUI_H = round(qsystem_h/(zone_input['Hcop']*Afloor*1000))
		if zone_input['Hcop']<1: 
			hcGasCO2 = EUI_H*zone_input["coef_CO2gas"]
			hcGasCost = EUI_H*zone_input["coef_Costgas"]
		else: 
			hcElecCO2 = EUI_H*zone_input["coef_CO2elec"] #(kgCO2eq), Cost ($)
			hcElecCost = EUI_H*zone_input["coef_Costelec"]
	if zone_input['Ccop']>0: 
		EUI_C = abs(round(qsystem_c/(zone_input['Ccop']*Afloor*1000)))
		hcElecCO2 += EUI_C*zone_input["coef_CO2elec"]
		hcElecCost += EUI_C*zone_input["coef_Costelec"]

	CO2_ELEC = round(hcElecCO2+(EUI_L+EUI_E)*zone_input["coef_CO2elec"],1)
	CO2_GAS = round(hcGasCO2,1)
	COST_ELEC = round(hcElecCost+(EUI_L+EUI_E)*zone_input["coef_Costelec"],1)
	COST_GAS = round(hcGasCost,1)

	t_inL_occFreq = []
	for hr in range(0, len(t_inL_q)):
		if occ[hr]>0.25: t_inL_occFreq.append(t_inL_q[hr])
	a,b,c=Qinfilloss[5040:5208],internalGT[5040:5208],solarGL[5040:5208]
	balance = [i-j for i, j in zip(b,a)]
	disHrs = comfortEval(t_inL_q_, zone_input['sp_lower'], zone_input['sp_upper'], occ)
	
	return (qsystemL_h, qsystemL_c, disHrs,t_inL_q,EUI_H,EUI_C, EUI_L,EUI_E, nvonL, CO2_ELEC, CO2_GAS, COST_ELEC, COST_GAS,t_inL_occFreq)