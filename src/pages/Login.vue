<template>
  <div class="page container" style="max-width: 400px; margin: auto;">
    <div class="card">
      <h2 style="text-align: center; margin-bottom: 2rem;">Welcome Back</h2>
      <form @submit.prevent="login">
        <div style="margin-bottom: 1rem;">
          <input type="email" v-model="email" class="input" placeholder="Email Address" required>
        </div>
        <div style="margin-bottom: 1.5rem;">
          <input type="password" v-model="password" class="input" placeholder="Password" required>
        </div>
        <button type="submit" class="btn" style="width: 100%;">Login</button>
        <p v-if="error" style="color: var(--error); margin-top: 1rem; text-align: center;">{{ error }}</p>
      </form>
      <div style="margin-top: 1.5rem; text-align: center;">
        <span style="color: var(--text-muted)">Don't have an account? </span>
        <router-link to="/register">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login() {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('user-logged-in'));
          this.$router.push('/');
        } else {
          this.error = data.error;
        }
      } catch (e) {
        this.error = "Connection error";
      }
    }
  }
}
</script>
