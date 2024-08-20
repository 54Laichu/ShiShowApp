import UserAuth from './modules/userAuth.js';
import { fetchCategoryCoach, fetchCities } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');

const categoryName = document.querySelector("#categoryName").textContent;
const coaches = await fetchCategoryCoach(categoryName);
// console.log(categoryName);
console.log(coaches);

function showLoginForm() {
  document.querySelector('#loginFormModal').style.display = 'block';
  document.querySelector('#closeLoginForm').style.display = 'none';
}

function populateCoachesInfo(coaches) {
  const cityCoach = document.querySelector("#cityCoach");
  cityCoach.innerHTML = '';

  coaches.forEach(coach => {
    // Card Container
    const coachContainer = document.createElement('div');
    coachContainer.className = 'coach-container';
    coachContainer.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'mb-6', 'hover:shadow-lg', 'cursor-pointer', 'transition-shadow', 'duration-300', 'ease-in-out');

    // Coach Profile Section
    const coachCard = document.createElement('div');
    coachCard.className = 'coach-card';
    coachCard.classList.add('flex', 'items-center', 'space-x-4', 'mb-4');

    // Profile Photo
    const coachProfilePhoto = document.createElement('div');
    coachProfilePhoto.className = 'coach-profile-photo';
    const imgElement = document.createElement('img');
    imgElement.classList.add('w-20', 'h-20', 'rounded-full', 'object-cover', 'shadow-sm');

    if (coach.profile_photo) {
      let url = coach.profile_photo;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        imgElement.src = coach.profile_photo;
      } else {
        const BASE_URL = `${window.location.origin}`;
        imgElement.src = `${BASE_URL}/${url}`;
      }
    } else {
      imgElement.src = "/static/favicon.ico";
    }
    imgElement.alt = `${coach.name}'s profile photo`;
    coachProfilePhoto.appendChild(imgElement);

    // Coach Details
    const coachNameAccount = document.createElement('div');
    coachNameAccount.className = 'coach-name-account';

    const nameElement = document.createElement('h2');
    nameElement.textContent = coach.name;
    nameElement.classList.add('text-lg', 'font-semibold', 'text-gray-800');

    const accountElement = document.createElement('p');
    accountElement.textContent = `暱稱: ${coach.account}`;
    accountElement.classList.add('text-gray-600');

    coachNameAccount.appendChild(nameElement);
    coachNameAccount.appendChild(accountElement);

    // View Details Button
    const viewDetailsBtn = document.createElement('button');
    viewDetailsBtn.textContent = "詳細資料";
    viewDetailsBtn.classList.add("bg-gray-500", "hover:bg-gray-600", "text-white", "font-bold", "py-2", "px-4", "rounded-lg", "focus:outline-none", "focus:ring", "ml-4");
    viewDetailsBtn.onclick = function () {
      console.log('檢視教練資料');
    };

    // Wrapper for coach details and view details button
    const detailsWrapper = document.createElement('div');
    detailsWrapper.classList.add('flex', 'items-center', 'justify-between', 'w-full');
    detailsWrapper.appendChild(coachNameAccount);
    detailsWrapper.appendChild(viewDetailsBtn);

    coachCard.appendChild(coachProfilePhoto);
    coachCard.appendChild(detailsWrapper);

    // Bind Button
    const bindBtn = document.createElement('button');
    bindBtn.textContent = "提出綁定申請";
    bindBtn.classList.add("bg-orange-500", "hover:bg-orange-600", "text-white", "font-bold", "py-2", "px-4", "rounded-lg", "focus:outline-none", "focus:ring", "w-full", "mt-4");
    bindBtn.onclick = async function () {
      try {
        await auth.checkAuth();
        console.log('提出綁定申請');
      } catch {
        showLoginForm()
      }
    };

    coachContainer.appendChild(coachCard);
    coachContainer.appendChild(bindBtn);

    // Bio Section
    const bioElement = document.createElement('p');
    bioElement.textContent = coach.bio || "ShiShow 專業健身教練，給你最棒的體驗";
    bioElement.classList.add('text-gray-700', 'mt-4');

    coachContainer.appendChild(bioElement);

    cityCoach.appendChild(coachContainer);
  });
}

// --- Login form
document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    await auth.login(email, password);
    await initApp();
    window.location.reload();
  } catch (error) {
    console.error('Login failed:', error);
    alert('登入失敗。請再試一次。');
  }
});

document.querySelector('#showRegisterForm').addEventListener('click', () => {
  window.location.href = '/register'
});

document.querySelector('#showRegisterForm').addEventListener('click', () => {
  window.location.href = '/register'
});

window.onclick = function(event) {
	if (event.target == document.querySelector('#loginFormModal')) {
		hideLoginForm();
	}
}

document.querySelector('#closeLoginForm').addEventListener('click', hideLoginForm);

function hideLoginForm() {
	document.querySelector('#loginFormModal').style.display = 'none';
}

// --- init app
async function initApp() {
  populateCoachesInfo(coaches);
}


initApp();
