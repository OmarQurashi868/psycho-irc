function log(s) {
    var currentDate = new Date()
    var hours = currentDate.getHours()
    var minutes = currentDate.getMinutes()
    var seconds = currentDate.getSeconds()
    var day = currentDate.getDate()
    var month = currentDate.getMonth() + 1
    var year = currentDate.getFullYear()

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = year + "/" + month + "/" +
        day + " " + hours + ":" + minutes + ":" + seconds + " >";
    console.log(time + " " + s);
}
module.exports = log;

