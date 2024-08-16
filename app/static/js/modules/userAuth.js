class UserAuth {
	constructor(baseUrl = '') {
		this.baseUrl = baseUrl;
		this.token = localStorage.getItem('token');
  }

	async checkAuth() {
		if (!this.token) {
			console.log('尚未登入');
			throw new Error('未驗證使用者');
		}

		try {
			const response = await fetch(`${this.baseUrl}/user/auth`, {
				method: 'GET',
				headers: { "Authorization": `Bearer ${this.token}`,},
			});

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

	async updateUser({ name, password } = {}, url) {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (password !== undefined) updateData.password = password;

    return this._sendUpdateRequest(updateData, url);
	}

	async updateUserCities(cities, url) {
    if (!Array.isArray(cities)) {
      throw new Error('格式錯誤(要是 Array)');
    }
    return this._sendUpdateRequest({ cities }, url);
  }

  async updateUserCourseCategories(courseCategories, url) {
    if (!Array.isArray(courseCategories)) {
      throw new Error('格式錯誤(要是 Array)');
    }
    return this._sendUpdateRequest({ course_categories: courseCategories }, url);
	}

	async _sendUpdateRequest(updateData, url) {
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(response.status);
    }

    return await response.json();
  }
}

export default UserAuth;
