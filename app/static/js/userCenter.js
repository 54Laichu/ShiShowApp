import UserAuth from './modules/userAuth.js';
import { fetchCities, fetchCourseCategories } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');

async function initApp() {
	try {
    const userData = await auth.fetchUserCenter();
    console.log(userData);
    const userCities = document.querySelector('#userCities');
    const userCourseCategories = document.querySelector('#userCourseCategories');
    const coachList = document.querySelector('#coachList');
    showUser(userData);
    showUserCities(userData.cities, userCities);
    showUserCourseCategories(userData.course_categories, userCourseCategories);
    showUserCoaches(userData.coaches, coachList);
    editUserForm();
    editCityForm();
    editCourseCategoryForm();
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

function showUserCoaches(coachesArray, container) {
  coachesArray.forEach(coach => {
    const li = document.createElement('li');
    li.classList.add('flex', 'justify-between', 'items-center');

    // Profile Photo
    const coachProfilePhoto = document.createElement('div');
    coachProfilePhoto.className = 'coach-profile-photo';
    const imgElement = document.createElement('img');
    imgElement.classList.add('w-20', 'h-20', 'rounded-full', 'object-cover', 'shadow-sm');

    if (coach.coach_profile_photo) {
      let url = coach.coach_profile_photo;
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
    li.appendChild(coachProfilePhoto);

    // Name & Account
    const spanElement = document.createElement('span');
    spanElement.textContent = `${coach.coach_name}（暱稱: ${coach.coach_account}）`;
    spanElement.classList.add('text-l');
    li.appendChild(spanElement);

    // DELETE Btn
    const divElement = document.createElement('div');
    const button = document.createElement('button');
    button.className = 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300';
    button.onclick = async () => {
      if (await unbindCoach(coach.coach_id)) {
          li.remove(); // 直接刪除整個 li 元素
      }
  };

    const buttonText = document.createElement('p');
    buttonText.textContent = '解除綁定';
    button.appendChild(buttonText);

    divElement.appendChild(button);
    li.appendChild(divElement);

    container.appendChild(li);
  });
}

async function unbindCoach(coachId) {
  try {
    const response = await fetch(`${window.location.origin}/api/v1/user_coach`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coach_id: coachId })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    alert(result.message);
    return true;
  } catch (error) {
    alert(error);
    return false;
  }
}


// --- Login form
function showLoginForm() {
  document.querySelector('#loginFormModal').style.display = 'block';
  document.querySelector('#closeLoginForm').style.display = 'none';
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
  const confirmed = confirm('確定要登出嗎？');
  if (confirmed) {
    auth.logout();
    window.location.href = "/";
  }
});

document.querySelector('#showRegisterForm').addEventListener('click', () => {
  window.location.href = '/register'
});

// Edit form----------------------
function editUserForm() {
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
    const url = "/user"

    try {
      const updatedUserData = await auth.updateUser({ name, password }, url);
      if (updatedUserData) {
        showUser(updatedUserData);
        exitEditMode();
        alert('更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。請再試一次。');
    }
  });
}

// ----------------
async function editCityForm() {
  const editCitiesButton = document.querySelector('#editCities');
  const editCitiesModal = document.querySelector('#editCitiesModal');
  const citiesSelect = document.querySelector('#citiesSelect');
  const selectedCitiesList = document.querySelector('#selectedCitiesList');
  const updateCitiesButton = document.querySelector('#updateCitiesButton');
  const cancelCitiesButton = document.querySelector('#cancelCitiesButton');

  let cities = [];
  let selectedCities = [];

  function updateSelectedCitiesList() {
    selectedCitiesList.innerHTML = ''; // 清空列表
    selectedCities.forEach(city => {
      const span = document.createElement('span');
      span.textContent = city.name;
      span.classList.add('bg-gray-200', 'px-2', 'py-1', 'rounded', 'inline-block', 'mr-2', 'mb-2');

      const removeButton = document.createElement('button');
      removeButton.textContent = '×';
      removeButton.classList.add('ml-2', 'text-red-500', 'font-bold');
      removeButton.onclick = function() {
        selectedCities = selectedCities.filter(c => c.id !== city.id);
        updateSelectedCitiesList();
        citiesSelect.value = ''; // 重置 select
      };

      span.appendChild(removeButton);
      selectedCitiesList.appendChild(span);
    });
  }

  // 下拉選單
  editCitiesButton.addEventListener('click', async () => {
    editCitiesModal.classList.remove('hidden');
    try {
      cities = await fetchCities();

      // 產生選單
      citiesSelect.innerHTML = '<option value="">選擇城市</option>';
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id.toString();
        option.textContent = city.name;
        citiesSelect.appendChild(option);
      });

      // 預選目前有勾選的縣市
      const currentUserCities = Array.from(userCities.children).map(span => span.textContent);
      selectedCities = cities.filter(city => currentUserCities.includes(city.name));
      updateSelectedCitiesList();
    } catch (error) {
      console.error('後台連線失敗:', error);
      alert('無法獲取城市選單，請稍後再試。');
    }
  });

  // 當所選的城市 id 對應 cities 陣列，如果有在清單中，且沒有出現在已選清單，就選起來
  citiesSelect.addEventListener('change', function() {
    const selectedCityId = this.value;
    const selectedCity = cities.find(city => city.id.toString() === selectedCityId);
    if (selectedCity && !selectedCities.some(city => city.id === selectedCity.id)) {
      selectedCities.push(selectedCity);
      updateSelectedCitiesList();
    }
    this.value = '';
  });

  editCitiesModal.addEventListener('click', (event) => {
    if (event.target === editCitiesModal) {
      editCitiesModal.classList.add('hidden');
    }
  });

  cancelCitiesButton.addEventListener('click', () => {
    editCitiesModal.classList.add('hidden');
  });

  updateCitiesButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const url = "/user_city";

    try {
      const updatedUserData = await auth.updateUserCities(selectedCities.map(city => city.name), url); // 先將 city.name 輸出成 array，在發送 PUT 到後端
      if (updatedUserData) {
        userCities.innerHTML = '';
        showUserCities(updatedUserData.cities, userCities);
        editCitiesModal.classList.add('hidden');
        alert('城市更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。');
    }
  });
}


