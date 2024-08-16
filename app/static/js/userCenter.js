import UserAuth from './modules/userAuth.js';
import { fetchCities, fetchCourseCategories } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');

async function initApp() {
	try {
    const userData = await auth.fetchUserCenter();
    const userCities = document.querySelector('#userCities');
    const userCourseCategories = document.querySelector('#userCourseCategories');
    showUser(userData);
    showUserCities(userData.cities, userCities)
    showUserCourseCategories(userData.course_categories, userCourseCategories)
    // console.log(userData);
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

    try {
      const updatedUserData = await auth.updateUser({ name, password });
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

  function fillCitiesSelect() {
    citiesSelect.innerHTML = '<option value="">選擇城市</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.id.toString();
      option.textContent = city.name;
      citiesSelect.appendChild(option);
    });
  }

  // 下拉選單
  editCitiesButton.addEventListener('click', async () => {
    editCitiesModal.classList.remove('hidden');
    try {
      cities = await fetchCities();
      fillCitiesSelect(); //下拉選單
      // 從「可上課地區」的欄位中抓取目前有選的縣市
      const currentUserCities = Array.from(document.querySelector('#userCities').children).map(span => span.textContent);
      selectedCities = cities.filter(city => currentUserCities.includes(city.name));
      updateSelectedCitiesList();
    } catch (error) {
      console.error('後台連線失敗:', error);
      alert('無法獲取城市選單，請稍後再試。');
    }
  });

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

    try {
      const updatedUserData = await auth.updateUserCities(selectedCities.map(city => city.name));
      const userCities = document.querySelector('#userCities');
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
  const userCourseCategoriesDisplay = document.querySelector('#userCourseCategories');

  let courseCategories = [];
  let selectedCourseCategories = [];

  function updateSelectedCourseCategoriesList() {
    selectedCourseCategoriesList.innerHTML = '';
    selectedCourseCategories.forEach(category => {
      const span = document.createElement('span');
      span.textContent = category.name;
      span.classList.add('bg-gray-200', 'px-2', 'py-1', 'rounded', 'inline-block', 'mr-2', 'mb-2');

      const removeButton = document.createElement('button');
      removeButton.textContent = '×';
      removeButton.classList.add('ml-2', 'text-red-500', 'font-bold');
      removeButton.onclick = function() {
        selectedCourseCategories = selectedCourseCategories.filter(c => c.id !== category.id);
        updateSelectedCourseCategoriesList();
        courseCategoriesSelect.value = '';
      };

      span.appendChild(removeButton);
      selectedCourseCategoriesList.appendChild(span);
    });
  }

  function fillCourseCategoriesSelect() {
    if (!courseCategoriesSelect) {
      console.error('courseCategoriesSelect 元素不存在');
      return;
    }
    courseCategoriesSelect.innerHTML = '<option value="">選擇課程種類</option>';
    courseCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id.toString();
      option.textContent = category.name;
      courseCategoriesSelect.appendChild(option);
    });
  }

  function updateUserCourseCategoriesDisplay(categoryNames) {
    userCourseCategoriesDisplay.innerHTML = '';
    categoryNames.forEach(categoryName => {
      const span = document.createElement('span');
      span.textContent = categoryName;
      span.classList.add('bg-green-200', 'text-green-800', 'px-2', 'py-1', 'rounded', 'mr-2', 'mb-2', 'inline-block');
      userCourseCategoriesDisplay.appendChild(span);
    });
  }

  editCourseCategoriesButton.addEventListener('click', async () => {
    editCourseCategoriesModal.classList.remove('hidden');
    try {
      courseCategories = await fetchCourseCategories();
      if (!Array.isArray(courseCategories) || courseCategories.length === 0) {
        throw new Error('課程類別清單為空或格式不正確');
      }
      fillCourseCategoriesSelect();
      // 從「喜歡的課程種類」的欄位中抓取目前有選的課程種類
      const currentUserCategories = Array.from(userCourseCategoriesDisplay.children).map(span => span.textContent);
      selectedCourseCategories = courseCategories.filter(category => currentUserCategories.includes(category.name));
      updateSelectedCourseCategoriesList();
    } catch (error) {
      console.error('讀取失敗:', error);
      alert('無法讀取課程種類，請稍後再試。' + error.message);
      editCourseCategoriesModal.classList.add('hidden');
    }
  });

  // 選課程種類
  courseCategoriesSelect.addEventListener('change', function() {
    const selectedCategoryId = this.value;
    const selectedCategory = courseCategories.find(category => category.id.toString() === selectedCategoryId);
    if (selectedCategory && !selectedCourseCategories.some(category => category.id === selectedCategory.id)) {
      selectedCourseCategories.push(selectedCategory);
      updateSelectedCourseCategoriesList();
    }
    this.value = '';
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

    try {
      const updatedUserData = await auth.updateUserCourseCategories(selectedCourseCategories.map(category => category.name));

      if (updatedUserData && typeof updatedUserData === 'object') {
        let courseCategoriesData;

        if (Array.isArray(updatedUserData.courseCategories)) {
          courseCategoriesData = updatedUserData.courseCategories;
        } else if (Array.isArray(updatedUserData.course_categories)) {
          courseCategoriesData = updatedUserData.course_categories;
        } else if (Array.isArray(updatedUserData)) {
          courseCategoriesData = updatedUserData;
        } else {
          throw new Error('無法在返回數據中找到課程類別數組');
        }

        if (courseCategoriesData.length > 0 && typeof courseCategoriesData[0] === 'string') {
          updateUserCourseCategoriesDisplay(courseCategoriesData);
          editCourseCategoriesModal.classList.add('hidden');
          alert('課程種類更新成功！');
        } else if (courseCategoriesData.length > 0 && typeof courseCategoriesData[0] === 'object' && courseCategoriesData[0].name) {
          updateUserCourseCategoriesDisplay(courseCategoriesData.map(category => category.name));
          editCourseCategoriesModal.classList.add('hidden');
          alert('課程種類更新成功！');
        } else {
          throw new Error('課程類別數據格式不正確');
        }
      } else {
        throw new Error('更新後的用戶數據格式不正確');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。請再試一次。錯誤詳情：' + error.message);
    }
  });

  function updateUserCourseCategoriesDisplay(categoryNames) {
    userCourseCategoriesDisplay.innerHTML = '';
    categoryNames.forEach(categoryName => {
      const span = document.createElement('span');
      span.textContent = categoryName;
      span.classList.add('bg-green-200', 'text-green-800', 'px-2', 'py-1', 'rounded', 'mr-2', 'mb-2', 'inline-block');
      userCourseCategoriesDisplay.appendChild(span);
    });
  }
}
// --------------------------------

feather.replace();

initApp()

document.querySelector('#logoutButton').addEventListener('click', () => {
  const confirmed = confirm('確定要登出嗎？');
  if (confirmed) {
    auth.logout();
    window.location.href = "/";
  }
});
