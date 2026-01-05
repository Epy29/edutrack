import mysql from 'mysql2/promise';

export const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'EduTrack',
    password: 'EduTrack29@',
    database: 'edutracktest',
});