const getUser = require("./getUser");
const pool = require('./database');
const bcrypt = require("bcrypt");

function validatePassword(password) {
    if (!password || typeof password !== 'string') return 'Password required';
    if (password.length < 9) return 'Password must be at least 9 characters long';
    return null;
}

async function secureRegister(req, res) {
    const { email, password, username } = req.body;
    if (!email || !password || !username) return res.status(400).json({ error: 'missing fields' });
    const validationErrorMessage = validatePassword(password);
    if (validationErrorMessage) return res.status(400).json({ error: validationErrorMessage });

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3)', [email, passwordHash, username]);
        res.status(201).json({ message: "Success" })
    } catch (err) {
        console.error('DB error', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function secureLogin(req, res) {
    const { email, password } = req.body;

    const user = await getUser(email);

    if (!user) {
        await bcrypt.hash('fake-password', 10);
        return res.status(401).json({ error: 'Invalid credentials' });
    }


    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });


    req.session.user = { email };
    res.status(200).json({ message: "Success" })

}


async function secureMe(req, res) {
    if (!req.session || !req.session.user) return res.status(401).json({ error: 'not authenticated' });
    res.json(await getUser(req.session.user.email));
}


async function secureLogout(req, res) {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'logout failed' });
        res.status(200).json({ message: "Success" })
    });
}

module.exports = {secureLogout, secureLogin, secureRegister, secureMe}