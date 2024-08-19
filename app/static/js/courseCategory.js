import UserAuth from './modules/userAuth.js';
import { fetchCities } from "./modules/fetchData.js";

const auth = new UserAuth('/api/v1');
const cities = await fetchCities();


async function initApp() {
	try {
    const userData = await auth.checkAuth();
    (userData.id) ? (console.log(userData)) : (console.log("沒東西"))
  } catch (error) {
		console.error(error);
	}
}

console.log(cities);
initApp();
