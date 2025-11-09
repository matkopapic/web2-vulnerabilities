const pool = require('./database');

async function getUser(email) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0];
    } catch (err) {
        console.error('DB error', err);
        return null;
    }
}

module.exports = getUser;