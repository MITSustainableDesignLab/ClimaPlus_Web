#!/bin/bash

pushd $1
echo 'printing location'
echo $1
./gencumulativesky +s1 -a $2 -o $3 -m $4 -r -E -time 0 24 -date 1 1 12 31 climate_file.epw > Alpha.cal

./oconv Alpha_gcsky.rad Alpha.rad > Alpha.oct
sleep 2

sed -i '2s/^/}/' Alpha.cal

./rpict -t 15 -i -ab 1 -ad 1500  -ar 300 -aa 0.1  -vtl -vp 0 0 60 -vd 0 0 -1 -vu 0 1 0 -vh 30 -vv 30 -vs 0 -vl 0 -x 800 -y 800  Alpha.oct > Perspective_kwhm-2.pic

#./falsecolor2.py -e -df "logfile" -i $1/Perspective_kwhm-2.pic -s 500 -n 10 -z -l kWhm-2 -z > $1/Perspective_fc.pic
#./ra_tiff $1/Perspective_fc.pic $1/Perspective_fc.tif
#convert $1/Perspective_fc.tif static/$1.jpg

#rm logfile


