let dbUrl = ''
if (process.env.DB_URL) {
     dbUrl = process.env.DB_URL
}else{
  dbUrl='mongodb+srv://thomas:test@presence.kmnoz.mongodb.net/presence?retryWrites=true&w=majority';
}

module.exports = {
  url : dbUrl
}
