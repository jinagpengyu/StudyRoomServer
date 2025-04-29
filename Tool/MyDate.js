const dayjs = require('dayjs');
const utc = require('dayjs-plugin-utc');
// const timezone = require('dayjs-plugin-timezone');

// dayjs.extend(utc);
// dayjs.extend(timezone);

function TodayAndTomorrow() {
    const now = new Date();
    // 将当前时间转换为UTC+8时区
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const chinaTime = new Date(utc + (8 * 60 * 60 * 1000));

    // 计算明天和后天的时间
    const today = new Date(chinaTime.getTime());
    const tomorrow = new Date(chinaTime.getTime() + 24 * 60 * 60 * 1000);

    // 格式化日期为年月日对象
    return {
        today_YYMMDD : today.toISOString().split('T')[0],
        tomorrow_YYMMDD : tomorrow.toISOString().split('T')[0]
    }
}

function NowYYMMDDString () {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const chinaTime = new Date(utc + (8 * 60 * 60 * 1000));
    return chinaTime.toISOString().split('T')[0];
}
function CompareDate(date1YYMMDD, date2YYMMDD) {
    const date1 = new Date(date1YYMMDD);
    const date2 = new Date(date2YYMMDD);
    if(date1.getTime() > date2.getTime()) {
        return 1;
    } else if(date1 < date2) {
        return -1;
    } else {
        return 0;
    }

}
function GetChinaDate() {
    const date = new Date();
    const offset = 8; // 东八区固定偏移
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const chinaTime = new Date(utcTime + (offset * 3600000));
    return chinaTime;
}


module.exports = {
    TodayAndTomorrow,
    NowYYMMDDString,
    CompareDate,
    GetChinaDate,
    GetSelectDate: function () {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const chinaTime = new Date(utc + (8 * 60 * 60 * 1000));

        // 格式化为 YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            todayDate: formatDate(chinaTime),
            tomorrowDate: formatDate(new Date(chinaTime.getTime() + 24 * 60 * 60 * 1000))
        };
    }
}