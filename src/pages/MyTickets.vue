<template>
  <div class="page container" style="max-width: 800px; margin: auto;">
    <h1 style="margin-bottom: 2rem;">My Tickets</h1>
    
    <div v-if="loading" style="text-align: center; color: var(--text-muted);">
      Loading your tickets...
    </div>
    
    <div v-else-if="tickets.length === 0" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
      <p style="margin-bottom: 1rem;">You haven't booked any tickets yet.</p>
      <router-link to="/" class="btn">Search Trains</router-link>
    </div>
    
    <div v-else class="ticket-list">
      <div v-for="ticket in tickets" :key="ticket.id" :class="['card', 'ticket-card', { 'cancelled': ticket.status === 'Cancelled' }]">
        <div class="ticket-header">
          <h3>Booking #{{ ticket.id.toString().padStart(5, '0') }}</h3>
          <span v-if="ticket.status === 'Cancelled'" class="badge cancelled-badge">Cancelled & Refunded</span>
          <span v-else class="badge">Confirmed</span>
        </div>
        
        <div class="ticket-body" v-if="ticket.trainDetails">
          <div class="route-details">
            <div class="station">
              <strong>{{ ticket.trainDetails.source }}</strong>
              <small>Departure</small>
            </div>
            <div class="train-icon">➔</div>
            <div class="station" style="text-align: right;">
              <strong>{{ ticket.trainDetails.destination }}</strong>
              <small>Arrival</small>
            </div>
          </div>
          
          <div class="trip-info">
            <div>
              <small>Date</small>
              <p>{{ ticket.trainDetails.date }}</p>
            </div>
            <div>
              <small>Time</small>
              <p>{{ ticket.trainDetails.time }}</p>
            </div>
            <div>
              <small>Train</small>
              <p>{{ ticket.trainDetails.name }}</p>
            </div>
          </div>
          
          <div v-if="ticket.passengers && ticket.passengers.length > 0" class="passengers-list">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary);">Passengers</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div v-for="p in ticket.passengers" :key="'p'+p.id" style="display: flex; justify-content: space-between; background: var(--surface-hover); padding: 0.5rem 1rem; border-radius: var(--radius-sm);">
                <span>{{ p.name }} (Age: {{ p.age }})</span>
                <strong>Seat {{ p.seatNumber }}</strong>
              </div>
            </div>
          </div>
          
          <div v-if="ticket.paymentMethod && ticket.paymentMethod !== 'None'" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border); padding-top: 1rem;">
            <div>
              <small style="color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Payment Method</small>
              <strong>{{ ticket.paymentMethod }}</strong>
            </div>
            <div style="text-align: right;" v-if="ticket.transactionId">
              <small style="color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Transaction ID</small>
              <span style="font-family: monospace; color: var(--text-muted);">{{ ticket.transactionId }}</span>
            </div>
          </div>
        </div>
        
        <div class="ticket-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; flex-direction: column;">
            <span style="color: var(--text-muted); font-size: 0.85rem;">Booked on: {{ new Date(ticket.bookingDate).toLocaleString() }}</span>
            <strong :style="{ color: 'var(--primary)', fontSize: '1.25rem', textDecoration: ticket.status === 'Cancelled' ? 'line-through' : 'none' }">₹{{ ticket.totalPrice }}</strong>
          </div>
          <div style="display: flex; gap: 0.5rem">
            <button v-if="ticket.status !== 'Cancelled'" @click="toggleMap(ticket.id)" class="btn btn-sm" style="background: rgba(16, 185, 129, 0.1); color: var(--success); border-color: rgba(16, 185, 129, 0.3);">Track Journey 📍</button>
            <button v-if="ticket.status !== 'Cancelled'" @click="cancelTicket(ticket.id)" class="btn btn-sm btn-destructive">Cancel Booking</button>
          </div>
        </div>

        <!-- Live Tracker Map Injection -->
        <div v-if="activeMap === ticket.id" style="padding: 0 1.5rem 1.5rem 1.5rem; background: var(--surface);">
           <h4 style="margin-top: 0; padding-top: 1rem; border-top: 1px dashed var(--border); color: #00f2fe; display: flex; align-items: center; gap: 0.5rem">
             🟢 Live GPS Tracking
           </h4>
            <RouteMap 
              :source="ticket.trainDetails.source" 
              :destination="ticket.trainDetails.destination" 
              :delay="liveData[ticket.trainId]?.delay || 0" 
              :message="liveData[ticket.trainId]?.message || 'Connecting...'"
            />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RouteMap from '../components/RouteMap.vue';

