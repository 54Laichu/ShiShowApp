import UserAuth from './modules/userAuth.js';

const auth = new UserAuth('/api/v1');

async function initApp() {
    try {
        const userData = await auth.checkAuth();
        console.log('User authenticated:', userData);
        showAuthenticatedUI(userData);
    } catch (error) {
        console.error('Authentication failed:', error);
        showUnauthenticatedUI();
    }
}

function showAuthenticatedUI(userData) {
    document.getElementById('userInfo').textContent = `歡迎，${userData.username}`;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('authenticatedContent').style.display = 'block';
    document.getElementById('unauthenticatedContent').style.display = 'none';
    document.getElementById('loginFormModal').style.display = 'none';
}

function showUnauthenticatedUI() {
    document.getElementById('authenticatedContent').style.display = 'none';
    document.getElementById('unauthenticatedContent').style.display = 'block';
    document.getElementById('loginFormModal').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginFormModal').style.display = 'block';
}

function hideLoginForm() {
    document.getElementById('loginFormModal').style.display = 'none';
}

function redirectToRegister() {
  window.location.href = '/register';
}

document.getElementById('unauthenticatedContent').addEventListener('click', showLoginForm);
document.getElementById('closeLoginForm').addEventListener('click', hideLoginForm);
document.getElementById('showRegisterForm').addEventListener('click', redirectToRegister);

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.login(email, password);
        const userData = await auth.checkAuth();
        showAuthenticatedUI(userData);
    } catch (error) {
        console.error('Login failed:', error);
        alert('登入失敗。請再試一次。');
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    auth.logout();
    showUnauthenticatedUI();
});

window.onclick = function(event) {
    if (event.target == document.getElementById('loginFormModal')) {
        hideLoginForm();
    }
}

initApp();
