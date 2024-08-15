import UserAuth from './modules/userAuth.js';

const auth = new UserAuth('/api/v1');

async function initApp() {
	try {
		const userData = await auth.checkAuth();
		showAuthenticatedUI(userData);
	} catch (error) {
		console.error(error);
		showUnauthenticatedUI();
	}
}

function showAuthenticatedUI(userData) {
	document.querySelector('#userInfo').textContent = `歡迎，${userData.name}`;
	document.querySelector('#userEmail').textContent = userData.email;
	document.querySelector('#authenticatedContent').style.display = 'block';
	document.querySelector('#unauthenticatedContent').style.display = 'none';
	document.querySelector('#loginFormModal').style.display = 'none';
}

function showUnauthenticatedUI() {
	document.querySelector('#authenticatedContent').style.display = 'none';
	document.querySelector('#unauthenticatedContent').style.display = 'block';
	document.querySelector('#loginFormModal').style.display = 'none';
}

function showLoginForm() {
	document.querySelector('#loginFormModal').style.display = 'block';
}

function hideLoginForm() {
	document.querySelector('#loginFormModal').style.display = 'none';
}

function redirectToRegister() {
  window.location.href = '/register';
}

document.querySelector('#unauthenticatedContent').addEventListener('click', showLoginForm);
document.querySelector('#closeLoginForm').addEventListener('click', hideLoginForm);
document.querySelector('#showRegisterForm').addEventListener('click', redirectToRegister);

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    await auth.login(email, password);
    await initApp();
  } catch (error) {
    console.error('Login failed:', error);
    alert('登入失敗。請再試一次。');
  }
});

document.querySelector('#logoutButton').addEventListener('click', () => {
	auth.logout();
	showUnauthenticatedUI();
});

window.onclick = function(event) {
	if (event.target == document.querySelector('#loginFormModal')) {
		hideLoginForm();
	}
}

initApp();
