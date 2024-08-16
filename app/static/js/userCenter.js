import UserAuth from './modules/userAuth.js';

const auth = new UserAuth('/api/v1');

async function initApp() {
	try {
    const userData = await auth.fetchUserCenter();
    const userCities = document.querySelector('#userCities');
    const userCourseCategories = document.querySelector('#userCourseCategories');
    showUser(userData);
    showUserCities(userData.cities, userCities)
    showUserCourseCategories(userData.course_catrgories, userCourseCategories)
    // console.log(userData);
    setupEditForm();
	} catch (error) {
    console.error(error);
    showLoginForm()
	}
}

function showUser(userData) {
	document.querySelector('#userName').textContent = `${userData.name}`;
	document.querySelector('#userEmail').textContent = userData.email;
	document.querySelector('#loginFormModal').style.display = 'none';
}

function showUserCities(citiesArray, container) {
  citiesArray.forEach(city => {
    const cityElement = document.createElement('span');
    cityElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
		cityElement.value = city;
		cityElement.textContent = city;
		container.appendChild(cityElement);
	});
}

function showUserCourseCategories(courseCategoriesArray, container) {
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
function redirectToRegister() {
  window.location.href = '/register';
}

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

document.querySelector('#showRegisterForm').addEventListener('click', redirectToRegister);

// Edit form----------------------
function setupEditForm() {
  const editUserButton = document.querySelector('#editUserButton');
  const saveUserButton = document.querySelector('#saveUserButton');
  const cancelUserEdit = document.querySelector('#cancelUserEdit');
  const editName = document.querySelector('#editName');
  const editPassword = document.querySelector('#editPassword');
  const userName = document.querySelector('#userName');
  const passwordPlaceholder = document.querySelector('#passwordPlaceholder');
  const updateUserForm = document.querySelector('#updateUserForm');

  function enterEditMode() {
    editName.value = userName.textContent;
    editName.classList.remove('hidden');
    editPassword.classList.remove('hidden');
    userName.classList.add('hidden');
    passwordPlaceholder.classList.add('hidden');
    editUserButton.classList.add('hidden');
    saveUserButton.classList.remove('hidden');
    cancelUserEdit.classList.remove('hidden');
  }

  function exitEditMode() {
    editName.classList.add('hidden');
    editPassword.classList.add('hidden');
    userName.classList.remove('hidden');
    passwordPlaceholder.classList.remove('hidden');
    editUserButton.classList.remove('hidden');
    saveUserButton.classList.add('hidden');
    cancelUserEdit.classList.add('hidden');
  }

  editUserButton.addEventListener('click', enterEditMode);
  cancelUserEdit.addEventListener('click', exitEditMode);

  updateUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = editName.value;
    const password = editPassword.value;

    try {
      const updatedUserData = await auth.updateUser({ name, password });
      if (updatedUserData) {
        showUser(updatedUserData);
        exitEditMode();
        alert('用戶資訊更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。請再試一次。');
    }
  });
}

// ----------------

feather.replace();

initApp()

document.querySelector('#logoutButton').addEventListener('click', () => {
  const confirmed = confirm('確定要登出嗎？');
  if (confirmed) {
    auth.logout();
    window.location.href = "/";
  }
});
