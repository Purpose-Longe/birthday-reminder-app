async function fetchUsers() {
  const res = await fetch('/api/users');
  return await res.json();
}

function showMessage(text, ok = true) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.style.color = ok ? 'green' : 'crimson';
  setTimeout(() => { el.textContent = ''; }, 5000);
}

async function refreshList() {
  const list = document.getElementById('users');
  list.innerHTML = '';
  try {
    const users = await fetchUsers();
    if (!users.length) { list.innerHTML = '<li>No users yet</li>'; return; }
    users.forEach(u => {
      const li = document.createElement('li');
      li.textContent = `${u.username} — ${u.email} — ${new Date(u.dob).toLocaleDateString()}`;
      const btn = document.createElement('button');
      btn.textContent = 'Delete';
      btn.style.marginLeft = '8px';
      btn.onclick = async () => {
        if (!confirm('Delete this user?')) return;
        await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
        refreshList();
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Failed to load users</li>';
  }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const dob = document.getElementById('dob').value;

  if (!username || !email || !dob) { showMessage('Fill all fields', false); return; }

  try {
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, dob })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save');
    showMessage('Saved!');
    document.getElementById('userForm').reset();
    refreshList();
  } catch (err) {
    showMessage(err.message, false);
  }
});

// initial load
refreshList();
