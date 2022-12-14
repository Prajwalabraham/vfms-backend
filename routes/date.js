function startWeek(date) {
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
}

const date = dt.getDate()
const day = dt.getDay()
const diff = dt.getDay() === 0 ? -6 : 1
console.log(dt);
console.log(date);
console.log(day);
console.log(diff);
const StartofWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
console.log(StartofWeek);
const a = new Date( dt.setDate(StartofWeek))
console.log(a);