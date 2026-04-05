<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <div class="toast-icon">
          <span v-if="t.type === 'success'">✅</span>
          <span v-if="t.type === 'error'">🚨</span>
          <span v-if="t.type === 'info'">ℹ️</span>
        </div>
        <div class="toast-content">
          <h4>{{ t.title }}</h4>
          <p>{{ t.message }}</p>
        </div>
        <button class="toast-close" @click="remove(t.id)">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toasts: [],
      nextId: 1
    }
  },
  mounted() {
    window.addEventListener('toast', this.handleToast);
  },
  beforeUnmount() {
    window.removeEventListener('toast', this.handleToast);
  },
  methods: {
    handleToast(e) {
      const { title, message, type = 'info', duration = 5000 } = e.detail;
      const id = this.nextId++;
      this.toasts.push({ id, title, message, type });
      setTimeout(() => this.remove(id), duration);
    },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.toast {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  min-width: 300px;
  max-width: 350px;
  box-shadow: var(--shadow-lg), 0 0 15px rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--text-main);
  position: relative;
  overflow: hidden;
}
.toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}
.toast.success::before { background: var(--success); box-shadow: 0 0 10px var(--success); }
.toast.error::before { background: var(--error); box-shadow: 0 0 10px var(--error); }
.toast.info::before { background: var(--primary); box-shadow: 0 0 10px var(--primary); }

.toast-icon { font-size: 1.25rem; margin-top: 2px; }
.toast-content { flex: 1; }
.toast-content h4 { margin-top: 0; margin-bottom: 0.25rem; font-size: 1.05rem; }
.toast-content p { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; }
.toast-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  line-height: 1;
}
.toast-close:hover { color: var(--text-main); }

/* Transitions */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from { opacity: 0; transform: translateX(50px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateY(-20px) scale(0.95); }
</style>
