import CoachAuth from "./modules/coachAuth.js";

const auth = new CoachAuth('/api/v1');

async function initApp() {
	try {
		const coachData = await auth.checkAuth();
		showAuthenticatedUI(coachData);
		showUserInvites()
	} catch (error) {
		console.error(error);
		showUnauthenticatedUI();
	}
}

function showAuthenticatedUI(coachData) {
	document.querySelector('#userInfo').textContent = `歡迎，${coachData.name}`;
	document.querySelector('#userEmail').textContent = coachData.email;
	document.querySelector('#authenticatedContent').style.display = 'block';
	document.querySelector('#unauthenticatedContent').style.display = 'none';
	document.querySelector('#loginFormModal').style.display = 'none';
}

function showUnauthenticatedUI() {
	document.querySelector('#authenticatedContent').style.display = 'none';
	document.querySelector('#unauthenticatedContent').style.display = 'block';
	document.querySelector('#loginFormModal').style.display = 'none';
}

async function updateUserInvite(user_id, status) {
	const response = await fetch(`${window.location.origin}/api/v1/user_coach`, {
		method: 'PUT',
		headers: {
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			user_id: user_id,
			status: status,
		}),
	});

	let result = await response.json()
	return result
}

// ------- Login  form
function showLoginForm() {
	document.querySelector('#loginFormModal').style.display = 'block';
}

function hideLoginForm() {
	document.querySelector('#loginFormModal').style.display = 'none';
}

function redirectToRegister() {
  window.location.href = '/coach/register';
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

// -------

async function showUserInvites() {
	const userInvites = document.querySelector('#userInvites');
	const response = await fetch(`${window.location.origin}/api/v1/user_coach`, {
		method: 'GET',
		headers: { "Authorization": `Bearer ${localStorage.getItem('token')}`}
	})

	if (response.ok) {
		let users = await response.json()
		console.log(users);
		users.forEach(user => {
			// Card Container
			const userContainer = document.createElement('div');
			userContainer.className = 'user-container';
			userContainer.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'mb-6', 'hover:shadow-lg', 'cursor-pointer', 'transition-shadow', 'duration-300', 'ease-in-out', 'flex', 'justify-between');

			// User name Section
			const userCard = document.createElement('div');
			userCard.className = 'user-card';
			userCard.classList.add('flex', 'items-center', 'space-x-4', 'mb-4', 'w-2/4');

			const userNamePhone = document.createElement('div');
			userNamePhone.className = 'user-name-phone';

			const nameElement = document.createElement('h2');
			nameElement.textContent = user.user_name;
			nameElement.classList.add('text-xl', 'font-semibold', 'text-gray-800');

			const phoneElement = document.createElement('p');
			phoneElement.textContent = `手機號碼: ${user.user_phone}`;
			phoneElement.classList.add('text-gray-600', 'text-sm');

			userNamePhone.append(nameElement, phoneElement);
			userCard.appendChild(userNamePhone);

			// 按鈕
			const buttonContainer = document.createElement('div');
			buttonContainer.className = 'button-container';
			buttonContainer.classList.add('flex', 'space-x-2', 'w-2/4');

			const agreeBtn = document.createElement('button');
    	agreeBtn.textContent = "同意";
    	agreeBtn.classList.add("bg-green-500", "hover:bg-green-600", "text-white", "font-bold", "py-2", "px-4", "rounded-lg", "focus:outline-none", "focus:ring", "w-full", "mt-4");
			agreeBtn.onclick = async function () {
				try {
					let result = await updateUserInvite(user.user_id, "accepted")
					userContainer.remove();
					alert(result.message);
				} catch (error) {
					console.error(error)
				}
			}

			const rejectBtn = document.createElement('button');
    	rejectBtn.textContent = "拒絕";
    	rejectBtn.classList.add("bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-2", "px-4", "rounded-lg", "focus:outline-none", "focus:ring", "w-full", "mt-4");
			rejectBtn.onclick = async function () {
				try {
					let result = await updateUserInvite(user.user_id, "rejected")
					userContainer.remove();
					alert(result.message);
				} catch (error) {
					console.error(error)
				}
			}

			buttonContainer.append(agreeBtn, rejectBtn);
			userContainer.append(userCard, buttonContainer);
			userInvites.appendChild(userContainer);
		})
	}
}

initApp();
