const { formatInTimeZone } = require('date-fns-tz');
const { format, getTime } = require('date-fns');


const getTimeRange = (option) => {
  console.log('ss')
  switch(option) {
    case 'today':
      return 'aa'
    default: 
      return '';
  }
}

console.log('aaa')
const ret = getTimeRange('today');
console.log(ret)
