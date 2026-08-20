const dns = require('dns');
dns.setServers(["8.8.8.8","8.8.4.4"]);
const mongoose =  require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
    
        console.log("Database Connected");
    }catch(err)
    {
        console.log("DB connecton failed" , err.message);
        process.exit(1);
    }
}

module.exports = connectDB;