<template>
  <div v-if="isOffline" class="offline-banner">
    ⚠️ You are currently offline. Viewing cached data.
  </div>
  <Navbar />
  <router-view></router-view>
  <Toast />
</template>

<script>
import Navbar from './components/Navbar.vue';
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Toast
  },
  data() {
    return {
      isOffline: !navigator.onLine
    }
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOffline = !navigator.onLine;
    }
  }
}
</script>

<style>
.offline-banner {
  background-color: #ff4757;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 1000;
  position: sticky;
  top: 0;
  width: 100%;
}
</style>
