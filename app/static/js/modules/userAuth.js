class UserAuth {
	constructor(baseUrl = '') {
		this.baseUrl = baseUrl;
		this.token = localStorage.getItem('token');
  }
  // ------------------------------------------------------------

	async checkJWT(url) {
		if (!this.token) {
			throw new Error('No token found');
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      headers: { "Authorization": `Bearer ${this.token}`,},
    });

		if (response.status === 401) {
			this.logout();
			throw new Error('憑證無效');
		}
		return response;
  }

  // ------------------------------------------------------------
	async checkAuth() {
		if (!this.token) {
			console.log('尚未登入');
			throw new Error('未驗證使用者');
		}

		try {
			const response = await this.checkJWT('/user/auth');
			if (!response.ok) {
				throw new Error('使用者憑證無效');
      }
      const data = await response.json();
      return data;
		} catch (error) {
			this.logout();  // 如果驗證失敗，清除 token
			throw error;
		}
	}

	async fetchUserCenter() {
		if (!this.token) {
			console.log('尚未登入');
			throw new Error('未驗證使用者');
		}

		try {
			const response = await fetch(`${this.baseUrl}/user_center`, {
				method: 'GET',
				headers: { "Authorization": `Bearer ${this.token}`,},
			});
			if (!response.ok) {
				throw new Error('使用者憑證無效');
			}
			const data = await response.json();
			console.log(data)
			return data;
		} catch (error) {
			this.logout();  // 如果驗證失敗，清除 token
			throw error;
		}
  }

	async login(email, password) {
		const response = await fetch(`${this.baseUrl}/user/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				password: password,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || 'Login failed');
		}

		const data = await response.json();
		this.token = data.access_token;
		localStorage.setItem('token', this.token);
		return data;
	}

  logout() {
		this.token = null;
		localStorage.removeItem('token');
	}

	async updateUser({ name, password } = {}) {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (password !== undefined) updateData.password = password;

    return this._sendUpdateRequest(updateData);
	}

	async updateUserCities(cities) {
    if (!Array.isArray(cities)) {
      throw new Error('Cities must be an array');
    }
    return this._sendUpdateRequest({ cities });
  }

  async updateUserCourseCategories(courseCategories) {
    if (!Array.isArray(courseCategories)) {
      throw new Error('Course categories must be an array');
    }
    return this._sendUpdateRequest({ course_categories: courseCategories });
	}

	async _sendUpdateRequest(updateData) {
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default UserAuth;
