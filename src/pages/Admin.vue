<template>
  <div class="page container">
    <h1 style="margin-bottom: 2rem;">Admin Dashboard</h1>
    
    <div v-if="loading" style="text-align: center; color: var(--text-muted);">
      Loading platform stats...
    </div>
    
    <div v-else-if="stats" class="stats-grid">
      <div class="card stat-card">
        <h3>Total Revenue</h3>
        <p class="stat-value">₹{{ stats.revenue.toFixed(2) }}</p>
      </div>
      <div class="card stat-card">
        <h3>Tickets Booked</h3>
        <p class="stat-value">{{ stats.tickets }}</p>
      </div>
      <div class="card stat-card">
        <h3>Registered Users</h3>
        <p class="stat-value">{{ stats.users }}</p>
      </div>
    </div>
    
    <div v-if="stats" class="card" style="margin-top: 2rem;">
      <h3>Platform Administration</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        You can expand this panel in the future to add new trains, modify prices, or manage all customer bookings centrally through the database.
      </p>
      <div style="background: var(--surface-hover); padding: 1.5rem; border-radius: var(--radius-sm); border: 1px dashed var(--border);">
        <p style="text-align: center; font-family: 'Outfit', sans-serif;">More administrative features coming soon!</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: null,
      loading: true
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.$router.push('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      this.$router.push('/');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        this.stats = data.data;
      }
    } catch (e) {
      console.error("Failed to load admin stats");
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
}
.stat-card h3 {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.stat-value {
  font-size: 3rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}
</style>
