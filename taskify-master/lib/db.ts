import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '72.249.254.50',
  user: 'c0calender',
  password: 'bodxcNMRA9#X',
  database: 'c0Calender',
  port: 3000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
