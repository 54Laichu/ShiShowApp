export async function fetchCities() {
  try {
	  const response = await fetch('/api/v1/cities')
	  if (!response.ok) {
		  const errorData = await response.json();
		  throw new Error(errorData.detail);
	  }
	  return await response.json();
  } catch (error) {
	  throw error
  }
}

export async function fetchCourseCategories() {
  try {
	  const response = await fetch('/api/v1/course_categories')
	  if (!response.ok) {
		  const errorData = await response.json();
		  throw new Error(errorData.detail);
	  }
	  return await response.json();
  } catch (error) {
	  throw error
  }
}

export async function fetchCategoryCoach(categoryName) {
	try {
			const response = await fetch(`/api/v1/coaches?course_category_name=${encodeURIComponent(categoryName)}`, {
					method: "GET",
					headers: {
							'Content-Type': 'application/json',
					},
			});
			return await response.json();
	} catch (error) {
			throw error;
	}
}

