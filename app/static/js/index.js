import UserAuth from './modules/userAuth.js';
import { fetchCities, fetchCourseCategories } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');

const courseCategories = document.querySelector('#courseCategories')

async function initApp() {
	try {
		const userData = await auth.checkAuth();
    showAuthenticatedUI(userData);
    showCourseCategories();
	} catch (error) {
		console.error(error);
		showUnauthenticatedUI();
    showCourseCategories();
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

async function showCourseCategories() {
    const courseCategoriesData = await fetchCourseCategories();

    courseCategoriesData.forEach(category => {
        const link = document.createElement('a');
        link.href = `/course_category/${category.name}`;
        link.className = 'bg-white rounded-lg shadow overflow-hidden';

        const img = document.createElement('img');
        img.src = `https://fakeimg.pl/300x200/010101,128/000,255/?text=${encodeURIComponent(category.name)}&font=noto`;
        img.alt = `${category.name}課程`;
        img.className = 'w-full h-32 object-cover';

        const div = document.createElement('div');
        div.className = 'p-2';

        const p = document.createElement('p');
        p.className = 'text-center font-semibold';
        p.textContent = `✨精選${category.name}課程✨`;

        div.appendChild(p);
        link.appendChild(img);
        link.appendChild(div);
        courseCategories.appendChild(link);
    });
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
