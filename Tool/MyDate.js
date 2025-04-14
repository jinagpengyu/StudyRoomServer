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

module.exports = {
    TodayAndTomorrow,
    NowYYMMDDString
}