// Edit CourseCategory--------------------------------
async function editCourseCategoryForm() {
  const editCourseCategoriesButton = document.querySelector('#editCourseCategories');
  const editCourseCategoriesModal = document.querySelector('#editCourseCategoriesModal');
  const courseCategoriesSelect = document.querySelector('#courseCategoriesSelect');
  const selectedCourseCategoriesList = document.querySelector('#selectedCourseCategoriesList');
  const updateCourseCategoriesButton = document.querySelector('#updateCourseCategoriesButton');
  const cancelCourseCategoriesButton = document.querySelector('#cancelCourseCategoriesButton');

  let courseCategories = [];
  let selectedCourseCategories = [];

  function updateSelectedCourseCategoriesList() {
    selectedCourseCategoriesList.innerHTML = ''; // 清空列表
    selectedCourseCategories.forEach(courseCategory => {
      const span = document.createElement('span');
      span.textContent = courseCategory.name;
      span.classList.add('bg-gray-200', 'px-2', 'py-1', 'rounded', 'inline-block', 'mr-2', 'mb-2');

      const removeButton = document.createElement('button');
      removeButton.textContent = '×';
      removeButton.classList.add('ml-2', 'text-red-500', 'font-bold');
      removeButton.onclick = function() {
        selectedCourseCategories = selectedCourseCategories.filter(c => c.id !== courseCategory.id);
        updateSelectedCourseCategoriesList();
        courseCategoriesSelect.value = ''; // 重置 select
      };

      span.appendChild(removeButton);
      selectedCourseCategoriesList.appendChild(span);
    });
  }

  // 下拉選單
  editCourseCategoriesButton.addEventListener('click', async () => {
    editCourseCategoriesModal.classList.remove('hidden');
    try {
      courseCategories = await fetchCourseCategories();

      // 產生選單
      courseCategoriesSelect.innerHTML = '<option value="">選擇課程</option>';
      courseCategories.forEach(courseCategory => {
        const option = document.createElement('option');
        option.value = courseCategory.id.toString();
        option.textContent = courseCategory.name;
        courseCategoriesSelect.appendChild(option);
      });

      // 預選目前有勾選的課程
      const currentUserCourseCategories = Array.from(userCourseCategories.children).map(span => span.textContent);
        selectedCourseCategories = courseCategories.filter(courseCategory => currentUserCourseCategories.includes(courseCategory.name));
        updateSelectedCourseCategoriesList();
    } catch (error) {
      console.error('後台連線失敗:', error);
      alert('無法獲取課程種類選單，請稍後再試。');
    }

    courseCategoriesSelect.addEventListener('change', function() {
      const selectedCourseCatrgoryId = this.value;
      const selectedCourseCatrgory = courseCategories.find(courseCategory => courseCategory.id.toString() === selectedCourseCatrgoryId);
      if (selectedCourseCatrgory && !selectedCourseCategories.some(courseCategory => courseCategory.id === selectedCourseCatrgory.id)) {
        selectedCourseCategories.push(selectedCourseCatrgory);
        updateSelectedCourseCategoriesList();
      }
      this.value = '';
    });
  });

  editCourseCategoriesModal.addEventListener('click', (event) => {
    if (event.target === editCourseCategoriesModal) {
      editCourseCategoriesModal.classList.add('hidden');
    }
  });

  cancelCourseCategoriesButton.addEventListener('click', () => {
    editCourseCategoriesModal.classList.add('hidden');
  });

  updateCourseCategoriesButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const url = "/user_course_category";

    try {
      const updatedUserData = await auth.updateUserCourseCategories(selectedCourseCategories.map(courseCategory => courseCategory.name), url); // 先將 courseCategory.name 輸出成 array，在發送 PUT 到後端
      if (updatedUserData) {
        userCourseCategories.innerHTML = '';
        showUserCourseCategories(updatedUserData.course_categories, userCourseCategories);
        editCourseCategoriesModal.classList.add('hidden');
        alert('課程種類更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。');
    }
  });
}

// --------------------------------

feather.replace();

initApp()
