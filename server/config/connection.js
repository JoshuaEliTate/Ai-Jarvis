const Sequelize = require("sequelize");
require('dotenv').config();
console.log(process.env.DB_NAME);

const sequelize = new Sequelize({
    database: "aiJarvis_db",
    username: "root",
    password: "609193jos",
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
});


module.exports = sequelize;

// const Sequelize = require("sequelize");

// if (process.env.JAWSDB_URL) {
//   sequelize = new Sequelize(process.env.JAWSDB_URL);
// } else {
//   sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PW,
//     {
//       host:  process.env.DB_HOST,
//       dialect: 'mysql',
//       port:  process.env.DB_PORT,
//     },
//   );
// }