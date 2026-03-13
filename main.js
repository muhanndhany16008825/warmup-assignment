const fs = require("fs");
// helper 1 convert time to sec 
function timeToSeconds(time) {
    let parts = time.split(":");
    let h = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let s = parseInt(parts[2]);

    return h*3600 + m*60 + s;
}
// convert time from num to string 
function secondsToTime(sec) {

    let h = Math.floor(sec / 3600);
    sec = sec % 3600;

    let m = Math.floor(sec / 60);
    let s = sec % 60;

    m = String(m).padStart(2,"0");
    s = String(s).padStart(2,"0");

    return h + ":" + m + ":" + s;
}
// convert am ,pm
    function ampmToSeconds(t){

    let parts = t.trim().split(" ");
    let time = parts[0];
    let period = parts[1];

    let p = time.split(":");

    let h = parseInt(p[0]);
    let m = parseInt(p[1]);
    let s = parseInt(p[2]);

    if(period === "pm" && h !== 12) h += 12;
    if(period === "am" && h === 12) h = 0;

    return h*3600 + m*60 + s;
}
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let start = ampmToSeconds(startTime);
    let end = ampmToSeconds(endTime);

    let diff = end - start;

    return secondsToTime(diff);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    let start = ampmToSeconds(startTime);
    let end = ampmToSeconds(endTime);
    let startWork = 8*3600;
    let endWork = 22*3600;
    let idle = 0;
    if(start < startWork)
        idle += startWork - start;
    if(end > endWork)
        idle += end - endWork;
    return secondsToTime(idle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    let shift = timeToSeconds(shiftDuration);
    let idle = timeToSeconds(idleTime);
    let active = shift - idle;

    return secondsToTime(active);
}
// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
    let active = timeToSeconds(activeTime);
    let quota = timeToSeconds("8:24:00");
    let d = new Date(date);
    if(d >= new Date("2025-04-10") && d <= new Date("2025-04-30")){
        quota = timeToSeconds("6:00:00");
    }
    return active >= quota;
}
// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
    function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = content.length ? content.split("\n") : [];

    for(let line of lines){
        let cols = line.split(",");
        if(cols[0] === shiftObj.driverID && cols[2] === shiftObj.date){
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let quota = metQuota(shiftObj.date, activeTime);

    let newRecord = [
        shiftObj.driverID,
        shiftObj.driverName,
        shiftObj.date,
        shiftObj.startTime,
        shiftObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        quota,
        false
    ].join(",");

    lines.push(newRecord);

    fs.writeFileSync(textFile, lines.join("\n"));

    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };

}
// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = content.split("\n");
    for(let i = 0; i < lines.length; i++){
        let cols = lines[i].split(",");
        if(cols[0] === driverID && cols[2] === date){
            cols[9] = newValue.toString();
            lines[i] = cols.join(",");
        }
    }
    fs.writeFileSync(textFile, lines.join("\n"));
}
// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {

    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = content.split("\n");

    let count = 0;
    let found = false;
    for (let line of lines) {
        let cols = line.trim().split(",");
        if (cols[0] === driverID) {
            found = true;
            let m = parseInt(cols[2].split("-")[1]);
            if (m == parseInt(month) && cols[9].trim() === "true") {
                count++;
            }
        }
    }
    if (!found) return -1;
    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    let content = fs.readFileSync(textFile, "utf8").trim();
    let lines = content.split("\n");
    let total = 0;
    for(let line of lines){
        let cols = line.split(",");
        if(cols[0] === driverID){
            let m = parseInt(cols[2].split("-")[1]);
            if(m == month){
                total += timeToSeconds(cols[7]);
            }
        }
    }

    return secondsToTime(total);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
    let shifts = fs.readFileSync(textFile,"utf8").trim().split("\n");
    let rates = fs.readFileSync(rateFile,"utf8").trim().split("\n");

    let dayOff = "";

    for(let r of rates){
        let cols = r.split(",");
        if(cols[0] === driverID){
            dayOff = cols[1];
        }
    }

    let total = 0;
    for(let line of shifts){
        let cols = line.split(",");
        if(cols[0] === driverID){
            let date = cols[2];
            let d = new Date(date);
            let m = d.getMonth() + 1;
            if(m == month){
                let day = d.toLocaleDateString("en-US",{weekday:"long"});
                if(day === dayOff) continue;
                let quota = (8*3600) + (24*60);
                if(d >= new Date("2025-04-10") && d <= new Date("2025-04-30")){
                    quota = 6*3600;
                }
                total += quota;
            }
        }
    }

    total -= bonusCount * (2*3600);

    return secondsToTime(total);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
    let rates = fs.readFileSync(rateFile,"utf8").trim().split("\n");
    let basePay = 0;
    let tier = 0;
    for(let r of rates){
        let cols = r.split(",");
        if(cols[0] === driverID){
            basePay = parseInt(cols[2]);
            tier = parseInt(cols[3]);
        }
    }

    let actual = timeToSeconds(actualHours);
    let required = timeToSeconds(requiredHours);
    if(actual >= required) return basePay;
    let missing = required - actual;
    let allowance = 0;

    if(tier === 1) allowance = 50;
    if(tier === 2) allowance = 20;
    if(tier === 3) allowance = 10;
    if(tier === 4) allowance = 3;

    missing -= allowance * 3600;

    if(missing < 0) missing = 0;

    let missingHours = Math.floor(missing / 3600);
    let deductionRate = Math.floor(basePay / 185);
    let deduction = missingHours * deductionRate;
    return basePay - deduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
