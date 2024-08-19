import { fetchCities, fetchCourseCategories } from "../modules/fetchData.js";

function validateForm(formData) {
	const password = formData.get('password');
	const confirmPassword = formData.get('confirmPassword');

	if (password !== confirmPassword) {
		throw new Error('密碼輸入不一致');
	}
	return true;
}

document.addEventListener('DOMContentLoaded', async function () {
	const cities = await fetchCities();
	const courseCategories = await fetchCourseCategories();

	const citiesSelect = document.querySelector('#citiesSelect');
	const selectedCitiesList = document.querySelector('#selectedCitiesList');
	const selectedCitiesInput = document.querySelector('#selectedCitiesInput');

	let selectedCities = [];

	// 把 fetch 到的 city array 塞入
	cities.forEach(city => {
		const option = document.createElement('option');
		option.value = city.name;
		option.textContent = city.name;
		citiesSelect.appendChild(option);
	});

	// 點選城市
	citiesSelect.addEventListener('change', function() {
		const selectedId = this.value;
		const selectedName = this.options[this.selectedIndex].text;

		if (selectedId && !selectedCities.some(city => city.id === selectedId)) {
			selectedCities.push({ id: selectedId, name: selectedName });
			updateSelectedCitiesList();
			this.value = "";
			// 如果選到重複的縣市，就重置點選
		}
	});

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
			};

			span.appendChild(removeButton);
			selectedCitiesList.appendChild(span);
		});

		// 選中的縣市
		selectedCitiesInput.value = JSON.stringify(selectedCities.map(city => city.name));
	}

	// CourseCategory
	const interestsContainer = document.querySelector('#interestsContainer');
	courseCategories.forEach(category => {
		const label = document.createElement('label');
		label.classList.add('flex', 'items-center');

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.name = 'course_categories';
		checkbox.value = category.name;
		checkbox.classList.add('h-4', 'w-4', 'text-orange-600', 'focus:ring-orange-500', 'border-gray-300', 'rounded');

		const text = document.createElement('span');
		text.classList.add('ml-2', 'text-sm', 'text-gray-900');
		text.textContent = category.name;

		label.appendChild(checkbox);
		label.appendChild(text);
		interestsContainer.appendChild(label);
	});

	// POST Request
	document.querySelector('#registerForm').addEventListener('submit', async function (event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const data = {
			name: formData.get('name'),
			phone: formData.get('phone'),
			account: formData.get('account'),
			email: formData.get('email'),
			password: formData.get('password'),
			cities: JSON.parse(selectedCitiesInput?.value || '[]'),
			course_categories: Array.from(formData.getAll('course_categories'))
		};

		try {
			validateForm(formData);

			const response = await fetch('/api/v1/coach', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				const responseData = await response.json();
				const token = responseData.access_token;
				localStorage.setItem('token', token);
				alert('註冊成功！')
				window.location.href = '/coach';
			} else {
				let errorMessage = "信箱已註冊";
				try {
					const errorData = await response.json();
					errorMessage = errorData.detail || errorMessage;
				} catch (e) {
					console.error("Failed to parse error response:", e);
				}
				alert(errorMessage);
			}
		} catch (error) {
			alert(error.message);
		}
	});
});

