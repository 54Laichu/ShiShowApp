import UserAuth from './modules/userAuth.js';
import { fetchCategoryCoach, fetchCities } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');
const cities = await fetchCities();

const categoryName = document.querySelector("#categoryName").textContent;
const coaches = await fetchCategoryCoach(categoryName);
console.log(categoryName);
console.log(coaches);

function populateCoachesInfo(coaches) {
  const cityCoachDiv = document.querySelector("#cityCoach > div");
  cityCoachDiv.innerHTML = '';

  coaches.forEach(coach => {
      const coachElement = document.createElement('div');
      coachElement.className = 'coach-info';

      const nameElement = document.createElement('h2');
      nameElement.textContent = coach.name;
      coachElement.appendChild(nameElement);

      if (coach.bio) {
          const bioElement = document.createElement('p');
          bioElement.textContent = coach.bio;
          coachElement.appendChild(bioElement);
      }

      const accountElement = document.createElement('p');
      accountElement.textContent = `Account: ${coach.account}`;
      coachElement.appendChild(accountElement);

      if (coach.profile_photo) {
          const imgElement = document.createElement('img');
          imgElement.src = coach.profile_photo;
          imgElement.alt = `${coach.name}'s profile photo`;
          coachElement.appendChild(imgElement);
      }

      cityCoachDiv.appendChild(coachElement);
  });
}



async function initApp() {
	try {
    const userData = await auth.checkAuth();
    (userData.id) ? populateCoachesInfo(coaches) : (console.log("沒東西"))
  } catch (error) {
		console.error(error);
	}
}


initApp();
