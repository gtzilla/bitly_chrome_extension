BEGIN { 
    { print "Daily Stats:" }
} 

/- .* users/ { print "- " $2 " users"} #$2 is the number
/Weekly/ { print "- " $4  " weekly installs" } #$4 is the number



