import mysql from 'mysql';
// import  'dotenv/config';
//create a mysql connection
// dotenv.config();
console.log(process.env.DB_NAME);
const db= mysql.createConnection({
    host :process.env.DB_HOST,
    user:process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    datbase : process.env.DB_NAME
});




export default db;