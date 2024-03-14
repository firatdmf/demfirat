const fs =require('fs')
const dir = '../messages/'
const locales = fs.readdirSync(dir)
console.log(locales);