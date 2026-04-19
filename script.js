// Premium Admin Login Script - Professional UX with validation, toggle, loading, errors
// Preserves exact server flow: POST /login -> dashboard.html on success

let isPasswordVisible = false;

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    toggleIcon.textContent = isPasswordVisible ? '🙈' : '👁';
}

async function login(email, password) {
    const messageEl = document.getElementById('message');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Reset states
    messageEl.className = 'message';
    messageEl.textContent = '';
    loginBtn.disabled = false;
    spinner.style.display = 'none';
    btnText.style.opacity = '1';
    emailInput.parentElement.classList.remove('shake');
    passwordInput.parentElement.classList.remove('shake');

    // Trim and validate
    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }

    if (!/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/g.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        emailInput.parentElement.classList.add('shake');
        return;
    }

    if (password.length < 3) {
        showMessage('Password must be at least 3 characters', 'error');
        passwordInput.parentElement.classList.add('shake');
        return;
    }

    // Loading state
    loginBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.style.opacity = '0';
    btnText.textContent = 'Signing in...';

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Success - redirect
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        showMessage('Invalid email or password', 'error');
        // Subtle shake
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.add('shake');
        });
    } finally {
        // Reset button
        setTimeout(() => {
            loginBtn.disabled = false;
            spinner.style.display = 'none';
            btnText.style.opacity = '1';
            btnText.textContent = 'Login';
        }, 1000);
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

// Form submit handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
});

// Enter key support
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});
