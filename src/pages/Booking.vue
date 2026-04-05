<template>
  <div class="page container" style="max-width: 1100px; margin: auto;">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading coach configuration...</p>
    </div>
    <div v-else-if="train" class="booking-layout">
      <!-- Left: Advanced Seat Map -->
      <div class="card seat-map-card">
        <div class="header-section">
          <h3>Coach Configuration</h3>
          <p class="subtitle">{{ train.seatsAvailable }} of {{ train.totalSeats }} seats available</p>
        </div>

        <!-- Filters -->
        <div class="filters">
          <button 
            v-for="filter in ['All', 'Window', 'Aisle']" 
            :key="filter"
            @click="seatFilter = filter"
            :class="['filter-btn', { active: seatFilter === filter }]"
          >
            {{ filter }}
          </button>
        </div>
        
        <div class="coach-scroll-container">
          <div class="coach-body grid-coach">
            <!-- Front of Train Indicator -->
            <div class="train-front">⬆ Front of Train ⬆</div>
            
            <div 
              v-for="(row, rowIndex) in rowData" 
              :key="'row'+rowIndex"
              class="seat-row"
            >
              <!-- Left Pair (Window, Aisle) -->
              <div class="seat-paired">
                <div v-for="s in row.slice(0, 2)" :key="s.str" 
                  @click="toggleSeat(s.str)"
                  :class="['seat-btn', s.type.toLowerCase(), { booked: train.bookedSeats.includes(s.str), selected: selectedSeats.includes(s.str), dimmed: !isSeatMatchedByFilter(s.type) }]"
                  :title="'Seat ' + s.str + ' (' + s.type + ')'"
                >
                  <span class="seat-number">{{ s.str }}</span>
                </div>
              </div>

              <!-- Center Walking Aisle -->
              <div class="walking-aisle">
                {{ rowIndex + 1 }}
              </div>

              <!-- Right Pair (Aisle, Window) -->
              <div class="seat-paired">
                <div v-for="s in row.slice(2, 4)" :key="s.str" 
                  @click="toggleSeat(s.str)"
                  :class="['seat-btn', s.type.toLowerCase(), { booked: train.bookedSeats.includes(s.str), selected: selectedSeats.includes(s.str), dimmed: !isSeatMatchedByFilter(s.type) }]"
                  :title="'Seat ' + s.str + ' (' + s.type + ')'"
                >
                  <span class="seat-number">{{ s.str }}</span>
                </div>
              </div>
            </div>
            
            <div class="train-back">⬇ Rear ⬇</div>
          </div>
        </div>
        
        <div class="legend">
          <div class="legend-item"><div class="seat-sample"></div> Available</div>
          <div class="legend-item"><div class="seat-sample selected"></div> Selected</div>
          <div class="legend-item"><div class="seat-sample booked"></div> Booked</div>
        </div>
      </div>

      <!-- Right: Passenger Details & Summary -->
      <div class="right-panel">
        <div class="card passenger-card">
          <h3>Passenger Manifest</h3>
          
          <div v-if="selectedSeats.length === 0" class="empty-state">
            <div class="empty-icon">💺</div>
            <p>Please select at least one seat from the map to begin.</p>
            <small>Max {{ maxSeats }} passengers per booking</small>
          </div>
          
          <form v-else @submit.prevent="bookTicket">
            <div class="passenger-list">
              <div v-for="(seat, index) in selectedSeats" :key="seat" class="passenger-item-card slide-up">
                <div class="card-header-mini">
                  <span class="seat-badge">Seat {{ seat }}</span>
                  <span class="berth-badge">{{ getBerthType(parseInt(seat)) }}</span>
                </div>
                <div class="form-grid">
                  <div class="input-wrapper">
                    <label>Full Name</label>
                    <input type="text" v-model="passengers[index].name" class="input slim-input" placeholder="e.g. John Doe" required>
                  </div>
                  <div class="input-row">
                    <div class="input-wrapper">
                      <label>Age</label>
                      <input type="number" v-model="passengers[index].age" class="input slim-input" placeholder="Age" required min="1" max="120">
                    </div>
                    <div class="input-wrapper">
                      <label>Gender</label>
                      <select v-model="passengers[index].gender" class="input slim-input" required>
                        <option value="" disabled selected>Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Payment Block -->
            <div class="payment-block">
              <h4>Payment Gateway</h4>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="paymentMethod" value="UPI">
                  <div class="radio-box">
                    <span class="icon">📱</span> UPI Transfer
                  </div>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="paymentMethod" value="Card">
                  <div class="radio-box">
                    <span class="icon">💳</span> Credit/Debit
                  </div>
                </label>
              </div>
              
              <div v-if="paymentMethod === 'UPI'" class="upi-input-wrapper slide-down">
                <input type="text" v-model="upiId" class="input" placeholder="Enter UPI ID (e.g. name@bank)" required>
              </div>
              <div v-else-if="paymentMethod === 'Card'" class="card-warning slide-down">
                Card gateway is currently undergoing maintenance. Please route via UPI.
              </div>
            </div>
            
            <!-- Sticky Summary Card -->
            <div class="sticky-summary">
              <div class="summary-row">
                <span>Passengers</span>
                <strong>x{{ selectedSeats.length }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total Amount</span>
                <span class="price">₹{{ totalPrice }}</span>
              </div>
              
              <button type="submit" class="btn btn-primary block-btn" :disabled="bookingLoading">
                <span v-if="bookingLoading" class="btn-spinner"></span>
                {{ bookingLoading ? 'Processing Request...' : 'Confirm & Pay' }}
              </button>
              <p v-if="error" class="error-text">{{ error }}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <h2>Route Not Found</h2>
      <p>The requested train configuration failed to load.</p>
      <router-link to="/" class="btn">Return Home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      train: null,
      loading: true,
      selectedSeats: [],
      passengers: [],
      paymentMethod: 'UPI',
      upiId: '',
      bookingLoading: false,
      error: '',
      maxSeats: 6,
      seatFilter: 'All', 
      pollInterval: null
    }
  },
  computed: {
    totalPrice() {
      return this.train ? this.train.price * this.selectedSeats.length : 0;
    },
    rowData() {
      if (!this.train) return [];
      const rows = [];
      const totalSeats = this.train.totalSeats;
      // 4 seats per row
      for (let i = 0; i < totalSeats; i += 4) {
        const row = [];
        for (let j = 1; j <= 4; j++) {
          const seatNum = i + j;
          if (seatNum <= totalSeats) {
            row.push({
              number: seatNum,
              type: this.getBerthType(seatNum),
              str: seatNum.toString()
            });
          }
        }
        rows.push(row);
      }
      return rows;
    }
  },
  async mounted() {
    const user = localStorage.getItem('user');
    if (!user) {
      this.$router.push('/login');
      return;
    }
    await this.fetchTrainDetails();
    if(this.train) {
      this.pollInterval = setInterval(this.fetchTrainDetailsSilent, 5000);
    }
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    async fetchTrainDetails() {
      const trainId = this.$route.params.id;
      try {
        const res = await fetch(`/api/trains/${trainId}`);
        const data = await res.json();
        if (data.success) {
          this.train = data.data;
        }
      } catch (e) {
        this.error = "Failed to load train details.";
      } finally {
        this.loading = false;
      }
    },
    async fetchTrainDetailsSilent() {
      const trainId = this.$route.params.id;
      try {
        const res = await fetch(`/api/trains/${trainId}`);
        const data = await res.json();
        if (data.success && this.train) {
          this.train.bookedSeats = data.data.bookedSeats;
          this.train.seatsAvailable = data.data.seatsAvailable;
        }
      } catch (e) {
        // silently ignore polling errors
      }
    },
    getBerthType(seatNumber) {
      const mode = seatNumber % 4;
      // 1: Window(Left), 2: Aisle(Left), 3: Aisle(Right), 0: Window(Right)
      return (mode === 1 || mode === 0) ? 'Window' : 'Aisle';
    },
    isSeatMatchedByFilter(type) {
      if(this.seatFilter === 'All') return true;
      return this.seatFilter === type;
    },
    toggleSeat(seatStr) {
      if (this.train.bookedSeats.includes(seatStr)) return;
      
      const index = this.selectedSeats.indexOf(seatStr);
      if (index === -1) {
        if(this.selectedSeats.length >= this.maxSeats) {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Limit Reached', message: `Maximum ${this.maxSeats} passengers allowed.` } }));
          return;
        }
        this.selectedSeats.push(seatStr);
        this.passengers.push({ name: '', age: null, gender: '' });
      } else {
        this.selectedSeats.splice(index, 1);
        this.passengers.splice(index, 1);
      }
    },
    async bookTicket() {
      if (this.paymentMethod === 'Card') {
        this.error = "Card payment is unavailable.";
        return;
      }
      if (this.paymentMethod === 'UPI') {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(this.upiId)) {
          this.error = "Please enter a valid UPI ID.";
          return;
        }
      }
      
      // Validate passengers
      for (const p of this.passengers) {
        if (!p.name || !p.age || !p.gender) {
           this.error = "Please fill completely all passenger details.";
           return;
        }
      }

      this.bookingLoading = true;
      this.error = '';
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTransactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
      const user = JSON.parse(localStorage.getItem('user'));
      
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            trainId: this.train.id,
            seatsBooked: this.selectedSeats.length,
            selectedSeats: this.selectedSeats,
            passengers: this.passengers,
            paymentMethod: this.paymentMethod,
            transactionId: mockTransactionId
          })
        });
        
        const data = await res.json();
        if (data.success) {
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', title: 'Booking Confirmed!', message: `Tickets secured successfully.` } }));
          this.$router.push('/my-tickets');
        } else {
          this.error = data.error;
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Booking Failed', message: data.error } }));
          this.fetchTrainDetailsSilent();
        }
      } catch (e) {
        this.error = "Transaction failed due to network error.";
      } finally {
        this.bookingLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.booking-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 900px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
}
.header-section {
  margin-bottom: 1.5rem;
}
.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--bg-color);
  padding: 0.4rem;
  border-radius: 30px;
  display: inline-flex;
}
.filter-btn {
  background: transparent;
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.filter-btn:hover {
  color: var(--primary);
}
.filter-btn.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.coach-scroll-container {
  overflow-y: auto;
  max-height: 600px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem 1rem;
  background: linear-gradient(to bottom, var(--surface) 0%, var(--bg-color) 100%);
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}
.coach-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.coach-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.3);
  border-radius: 10px;
}

