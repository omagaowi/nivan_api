// a utitlity for formatting dates by just passing in the date in milliseconds
 function formatDate(dateValue){
    // console.log(dateValue)
    dateValue = new Date(dateValue)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const shortDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const shortMonths = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const dateValueMinute = dateValue.getMinutes()
    const valueMinuteZero = dateValueMinute < 10? '0' + dateValueMinute : dateValueMinute
    // console.log(dateValueMinute)
    const dateValueHour = dateValue.getHours()
    const valueHourZero = dateValueHour < 10? '0' + dateValueHour : dateValueHour
    // console.log(dateValueHour)
    const dateValueDay = dateValue.getDay()
    // console.log(dateValueDay)
    const dateValueDate = dateValue.getDate()
    const valueDateZero = dateValueDate < 10? '0' + dateValueDate : dateValueDate
    // console.log(dateValueDate)
    const dateValueMonth = dateValue.getMonth()
    const valueMonthZero = +dateValueMonth + 1 < 10? `0${+dateValueMonth + 1}` : `${+dateValueMonth + 1}`
    // console.log(dateValueMonth)
    const dateValueYear = dateValue.getFullYear()
    // console.log(dateValueYear)
    //WORDS
    const dateValueDayWords = days[dateValueDay]
    // console.log(dateValueDayWords)
    const dateValueDayWordsShort = shortDays[dateValueDay]
    // console.log(dateValueDayWordsShort)
    const dateValueMonthWords = months[dateValueMonth]
    const dateValueDayMonthWordsShort = shortMonths[dateValueMonth]
    // console.log(dateValueDayWordsShort)

    //DATE FORMATS
    const fullShort = `${valueDateZero}/${valueMonthZero}/${dateValueYear}`
    let datePosition
    if(dateValueDate.toString().endsWith('1')){
        if(dateValueDate.toString().startsWith('1')){
            datePosition = `${dateValueDate}th`
        }else{
            datePosition = `${dateValueDate}st`
        }
    }else if(dateValueDate.toString().endsWith('2')){
        if(dateValueDate.toString().startsWith('1')){
            datePosition = `${dateValueDate}th`
        }else{
            datePosition = `${dateValueDate}nd`
        }
    }else if(dateValueDate.toString().endsWith('3')){
        if(dateValueDate.toString().startsWith('1')){
            datePosition = `${dateValueDate}th`
        }else{
            datePosition = `${dateValueDate}rd`
        }
    }else{
        datePosition = `${dateValueDate}th`
    }
    const noDay = `${datePosition} ${dateValueMonthWords}, ${dateValueYear}`
    const noDayShort = `${datePosition} ${dateValueDayMonthWordsShort}, ${dateValueYear}`
    const midShort = `${dateValueDayWordsShort} ${datePosition} ${dateValueDayMonthWordsShort}, ${dateValueYear}`
    const midLong = `${dateValueDayWordsShort} ${datePosition} ${dateValueMonthWords}, ${dateValueYear}`
    const fullLong = `${dateValueDayWords} ${datePosition} ${dateValueMonthWords}, ${dateValueYear}`
    const fullTime = `${valueHourZero}:${valueMinuteZero}`



    const currentDate = new Date().getTime()
    const duration = currentDate - dateValue;
    let secondsBetween = duration / 1000
    secondsBetween = Math.round(secondsBetween)
    let minutesBetween = duration / 1000 / 60
    minutesBetween = Math.round(minutesBetween)
    let hoursBetween = duration / 1000 / 60 / 60
    hoursBetween = Math.round(hoursBetween)
    // console.log(hoursBetween)
    let daysBetween = duration / 1000 / 60 / 60 / 24
    daysBetween = Math.round(daysBetween)
    // console.log(daysBetween)
    let timeApproxl

   

    if(minutesBetween >= 1){
        timeApproxl = `${minutesBetween}m`
        if(minutesBetween >= 60){
            timeApproxl = `${hoursBetween}h`
            if(hoursBetween >= 24){
                timeApproxl = `${daysBetween}d`
                if(daysBetween > 7){
                    timeApproxl = fullShort
                }else{
                    timeApproxl = `${daysBetween}d`
                }
            }else{
                timeApproxl = `${hoursBetween}h`
            }
        }else{
            timeApproxl = `${minutesBetween}m`
        }
    }else{
       timeApproxl = 'Just Now' 
    }
    // console.log(timeApproxl)
    const formatObj = {
      fullShort: fullShort, // 28/10/2023
      noDay: noDay, // 28th October, 2023
      noDayShort: noDayShort, // 28th Oct, 2023
      midShort: midShort, // Sat 28th Oct, 2023
      midLong: midLong, // Sat 28th October, 2023
      fullLong: fullLong, // Saturday 28th October, 2023
      dayWords: dateValueDayWords, // Sunday
      dayWordsShort: dateValueDayWordsShort, // Sat
      monthWords: dateValueMonthWords, // October
      monthWordsShort: dateValueDayMonthWordsShort, // Oct
      time: fullTime, // 20:51
      timeApproxl: timeApproxl, // Just Now, 10s, 15m, 1h, 2d, 28/10/2023
    };
    return formatObj
 }



 const dateValue = new Date("July 2, 2023 2:12:00").getTime()
 module.exports = { formatDate }
// console.log(formatDate(dateValue))
//  console.log(myForm)