export default {
  components: { RouteMap },
  data() {
    return {
      tickets: [],
      loading: true,
      activeMap: null,
      pollInterval: null,
      liveData: {}
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.$router.push('/login');
      return;
    }
    this.fetchTickets();
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    toggleMap(ticketId) {
      if (this.activeMap === ticketId) {
        this.activeMap = null;
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      } else {
        this.activeMap = ticketId;
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
          this.fetchLiveStatus(ticket.trainId);
          if (this.pollInterval) clearInterval(this.pollInterval);
          this.pollInterval = setInterval(() => this.fetchLiveStatus(ticket.trainId), 5000);
        }
      }
    },
    async fetchLiveStatus(trainId) {
      try {
        const res = await fetch(`/api/trains/${trainId}`);
        const data = await res.json();
        if (data.success) {
          this.liveData[trainId] = data.data.liveStatus;
        }
      } catch (e) {
        console.error("Failed to poll live status");
      }
    },
    async fetchTickets() {
      this.loading = true;
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        const res = await fetch(`/api/tickets/${user.id}`);
        const data = await res.json();
        if (data.success) {
          this.tickets = data.data;
        }
      } catch (e) {
        console.error("Failed to load tickets");
      } finally {
        this.loading = false;
      }
    },
    async cancelTicket(ticketId) {
      if (!confirm("Are you sure you want to cancel this booking? This action is permanent and seats will be released.")) return;
      
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        const res = await fetch(`/api/tickets/${ticketId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        const data = await res.json();
        
        if (data.success) {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Ticket Cancelled & Refund Initiated!' } }));
          this.fetchTickets();
        } else {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: data.error } }));
        }
      } catch (e) {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: "Cancellation failed." } }));
      }
    }
  }
}
</script>

<style scoped>
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.ticket-card {
  padding: 0;
  overflow: hidden;
  transition: all 0.3s;
}
.ticket-card.cancelled {
  opacity: 0.6;
  filter: grayscale(80%);
}
.ticket-header {
  background: var(--surface);
  padding: 1rem 1.5rem;
  border-bottom: 1px dashed var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.badge {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.cancelled-badge {
  background: rgba(255, 71, 87, 0.1);
  color: var(--error);
}
.ticket-body {
  padding: 1.5rem;
}
.route-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem;
  border-radius: var(--radius-md);
}
.station strong {
  display: block;
  font-size: 1.25rem;
  font-family: 'Outfit', sans-serif;
}
.station small {
  color: var(--text-muted);
}
.train-icon {
  color: var(--primary);
  font-size: 1.5rem;
}
.trip-info {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.trip-info small {
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.25rem;
}
.trip-info p {
  font-weight: 500;
  margin: 0;
}
.passengers-list {
  background: rgba(15, 23, 42, 0.3);
  padding: 1rem;
  border-radius: var(--radius-md);
}
.ticket-footer {
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
}
.btn-destructive {
  background: rgba(255, 71, 87, 0.1);
  color: var(--error);
  border: 1px solid rgba(255, 71, 87, 0.3);
  transition: all 0.2s;
}
.btn-destructive:hover {
  background: rgba(255, 71, 87, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .route-details {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .station {
    text-align: center !important;
  }
  .train-icon {
    transform: rotate(90deg);
  }
}
</style>
