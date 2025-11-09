const pool = require("./database");

async function sqlInjectionLogin(req, res) {
    const { username, password, allow_sql_injection } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Bad request' });
    }

    try {
        const safeQuery = 'SELECT username, email FROM users WHERE username = $1 LIMIT 1';
        const values = [username];

        const unsafeQuery = `SELECT username, email FROM users WHERE username = '${username}' LIMIT 1`;

        let result;
        if (allow_sql_injection) {
            result = await pool.query(unsafeQuery);
        } else {
            result = await pool.query(safeQuery, values);
        }

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'No user with this email and password' });
        }

        return res.json(result.rows);
    } catch (err) {
        console.error('DB error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = sqlInjectionLogin;