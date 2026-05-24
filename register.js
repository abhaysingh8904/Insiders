document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const retype = document.getElementById('retype').value;

  if (password !== retype) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, retype })
    });

    const data = await res.text();
    alert(data);
  } catch (err) {
    alert("❌ Error connecting to server");
    console.error(err);
  }
});