.grid-coach {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 320px;
}
.train-front, .train-back {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 1rem 0;
  border-top: 1px dashed var(--border);
  border-bottom: 1px dashed var(--border);
  opacity: 0.7;
}

.seat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.seat-paired {
  display: flex;
  gap: 0.75rem;
}
.walking-aisle {
  flex: 1;
  display: flex;
  justify-content: center;
  color: rgba(14, 165, 233, 0.4);
  font-size: 0.8rem;
  font-weight: 600;
}

.seat-btn {
  width: 44px;
  height: 52px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 8px 8px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.seat-btn::before {
  content: '';
  position: absolute;
  top: -6px;
  width: 60%;
  height: 6px;
  background: var(--border);
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.seat-btn:hover:not(.booked) {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.seat-btn:hover:not(.booked)::before {
  background: var(--primary);
}

.seat-btn.window { border-left-width: 4px; }
.seat-paired:last-child .seat-btn.window { border-left-width: 2px; border-right-width: 4px; }

.seat-number {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  z-index: 1;
}

.seat-btn.selected {
  background: rgba(14, 165, 233, 0.1);
  border-color: var(--primary);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.2);
}
.seat-btn.selected::before {
  background: var(--primary);
  box-shadow: 0 -4px 10px rgba(14, 165, 233, 0.4);
}

.seat-btn.booked {
  background: var(--bg-color);
  border-color: rgba(255, 71, 87, 0.2);
  cursor: not-allowed;
  opacity: 0.4;
}
.seat-btn.booked::before {
  background: rgba(255, 71, 87, 0.2);
}
.seat-btn.dimmed {
  opacity: 0.15;
}

/* Legend */
.legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.seat-sample {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: var(--bg-color);
  border: 2px solid var(--border);
}
.seat-sample.selected {
  border-color: var(--primary);
  background: rgba(14, 165, 233, 0.2);
}
.seat-sample.booked {
  border-color: rgba(255, 71, 87, 0.3);
  background: rgba(255, 71, 87, 0.1);
}

/* Passenger Panel */
.right-panel {
  position: sticky;
  top: 100px;
}
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.passenger-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}
.passenger-item-card {
  background: var(--bg-color);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border-left: 4px solid var(--primary);
}
.card-header-mini {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: center;
}
.seat-badge {
  font-weight: 700;
  color: var(--text-main);
  font-size: 1.1rem;
}
.berth-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.input-wrapper label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.slim-input {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 6px;
  width: 100%;
}
.slim-input:focus {
  border-color: var(--primary);
  outline: none;
}

/* Payment Block */
.payment-block {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.payment-block h4 {
  margin-bottom: 1rem;
  color: var(--text-main);
}
.radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.radio-label {
  cursor: pointer;
}
.radio-label input {
  display: none;
}
.radio-box {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  background: var(--surface);
}
.radio-label input:checked + .radio-box {
  border-color: var(--primary);
  background: rgba(14, 165, 233, 0.05);
  box-shadow: 0 0 0 1px var(--primary);
}

/* Sticky Summary */
.sticky-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0.15) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(14, 165, 233, 0.2);
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
}
.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(14, 165, 233, 0.2);
  color: var(--text-main);
  font-size: 1.1rem;
  align-items: center;
}
.price {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}
.block-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}
.error-text {
  color: var(--error);
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 6px;
}

/* Animations */
.slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-down { animation: slideDown 0.3s ease-out; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-muted);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
