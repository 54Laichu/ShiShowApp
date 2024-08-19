import CoachAuth from './modules/coachAuth.js';
import { fetchCities, fetchCourseCategories } from "../modules/fetchData.js";

const auth = new CoachAuth('/api/v1');

const coachCities = document.querySelector('#coachCities');
const coachCourseCategories = document.querySelector('#coachCourseCategories');
const coachGyms = document.querySelector('#coachGyms');
const editProfilePhoto = document.querySelector('#editProfilePhoto');
const profilePreview = document.querySelector('#profilePreview');
const certificatePhotoInput = document.querySelector('#certificatePhotoInput');
const coachCertificates = document.querySelector('#coachCertificates');
const certificateUpload = document.querySelector('#certificateUpload');


async function initApp() {
	try {
    const coachData = await auth.fetchCoachCenter();
    console.log(coachData);
    showCoach(coachData);
    showCoachCities(coachData.cities, coachCities);
    showCoachCourseCategories(coachData.course_categories, coachCourseCategories);
    showCoachGyms(coachData.gyms, coachGyms);
    editCoachForm();
    // editCityForm();
    // editCourseCategoryForm();
	} catch (error) {
    console.error(error);
    showLoginForm()
	}
}

function showCoach(coachData) {
  if (coachData.profile_photo) {
    let url = coachData.profile_photo
    if (url.startsWith('http://') || url.startsWith('https://')) {
      document.querySelector('#profilePreview').src = url;
    } else {
      const BASE_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
      document.querySelector('#profilePreview').src = `${BASE_URL}/${coachData.profile_photo}`;
    }
  }
	document.querySelector('#coachName').textContent = coachData.name;
  document.querySelector('#coachEmail').textContent = coachData.email;
  document.querySelector('#coachAccount').textContent = coachData.account;
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
		gymElement.value = gym.name;
		gymElement.textContent = `${gym.name}   ｜地址： ${gym.address}`;
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
  const confirmed = confirm('確定要登出嗎？');
  if (confirmed) {
    auth.logout();
    window.location.href = "/coach";
  }
});

document.querySelector('#showRegisterForm').addEventListener('click', () => {
  window.location.href = '/coach/register'
});

// Edit form----------------------
function editCoachForm() {
  const editCoachButton = document.querySelector('#editCoachButton');
  const saveCoachButton = document.querySelector('#saveCoachButton');
  const cancelCoachEdit = document.querySelector('#cancelCoachEdit');
  const editProfilePhoto = document.querySelector('#editProfilePhoto');
  const editName = document.querySelector('#editName');
  const editAccount = document.querySelector('#editAccount');
  const editPassword = document.querySelector('#editPassword');
  const coachName = document.querySelector('#coachName');
  const coachAccount = document.querySelector('#coachAccount');
  const passwordPlaceholder = document.querySelector('#passwordPlaceholder');
  const updateCoachForm = document.querySelector('#updateCoachForm');

  editProfilePhoto.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profilePreview.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }
  });

  function enterEditMode() {
    editName.value = coachName.textContent;
    editName.classList.remove('hidden');
    editAccount.value = coachAccount.textContent;
    editAccount.classList.remove('hidden');
    editPassword.classList.remove('hidden');
    editProfilePhoto.classList.remove('hidden');
    coachName.classList.add('hidden');
    coachAccount.classList.add('hidden');
    passwordPlaceholder.classList.add('hidden');
    editCoachButton.classList.add('hidden');
    saveCoachButton.classList.remove('hidden');
    cancelCoachEdit.classList.remove('hidden');
  }

  function exitEditMode() {
    editName.classList.add('hidden');
    editPassword.classList.add('hidden');
    editAccount.classList.add('hidden');
    editPassword.classList.add('hidden');
    editProfilePhoto.classList.add('hidden');
    coachName.classList.remove('hidden');
    coachAccount.classList.remove('hidden');
    passwordPlaceholder.classList.remove('hidden');
    editCoachButton.classList.remove('hidden');
    saveCoachButton.classList.add('hidden');
    cancelCoachEdit.classList.add('hidden');
  }

  editCoachButton.addEventListener('click', enterEditMode);
  cancelCoachEdit.addEventListener('click', exitEditMode);

  updateCoachForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = editName.value;
    const password = editPassword.value;
    const account = editAccount.value;
    const photoFile = editProfilePhoto.files[0];
    const url = "/coach"

    try {
      const updatedCoachData = await auth.updateCoach({photoFile, account, name, password }, url);
      if (updatedCoachData) {
        showCoach(updatedCoachData);
        exitEditMode();
        alert('更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。請再試一次。');
    }
  });
}

initApp();
