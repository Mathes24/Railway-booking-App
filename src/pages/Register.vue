<template>
  <div class="page container" style="max-width: 400px; margin: auto;">
    <div class="card">
      <h2 style="text-align: center; margin-bottom: 2rem;">Create Account</h2>
      <form @submit.prevent="register">
        <div style="margin-bottom: 1rem;">
          <input type="text" v-model="name" class="input" placeholder="Full Name" required>
        </div>
        <div style="margin-bottom: 1rem;">
          <input type="email" v-model="email" class="input" placeholder="Email Address" required>
        </div>
        <div style="margin-bottom: 1.5rem; position: relative;">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" class="input" placeholder="Password" required style="padding-right: 4rem;">
          <span 
            @click="showPassword = !showPassword" 
            style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted); font-size: 0.85rem; user-select: none;"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </span>
        </div>
        <button type="submit" class="btn" style="width: 100%;">Register</button>
        <p v-if="error" style="color: var(--error); margin-top: 1rem; text-align: center;">{{ error }}</p>
      </form>
      <div style="margin-top: 1.5rem; text-align: center;">
        <span style="color: var(--text-muted)">Already have an account? </span>
        <router-link to="/login">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      error: '',
      showPassword: false
    }
  },
  methods: {
    async register() {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.name, email: this.email, password: this.password })
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
