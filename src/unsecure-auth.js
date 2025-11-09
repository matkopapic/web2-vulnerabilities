const getUser = require("./getUser");
const pool = require('./database');
const crypto = require("crypto");

const sessions = {};


function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}


async function unsecureRegister(req, res) {
    const { email, password, username } = req.body;
    if (!email || !password || !username) return res.status(400).json({ error: 'missing fields' });


    const passwordHash = md5(password);

    try {
        await pool.query('INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3)', [email, passwordHash, username]);
        res.status(201).json({ message: "Success" })
    } catch (err) {
        console.error('DB error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function unsecureLogin(req, res) {
    const { email, password } = req.body;
    const user = await getUser(email);
    if (!user) {
        return res.status(401).json({ error: `No account found for ${email}` });
    }
    const passwordHash = md5(password);
    if (passwordHash !== user.password_hash) {
        return res.status(401).json({ error: `Wrong password for ${email}` });
    }


    const sessionId = crypto.randomBytes(16).toString('hex');
    sessions[sessionId] = email;


    return res.status(200).json({ session_id: sessionId });
}


async function unsecureMe(req, res){
    const sessionId = req.query.sessionId || req.headers['x-session-id'];
    if (!sessionId || !sessions[sessionId]) return res.status(401).json({ error: 'not authenticated' });
    return res.json(await getUser(sessions[sessionId]));
}

module.exports = {unsecureMe, unsecureRegister, unsecureLogin}