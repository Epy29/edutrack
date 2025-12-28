import mysql from 'mysql2/promise';

export const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'EduTrack29@',      
    database: 'EduTrack'
});