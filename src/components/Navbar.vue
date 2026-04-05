<template>
  <nav class="navbar">
    <div class="container nav-content">
      <router-link to="/" class="logo">
        <img src="/logo.png" alt="Railway Logo" class="navbar-logo" />
      </router-link>

      <!-- Mobile Menu Toggle Button -->
      <button class="mobile-toggle" @click="isOpen = !isOpen" aria-label="Toggle Menu">
        <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div class="nav-links" :class="{ 'nav-active': isOpen }" @click="closeMenu">
        <select v-model="$i18n.locale" class="lang-picker" @click.stop>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="ml">മലയാളം</option>
          <option value="te">తెలుగు</option>
        </select>
        <router-link to="/">{{ $t('nav.home') }}</router-link>
        <template v-if="user">
          <router-link v-if="user.role === 'admin'" to="/admin" style="color: var(--primary);">{{ $t('nav.admin') }}</router-link>
          <router-link to="/my-tickets">{{ $t('nav.myTickets') }}</router-link>
          <button @click.stop="logout" class="btn btn-secondary btn-sm">{{ $t('nav.logout') }}</button>
        </template>
        <template v-else>
          <router-link to="/login">{{ $t('nav.login') }}</router-link>
          <router-link to="/register" class="btn btn-sm">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      user: null,
      isOpen: false
    }
  },
  mounted() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    // simple event listener to update user state
    window.addEventListener('user-logged-in', () => {
      this.user = JSON.parse(localStorage.getItem('user'));
    });
  },
  methods: {
    logout() {
      localStorage.removeItem('user');
      this.user = null;
      this.isOpen = false;
      this.$router.push('/login');
    },
    closeMenu(e) {
      if(e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
        this.isOpen = false;
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
}
.navbar-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  z-index: 101;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a {
  color: var(--text-main);
  font-weight: 500;
}
.nav-links a:hover {
  color: var(--primary);
}
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
.lang-picker {
  background: var(--surface);
  color: var(--text-main);
  border: 1px solid var(--border);
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }
  
  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 250px;
    background: var(--bg-color);
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem;
    box-shadow: -5px 0 15px rgba(0,0,0,0.5);
    transition: right 0.3s ease;
    z-index: 100;
    border-left: 1px solid var(--border);
  }
  
  .nav-links.nav-active {
    right: 0;
  }
  
  .nav-links a, .nav-links button, .lang-picker {
    width: 100%;
    text-align: left;
    margin: 0.5rem 0;
  }
}
</style>
