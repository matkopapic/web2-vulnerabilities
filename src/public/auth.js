let secureMode = false;


function getPrefix() {
    return secureMode ? '/secure' : '/unsecure';
}


function updateUI() {
    document.getElementById('mode-label').textContent = `Current mode: ${secureMode ? 'Secure' : 'Insecure'}`;
    document.getElementById('toggle').textContent = secureMode ? 'Switch to Insecure Example' : 'Switch to Secure Example';
    document.getElementById('password').placeholder = secureMode ? 'password (≥9 chars)' : 'password';
    clearResponses();
}


function clearResponses() {
    document.getElementById('register-result').textContent = '';
    document.getElementById('login-result').textContent = '';
    document.getElementById('me-result').textContent = '';
}


function showLoader(id, show) {
    document.getElementById(id).classList.toggle('hidden', !show);
}


document.getElementById('toggle').addEventListener('click', () => {
    secureMode = !secureMode;
    updateUI();
});

document.getElementById('register-btn').addEventListener('click', async () => {
    showLoader('register-loader', true);
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const route = `${getPrefix()}-register`;
    const r = await fetch(route, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
        credentials: secureMode ? 'same-origin' : 'omit'
    });
    const data = await r.json();
    showLoader('register-loader', false);
    document.getElementById('register-result').textContent = JSON.stringify(data, null, 2);
});

document.getElementById('login-btn').addEventListener('click', async () => {
    showLoader('login-loader', true);
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const route = `${getPrefix()}-login`;
    const r = await fetch(route, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: secureMode ? 'same-origin' : 'omit'
    });
    const data = await r.json();
    showLoader('login-loader', false);
    document.getElementById('login-result').textContent = JSON.stringify(data, null, 2);


    if (!secureMode && data.session_id) {
        localStorage.setItem('session_id', data.session_id);
    }
});

document.getElementById('me-btn').addEventListener('click', async () => {
    showLoader('me-loader', true);
    const route = `${getPrefix()}-me`;
    let opts = { credentials: secureMode ? 'include' : 'omit' };
    if (!secureMode) {
        const sessionId = localStorage.getItem('session_id');
        opts.headers = { 'x-session-id': sessionId || '' };
    }
    const r = await fetch(route, opts);
    const data = await r.json();
    showLoader('me-loader', false);
    document.getElementById('me-result').textContent = JSON.stringify(data, null, 2);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    if (secureMode) {
        const r = await fetch('/secure-logout', { method: 'POST', credentials: 'same-origin' });
        const data = await r.json();
        document.getElementById('me-result').textContent = JSON.stringify(data, null, 2);
    } else {
        localStorage.removeItem('session_id');
    }
});


updateUI();