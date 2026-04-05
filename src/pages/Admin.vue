<template>
  <div class="page container" style="max-width: 1000px; margin: auto;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
      <h1 style="margin: 0;">Admin Control Center</h1>
      <div class="tabs">
        <button v-for="tab in ['stats', 'trains', 'bookings']" :key="tab" @click="activeTab = tab" :class="['tab-btn', { active: activeTab === tab }]">
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" style="text-align: center; color: var(--text-muted); padding: 4rem;">
      <div class="loader"></div>
      <p style="margin-top: 1rem;">Synchronizing Database...</p>
    </div>
    
    <div v-else>
      <!-- Dashboard Stats -->
      <div v-if="activeTab === 'stats' && stats" class="stats-grid">
        <div class="card stat-card">
          <h3>Total Revenue</h3>
          <p class="stat-value">₹{{ stats.revenue.toFixed(2) }}</p>
          <small style="color: var(--success);">+12% vs last month</small>
        </div>
        <div class="card stat-card">
          <h3>Total Tickets</h3>
          <p class="stat-value">{{ stats.tickets }}</p>
          <small style="color: var(--primary);">Platform Active</small>
        </div>
        <div class="card stat-card">
          <h3>Total Trains</h3>
          <p class="stat-value">{{ stats.trains }}</p>
          <small style="color: var(--text-muted);">Operation Active</small>
        </div>
        <div class="card stat-card">
          <h3>Platform Users</h3>
          <p class="stat-value">{{ stats.users }}</p>
          <small style="color: var(--secondary);">Community Grow</small>
        </div>
      </div>

      <!-- Train Management -->
      <div v-if="activeTab === 'trains'" class="admin-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3>Fleet Management</h3>
          <button @click="showAddForm = !showAddForm" class="btn btn-sm">
            {{ showAddForm ? 'Cancel' : '+ Add New Train' }}
          </button>
        </div>

        <div v-if="showAddForm" class="card" style="margin-bottom: 2rem; background: rgba(0, 242, 254, 0.05); border: 1px solid var(--primary);">
          <h4>Add New Fleet Unit</h4>
          <form @submit.prevent="addTrain" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div class="input-group">
              <label>Train Name</label>
              <input type="text" v-model="newTrain.name" class="input" required placeholder="e.g. Vande Bharat">
            </div>
            <div class="input-group">
              <label>Source</label>
              <input type="text" v-model="newTrain.source" class="input" required placeholder="Origin City">
            </div>
            <div class="input-group">
              <label>Destination</label>
              <input type="text" v-model="newTrain.destination" class="input" required placeholder="Target City">
            </div>
            <div class="input-group">
              <label>Date</label>
              <input type="date" v-model="newTrain.date" class="input" required>
            </div>
            <div class="input-group">
              <label>Time</label>
              <input type="text" v-model="newTrain.time" class="input" required placeholder="08:00 AM">
            </div>
            <div class="input-group">
              <label>Base Price (₹)</label>
              <input type="number" v-model="newTrain.price" class="input" required>
            </div>
            <button type="submit" class="btn" style="grid-column: 1 / -1;">Register Train</button>
          </form>
        </div>

        <div class="card" style="padding: 0; overflow-x: auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Route</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="train in trains" :key="train.id">
                <td>#{{ train.id }}</td>
                <td><strong>{{ train.name }}</strong></td>
                <td>{{ train.source }} ➔ {{ train.destination }}</td>
                <td>{{ train.date }} | {{ train.time }}</td>
                <td>
                  <span :class="['status-badge', train.liveStatus.delay > 0 ? 'delayed' : 'ontime']">
                    {{ train.liveStatus.message }}
                  </span>
                </td>
                <td>₹{{ train.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Booking Management -->
      <div v-if="activeTab === 'bookings'" class="admin-section">
        <h3>System Booking Logs</h3>
        <div class="card" style="padding: 0; overflow-x: auto; margin-top: 1.5rem;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Train</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in bookings" :key="booking.id">
                <td>#{{ booking.id.toString().padStart(5, '0') }}</td>
                <td>
                  <strong>{{ booking.userName }}</strong><br>
                  <small style="color: var(--text-muted)">{{ booking.userEmail }}</small>
                </td>
                <td>{{ booking.trainName }}</td>
                <td>{{ new Date(booking.bookingDate).toLocaleDateString() }}</td>
                <td>₹{{ booking.totalPrice }}</td>
                <td>
                  <span :class="['badge', booking.status === 'Cancelled' ? 'cancelled-badge' : 'confirmed-badge']">
                    {{ booking.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'stats',
      stats: null,
      trains: [],
      bookings: [],
      loading: true,
      showAddForm: false,
      newTrain: {
        name: '',
        source: '',
        destination: '',
        date: '',
        time: '',
        price: 1500
      }
    }
  },
  watch: {
    activeTab(newTab) {
      this.refreshData();
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
      this.$router.push('/');
      return;
    }
    this.refreshData();
  },
  methods: {
    async refreshData() {
      this.loading = true;
      try {
        if (this.activeTab === 'stats') {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          if (data.success) this.stats = data.data;
        } else if (this.activeTab === 'trains') {
          const res = await fetch('/api/admin/trains');
          const data = await res.json();
          if (data.success) this.trains = data.data;
        } else if (this.activeTab === 'bookings') {
          const res = await fetch('/api/admin/bookings');
          const data = await res.json();
          if (data.success) this.bookings = data.data;
        }
      } catch (e) {
        console.error("Sync error");
      } finally {
        this.loading = false;
      }
    },
    async addTrain() {
      try {
        const res = await fetch('/api/admin/trains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newTrain)
        });
        const data = await res.json();
        if (data.success) {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Train Registered in Database!' } }));
          this.showAddForm = false;
          this.refreshData();
        }
      } catch (e) {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Registration failed.' } }));
      }
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--surface);
  padding: 0.3rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--primary);
  color: #0b0e14;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  padding: 2rem 1.5rem;
  border: 1px solid var(--border);
}
.stat-card h3 {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 2.5rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}
.admin-table th {
  text-align: left;
  background: var(--surface-hover);
  padding: 1rem 1.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.admin-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.95rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.status-badge.ontime { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.status-badge.delayed { background: rgba(255, 71, 87, 0.1); color: var(--error); }

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
}
.confirmed-badge { background: rgba(16, 185, 129, 0.1); color: var(--success); }
.cancelled-badge { background: rgba(255, 71, 87, 0.1); color: var(--error); }

.loader {
  border: 4px solid var(--surface-hover);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
