import CoachAuth from './modules/coachAuth.js';
import { fetchCities, fetchCourseCategories } from "../modules/fetchData.js";

const auth = new CoachAuth('/api/v1');

async function initApp() {
	try {
    const coachData = await auth.fetchCoachCenter();
    console.log(coachData);
    const coachCities = document.querySelector('#coachCities');
    const coachCourseCategories = document.querySelector('#coachCourseCategories');
    showCoach(coachData);
    showCoachCities(coachData.cities, coachCities)
    showCoachCourseCategories(coachData.course_categories, coachCourseCategories)
    // editCoachForm();
    // editCityForm();
    // editCourseCategoryForm();
	} catch (error) {
    console.error(error);
    showLoginForm()
	}
}

function showCoach(coachData) {
	document.querySelector('#coachName').textContent = `${coachData.name}`;
	document.querySelector('#coachEmail').textContent = coachData.email;
	document.querySelector('#loginFormModal').style.display = 'none';
}

function showCoachCities(citiesArray, container) {
  citiesArray.forEach(city => {
    const cityElement = document.createElement('span');
    cityElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
		cityElement.value = city;
		cityElement.textContent = city;
		container.appendChild(cityElement);
	});
}

function showCoachGyms(gymsArray, container) {
  gymsArray.forEach(gym => {
    const gymElement = document.createElement('span');
    gymElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
		gymElement.value = gym;
		gymElement.textContent = gym;
		container.appendChild(gymElement);
	});
}

function showCoachCourseCategories(courseCategoriesArray, container) {
  courseCategoriesArray.forEach(category => {
    const cityElement = document.createElement('span');
    cityElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
		cityElement.value = category;
		cityElement.textContent = category;
		container.appendChild(cityElement);
	});
}

function showLoginForm() {
  document.querySelector('#loginFormModal').style.display = 'block';
  document.querySelector('#closeLoginForm').style.display = 'none';
}

// --- Login form
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

document.querySelector('#showRegisterForm').addEventListener('click', () => {
  window.location.href = '/register'
});

initApp();
