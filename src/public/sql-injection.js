const form1 = document.getElementById('loginForm1');
const output1 = document.getElementById('output1');

form1.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form1);
    const body = new URLSearchParams(fd);

    const resp = await fetch('/login1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    const data = await resp.json();
    output1.textContent = JSON.stringify({ status: resp.status, data }, null, 2);
});