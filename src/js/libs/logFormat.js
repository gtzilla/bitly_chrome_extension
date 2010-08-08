/*
    Make a pretty string
*/
Date.prototype.logFormat = function() {
    var h=this.getHours(), m = this.getMinutes(), s = this.getSeconds()
        mn = this.getMonth()+1, d = this.getDate(), y = this.getFullYear(), ampm = "AM";
    
    m =  (m>10) ? m : "0"+m;
    d =  (d > 10) ? d : "0"+d;
    s =  (s > 10) ? s : "0" + s;
    mn = (mn > 10) ? mn : "0"+mn;
    ampm = (h>=12) ? "PM" : "AM";
    h = (h>12) ? h-12 : h;
    h=(h>10) ? h : "0"+h;
    
    return (d + "/" + mn + "/" + y + " " + h + ":" + m + ":" + s + ampm);
}