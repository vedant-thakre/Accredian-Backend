import mysql from 'mysql2';

export const DB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Leoved@2001",
    database: "assignment"
});