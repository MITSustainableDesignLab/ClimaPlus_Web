#!/bin/bash

pushd $1
./falsecolor2.py -df "logfile" -i Perspective_kwhm-2.pic -s auto -n 10 -l kWhm-2 -z > Perspective_fc.pic
./ra_tiff Perspective_fc.pic Perspective_fc.tif

popd
convert $1/Perspective_fc.tif static/radmap/$2.jpg
cp $1/autoscale.txt static/radmap/$2.txt

pushd $1
rm Perspective_kwhm-2.pic
rm Alpha.cal
rm Alpha.oct
rm climate_file.epw
rm Perspective_fc.tif
rm autoscale.txt

