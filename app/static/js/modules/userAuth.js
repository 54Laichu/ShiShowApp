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
    console.log(this.token);

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
      console.log(data);
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

  async updateUser(userData) {
		const response = await this.checkJWT('/user/me', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || 'Update failed');
		}

		return await response.json();
	}

}

export default UserAuth;
