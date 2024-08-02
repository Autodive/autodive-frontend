export function colorToRgb(sColor, returnType, alpha) {
    sColor = sColor.toLowerCase();
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        var sColorChange = [];
        sColor = sColor.slice(1);
        for (var i = 0; i < sColor.length; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        if (returnType == 0){
            if(sColorChange.length == 4)
                sColorChange[3]/=255;
            else if(typeof alpha != 'undefined')
                sColorChange.push(alpha)
            var prefix = sColorChange.length == 4 ? 'rgba(' : 'RGB(';
            return prefix + sColorChange.join(",") + ")";
        }
        else if (returnType == 1){
            if(sColorChange.length<4)
                sColorChange.push((typeof alpha != 'undefined' ? alpha : 1)*255);
            return sColorChange;
        }
        else if(returnType == 2){
            return {r:sColorChange[0],g:sColorChange[1],b:sColorChange[2],a:sColorChange[3]||(typeof alpha != 'undefined' ? alpha : 1)}
        }
    } else {
        return sColor;
    }
}