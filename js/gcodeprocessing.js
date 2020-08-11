function downloadFile(filename, contents) {
    var blob = new Blob([contents], {type: 'text/plain'});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else{
        var e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}

function toggle(ticked, target){
    if(ticked == true){
        $(target).hide();
    } else {
        $(target).show();
    }
}

function esteps(){
    var oldSteps = document.estepsForm.oldSteps.value;
    var remainingFil = document.estepsForm.remainingFil.value;
    var actualExtrusion = 120 - remainingFil;
    var newSteps = (oldSteps/actualExtrusion*100).toFixed(2);
    $("#e1").html(remainingFil);
    $("#e2").html(actualExtrusion);
    $("#e3").html(newSteps);
    $("#e4").html(newSteps);
    $("#estepsresult").show();
}

function flowCalc1(){
    var oldflow = document.flow1.oldFlow.value;
    var targetwall = document.flow1.targetWall.value;
    var measuredwall = document.flow1.measuredWall.value;
    var newsteps = (oldflow/measuredwall*targetwall).toFixed(2);
    $("#f1").html(newsteps);
    $("#flow1result").show();
}

function flowCalc2(){
    var oldflow = document.flow2.oldFlow.value;
    var targetwall = document.flow2.targetWall.value;
    var measuredwall = document.flow2.measuredWall.value;
    var newsteps = (oldflow/measuredwall*targetwall).toFixed(2);
    $("#f2").html(newsteps);
    $("#flow2result").show();
}

function processBaseline(){
    var hotendTemp = document.baselineForm.hotendtemp.value;
    var bedTemp = document.baselineForm.bedtemp.value;
    var centre = document.baselineForm.centre.checked;
    var bedX = Math.round((document.baselineForm.bedx.value-100)/2);
    var bedY = Math.round((document.baselineForm.bedy.value-100)/2);
    var retDist = document.baselineForm.retdist.value;
    var retSpeed = document.baselineForm.retspeed.value*60;
    var abl = document.baselineForm.abl.value;
    var pc = document.baselineForm.pc.value;
    var baseline = originalBaseline;
    if(apc == 1){
        baseline = baseline.replace(/M106 S255/, "M106 S130");
    }
    if(pc == 2){
        baseline =  baseline.replace(/M106 S255/, ";M106 S255");
    }
    if(abl == 1){
        baseline = baseline.replace(/;G29 ; probe ABL/, "G29 ; probe ABL");
    }
    if(abl == 2){
        baseline =  baseline.replace(/;M420 S1 ; restore ABL mesh/, "M420 S1 ; restore ABL mesh");
    }
    baseline = baseline.replace(/M140 S60/g, "M140 S"+bedTemp);
    baseline = baseline.replace(/M190 S60/g, "M140 S"+bedTemp);
    baseline = baseline.replace(/M104 S210/g, "M104 S"+hotendTemp);
    baseline = baseline.replace(/M109 S210/g, "M109 S"+hotendTemp);
    baseline = baseline.replace(/G1 E-5.0000 F2400/g, "G1 E-"+retDist+" F"+retSpeed);
    baseline = baseline.replace(/G1 E0.0000 F2400/g, "G1 E0.0000 F"+retSpeed);

    if(centre == true){
        var baselineArray = baseline.split(/\n/g);
        var regexp = /X\d+/;
        baselineArray.forEach(function(index, item){
            if(baselineArray[item].search(/X/) > -1){
                var value = parseInt(baselineArray[item].match(regexp)[0].substring(1)) - 50;
                baselineArray[item] = baselineArray[item].replace(regexp, "X"+String(value));
            }
        });
        var regexp = /Y\d+/;
        baselineArray.forEach(function(index, item){
            if(baselineArray[item].search(/Y/) > -1){
                var value = parseInt(baselineArray[item].match(regexp)[0].substring(1)) - 50;
                baselineArray[item] = baselineArray[item].replace(regexp, "Y"+String(value))
            }
        });
        baseline = baselineArray.join("\n");
    } else {
        if(bedX > 0){
            var baselineArray = baseline.split(/\n/g);
            var regexp = /X\d+/;
            baselineArray.forEach(function(index, item){
                if(baselineArray[item].search(/X/) > -1){
                    var value = parseInt(baselineArray[item].match(regexp)[0].substring(1)) + bedX;
                    baselineArray[item] = baselineArray[item].replace(regexp, "X"+String(value));
                }
            });
            baseline = baselineArray.join("\n");
        }
        if(bedY > 0){  
            var baselineArray = baseline.split(/\n/g);
            var regexp = /Y\d+/;
            baselineArray.forEach(function(index, item){
                if(baselineArray[item].search(/Y/) > -1){
                    var value = parseInt(baselineArray[item].match(regexp)[0].substring(1)) + bedY;
                    baselineArray[item] = baselineArray[item].replace(regexp, "Y"+String(value))
                }
            });
            baseline = baselineArray.join("\n");
        }   
    } 
    downloadFile('baseline.gcode', baseline);
}

