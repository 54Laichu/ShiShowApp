class CoachAuth {
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
			const response = await fetch(`${this.baseUrl}/coach/auth`, {
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
		const response = await fetch(`${this.baseUrl}/coach/login`, {
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
			throw new Error(errorData.detail || '登入失敗');
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

	async fetchCoachCenter() {
		if (!this.token) {
			console.log('尚未登入');
			throw new Error('未驗證使用者');
		}

		try {
			const response = await fetch(`${this.baseUrl}/coach_center`, {
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
}

export default CoachAuth;
