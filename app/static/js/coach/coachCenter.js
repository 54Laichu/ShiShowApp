import CoachAuth from './modules/coachAuth.js';
import { fetchCities, fetchCourseCategories } from "../modules/fetchData.js";

const auth = new CoachAuth('/api/v1');

const coachCities = document.querySelector('#coachCities');
const coachCourseCategories = document.querySelector('#coachCourseCategories');
const coachGyms = document.querySelector('#coachGyms');
const profilePreview = document.querySelector('#profilePreview');

async function initApp() {
	try {
    const coachData = await auth.fetchCoachCenter();
    console.log(coachData);
    showCoach(coachData);
    showCoachCities(coachData.cities, coachCities);
    showCoachCourseCategories(coachData.course_categories, coachCourseCategories);
    showCoachGyms(coachData.gyms, coachGyms);
    editCoachForm();
    // editCertificateForm();
    editGymForm(coachData.cities);
    editCityForm();
    editCourseCategoryForm();
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
		cityElement.value = city.city_id;
		cityElement.textContent = city.city_name;
		container.appendChild(cityElement);
	});
}

function showCoachGyms(gymsArray, container) {
  gymsArray.forEach(gym => {
    const gymElement = document.createElement('span');
    gymElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
		gymElement.id = gym.id;
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

// Edit Form----------------------
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

// Edit City
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
      const currentUserCities = Array.from(coachCities.children).map(span => span.textContent);
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
    const url = "/coach_city";

    try {
      const updatedCoachData = await auth.updateCoachCities(selectedCities.map(city => city.name), url); // 先將 city.name 輸出成 array，在發送 PUT 到後端
      if (updatedCoachData) {
        coachCities.innerHTML = '';
        showCoachCities(updatedCoachData.cities, coachCities);
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
      const currentUserCourseCategories = Array.from(coachCourseCategories.children).map(span => span.textContent);
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
    const url = "/coach_course_category";

    try {
      const updatedCoachData = await auth.updateCoachCourseCategories(selectedCourseCategories.map(courseCategory => courseCategory.name), url); // 先將 courseCategory.name 輸出成 array，在發送 PUT 到後端
      if (updatedCoachData) {
        coachCourseCategories.innerHTML = '';
        showCoachCourseCategories(updatedCoachData.course_categories, coachCourseCategories);
        editCourseCategoriesModal.classList.add('hidden');
        alert('課程種類更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。');
    }
  });
}

async function editGymForm(cities) {
  console.log(cities);
  const editGymsButton = document.querySelector('#editGyms');
  const editGymsModal = document.querySelector('#editGymsModal');
  const gymCitiesSelect = document.querySelector('#gymCitiesSelect');
  const gymsSelect = document.querySelector('#gymsSelect');
  const selectedGymsList = document.querySelector('#selectedGymsList');
  const updateGymsButton = document.querySelector('#updateGymsButton');
  const cancelGymsButton = document.querySelector('#cancelGymsButton');

  let gyms = [];
  let selectedGyms = [];

  function getCurrentCoachGyms() {
    const gymElements = coachGyms.querySelectorAll('span');
    return Array.from(gymElements).map(element => ({
      id: element.id,
      name: element.textContent.split('｜')[0].trim(),
      address: element.textContent.split('｜')[1].replace('地址：', '').trim()
    }));
  }

  async function fetchGyms(cityId) {
    try {
      const response = await fetch(`${window.location.origin}/api/v1/gyms?city_id=${cityId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gyms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching gyms:', error);
      alert('系統異常，請稍後再試。');
      return [];
    }
  }

  function updateSelectedGymsList() {
    selectedGymsList.innerHTML = '';
    selectedGyms.forEach(gym => {
      const span = document.createElement('span');
      span.textContent = `${gym.name} | ${gym.address}`;
      span.classList.add('bg-gray-200', 'px-2', 'py-1', 'rounded', 'inline-block', 'mr-2', 'mb-2');

      const removeButton = document.createElement('button');
      removeButton.textContent = '×';
      removeButton.classList.add('ml-2', 'text-red-500', 'font-bold');
      removeButton.onclick = function() {
        selectedGyms = selectedGyms.filter(g => g.id !== gym.id);
        updateSelectedGymsList();
      };

      span.appendChild(removeButton);
      selectedGymsList.appendChild(span);
    });
  }

  editGymsButton.addEventListener('click', () => {
    editGymsModal.classList.remove('hidden');
    selectedGyms = getCurrentCoachGyms();
    updateSelectedGymsList();
    populateCitiesSelect();
  });

  function populateCitiesSelect() {
    gymCitiesSelect.innerHTML = '<option value="">選擇城市</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.city_id.toString();
      option.textContent = city.city_name;
      gymCitiesSelect.appendChild(option);
    });
  }

  gymCitiesSelect.addEventListener('change', async function() {
    const selectedCityId = this.value;
    if (selectedCityId) {
      gyms = await fetchGyms(selectedCityId);
      populateGymsSelect();
    } else {
      gymsSelect.innerHTML = '<option value="">選擇場館</option>';
    }
  });

  function populateGymsSelect() {
    gymsSelect.innerHTML = '<option value="">選擇場館</option>';
    gyms.forEach(gym => {
      const option = document.createElement('option');
      option.value = gym.id.toString();
      option.textContent = `${gym.name} ｜ 地址：${gym.address}`;
      gymsSelect.appendChild(option);
    });
  }

  gymsSelect.addEventListener('change', function() {
    const selectedGymId = this.value;
    const selectedGym = gyms.find(gym => gym.id.toString() === selectedGymId);
    if (selectedGym && !selectedGyms.some(gym => gym.id === selectedGym.id)) {
      selectedGyms.push(selectedGym);
      updateSelectedGymsList();
    }
    this.value = '';
  });

  editGymsModal.addEventListener('click', (event) => {
    if (event.target === editGymsModal) {
      editGymsModal.classList.add('hidden');
    }
  });

  cancelGymsButton.addEventListener('click', () => {
    editGymsModal.classList.add('hidden');
  });

  updateGymsButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const url = "/coach_gym";

    try {
      const updatedCoachData = await auth.updateCoachGyms(selectedGyms.map(gym => gym.id), url);
      if (updatedCoachData) {
        updateCoachGymsList(updatedCoachData.gyms);
        editGymsModal.classList.add('hidden');
        console.log(updatedCoachData);
        alert('場館更新成功！');
      }
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新失敗。');
    }
  });

  function updateCoachGymsList(gymsArray) {
    coachGyms.innerHTML = '';
    gymsArray.forEach(gym => {
      const gymElement = document.createElement('span');
      gymElement.classList.add('bg-green-100', 'text-green-800', 'px-3', 'py-1', 'rounded-full', 'text-sm');
      gymElement.id = gym.id;
      gymElement.textContent = `${gym.name} ｜地址： ${gym.address}`;
      coachGyms.appendChild(gymElement);
    });
  }
}

initApp();
