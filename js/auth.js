// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');

        const result = loginUser(email, password);
        
        if (result.success) {
            messageDiv.className = 'success-message show';
            messageDiv.textContent = 'Login successful! Redirecting...';
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } else {
            messageDiv.className = 'error-message show';
            messageDiv.textContent = result.message || 'Invalid credentials';
        }
    });
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('message');

        if (password !== confirmPassword) {
            messageDiv.className = 'error-message show';
            messageDiv.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            messageDiv.className = 'error-message show';
            messageDiv.textContent = 'Password must be at least 6 characters';
            return;
        }

        const result = registerUser(username, email, password);
        
        if (result.success) {
            messageDiv.className = 'success-message show';
            messageDiv.textContent = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            messageDiv.className = 'error-message show';
            messageDiv.textContent = result.message || 'Registration failed';
        }
    });
}

