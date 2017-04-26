#!/bin/bash

#
# script to generate qr codes
# requires imagemagick and qrencode
#
for i in 1 2 3 4 5 6 7 8 9 10 ; do
	qrencode -s 50 -o truck-${i}.png "truck-${i}"
	convert truck-${i}.png -font Overpass -fill Black -pointsize 250 -gravity center label:truck-${i} -append truck-${i}.png
	echo "done with truck-$i"
done

for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
	qrencode -s 50 -o pkg-${i}.png "pkg-${i}"
	convert pkg-${i}.png -font Overpass -fill Black -pointsize 250 -gravity center label:pkg-${i} -append pkg-${i}.png
	echo "done with pkg-$i"
done
