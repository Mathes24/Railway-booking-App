<template>
  <div class="page container">
    <div class="hero">
      <h1 class="gradient-text" style="font-size: 3.5rem; margin-bottom: 1rem; letter-spacing: -2px;">{{ $t('search.heroTitle') }}</h1>
      <p style="font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2rem;">{{ $t('search.heroSubtitle') }}</p>
    </div>

    <div class="card search-box">
      <form @submit.prevent="search" class="search-form">
        <div class="input-group">
          <label>{{ $t('search.from') }}</label>
          <input type="text" v-model="source" class="input" :placeholder="$t('search.fromPlaceholder')">
        </div>
        <div class="input-group">
          <label>{{ $t('search.to') }}</label>
          <input type="text" v-model="destination" class="input" :placeholder="$t('search.toPlaceholder')">
        </div>
        <div class="input-group">
          <label>{{ $t('search.date') }}</label>
          <input type="date" v-model="date" class="input">
        </div>
        <button type="submit" class="btn" style="height: 100%; align-self: flex-end;" :disabled="loading">
          {{ loading ? $t('search.searchingBtn') : $t('search.searchBtn') }}
        </button>
      </form>
    </div>

    <!-- Recommendations -->
    <div class="results" v-if="recommendations.length > 0 && !source && !destination && !date" style="margin-bottom: 3rem;">
      <h3 style="margin: 2rem 0 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.5rem;">✨</span> {{ $t('search.recommendedTitle') }}
      </h3>
      <div class="train-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        <div v-for="train in recommendations" :key="'rec'+train.id" class="card train-card glowing-ai-card">
          <div class="train-info" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
              <span class="ai-badge">AI Pick</span>
              <div class="price" style="font-size: 1.1rem; margin: 0;">₹{{ train.price }}</div>
            </div>
            
            <h4 style="margin: 0.5rem 0 0.25rem;">{{ train.name }}</h4>
            
            <div class="route" style="font-size: 0.95rem; margin: 0.25rem 0;">
              <span>{{ train.source }}</span> <span class="arrow">→</span> <span>{{ train.destination }}</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 1rem;">
              <div v-for="(reason, i) in train.aiReasons" :key="i" class="ai-reason" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                <span style="color: var(--primary);">✦</span> {{ reason }}
              </div>
            </div>

            <div style="margin-top: 1.5rem;">
              <router-link :to="'/booking/' + train.id" class="btn btn-sm" style="width: 100%;">{{ $t('search.bookAiPick') }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="card filter-bar" v-if="trains.length > 0" style="margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; padding: 1.5rem;">
      <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">{{ $t('search.filters.maxPrice') }}: ₹{{ filters.maxPrice }}</label>
        <input type="range" min="500" max="4000" step="100" v-model="filters.maxPrice" style="width: 100%; accent-color: var(--primary);">
      </div>
      <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">{{ $t('search.filters.maxDuration') }}: {{ filters.maxDuration }}h</label>
        <input type="range" min="4" max="30" step="1" v-model="filters.maxDuration" style="width: 100%; accent-color: var(--primary);">
      </div>
      <div style="flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 0.3rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">{{ $t('search.filters.departure') }}</label>
        <select v-model="filters.timePart" class="input" style="padding: 0.4rem; font-size: 0.9rem;">
          <option value="All">{{ $t('search.filters.all') }}</option>
          <option value="Morning (AM)">{{ $t('search.filters.morning') }}</option>
          <option value="Evening (PM)">{{ $t('search.filters.evening') }}</option>
        </select>
      </div>
      <div style="flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 0.3rem;">
        <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">{{ $t('search.filters.trainClass') }}</label>
        <select v-model="filters.trainType" class="input" style="padding: 0.4rem; font-size: 0.9rem;">
          <option value="All">{{ $t('search.filters.all') }}</option>
          <option value="Superfast">{{ $t('search.filters.superfast') }}</option>
          <option value="Express">{{ $t('search.filters.express') }}</option>
        </select>
      </div>
    </div>

    <div class="results" v-if="trains.length > 0">
      <h3 style="margin: 0 0 1rem;">{{ $t('search.availableTrains') }} ({{ filteredTrains.length }})</h3>
      <div class="train-list" v-if="filteredTrains.length > 0">
        <div v-for="train in filteredTrains" :key="train.id" class="card train-card">
          <div class="train-info">
            <h4 style="display: flex; align-items: center; gap: 0.75rem;">
              {{ train.name }}
              <span class="ai-tag" style="padding: 0.1rem 0.6rem; font-size: 0.7rem;">{{ train.type }}</span>
              <span :class="['status-badge', train.liveStatus?.delay > 0 ? 'delayed' : 'ontime']">
                {{ train.liveStatus?.delay > 0 ? '🔴' : '🟢' }} {{ train.liveStatus?.message || 'On Time' }}
              </span>
            </h4>
            <div class="route">
              <span>{{ train.source }}</span>
              <span class="arrow">→</span>
              <span>{{ train.destination }}</span>
            </div>
            <div class="details">
              <span>📅 {{ train.date }} | 🕒 {{ train.time }} | ⏱️ ~{{ train.durationHours }}h</span>
            </div>
          </div>
          <div class="train-actions">
            <div class="price">₹{{ train.price }}</div>
            <div :style="{ color: train.seatsAvailable > 0 ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem', marginBottom: '0.5rem' }">
              {{ train.seatsAvailable }} {{ $t('search.seatsAvailable') }}
            </div>
            <router-link v-if="train.seatsAvailable > 0" :to="'/booking/' + train.id" class="btn btn-sm">{{ $t('search.bookNow') }}</router-link>
            <button v-else class="btn btn-secondary btn-sm" disabled>{{ $t('search.soldOut') }}</button>
          </div>
        </div>
      </div>
      <div v-else style="text-align: center; margin-top: 2rem; color: var(--text-muted)">
        {{ $t('search.noFilters') }}
      </div>
    </div>
    <div v-else-if="searched && trains.length === 0" style="text-align: center; margin-top: 3rem; color: var(--text-muted)">
      {{ $t('search.noTrains') }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      source: '',
      destination: '',
      date: '',
      trains: [],
      loading: false,
      searched: false,
      pollInterval: null,
      recommendations: [],
      filters: {
        maxPrice: 3000,
        timePart: 'All',
        trainType: 'All',
        maxDuration: 24
      }
    }
  },
  computed: {
    filteredTrains() {
      return this.trains.filter(t => {
        if (t.price > this.filters.maxPrice) return false;
        if (this.filters.timePart !== 'All' && t.time) {
          if (this.filters.timePart === 'Morning (AM)' && !t.time.toLowerCase().includes('am')) return false;
          if (this.filters.timePart === 'Evening (PM)' && !t.time.toLowerCase().includes('pm')) return false;
        }
        if (this.filters.trainType !== 'All' && t.type !== this.filters.trainType) return false;
        if (t.durationHours > this.filters.maxDuration) return false;
        return true;
      });
    }
  },
  methods: {
    async search() {
      this.loading = true;
      this.searched = true;
      try {
        const query = new URLSearchParams({
          source: this.source,
          destination: this.destination,
          date: this.date
        }).toString();
        
        const res = await fetch('/api/trains/search?' + query);
        const data = await res.json();
        if (data.success) {
          this.trains = data.data.map(t => {
            t.durationHours = Math.max(4, Math.floor(t.price / 150));
            t.type = /rajdhani|shatabdi|duronto|vande|tejas|sampark/i.test(t.name) ? 'Superfast' : 'Express';
            return t;
          });
        }
      } catch (e) {
        console.error("Search failed");
      } finally {
        this.loading = false;
      }
    },
    async searchSilent() {
      if (!this.searched) return;
      try {
        const query = new URLSearchParams({
          source: this.source,
          destination: this.destination,
          date: this.date
        }).toString();
        
        const res = await fetch('/api/trains/search?' + query);
        const data = await res.json();
        if (data.success) {
          this.trains = data.data.map(t => {
            t.durationHours = Math.max(4, Math.floor(t.price / 150));
            t.type = /rajdhani|shatabdi|duronto|vande|tejas|sampark/i.test(t.name) ? 'Superfast' : 'Express';
            return t;
          });
        }
      } catch (e) {
        // silently ignore error on autoupdate
      }
    },
    async fetchRecommendations(userId) {
      try {
        const res = await fetch(`/api/trains/recommendations/${userId}`);
        const data = await res.json();
        if (data.success) {
          this.recommendations = data.data;
        }
      } catch (e) {
        console.error("Failed to load recommendations");
      }
    }
  },
  mounted() {
    this.search(); // initial fetch
    
    // Load AI recommendations if user logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.fetchRecommendations(user.id);
    }

    this.pollInterval = setInterval(this.searchSilent, 5000);
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 0 4rem;
}
.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  text-shadow: 0 4px 14px rgba(0, 242, 254, 0.2);
}
.search-form {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.input-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
}
.train-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.train-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  transition: transform 0.2s;
}
.train-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}
.route {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0.5rem 0;
}
.status-badge {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
}
.status-badge.ontime {
  color: var(--success);
  border-color: rgba(46, 213, 115, 0.3);
  box-shadow: 0 0 10px rgba(46, 213, 115, 0.1);
}
.status-badge.delayed {
  color: var(--error);
  border-color: rgba(255, 71, 87, 0.3);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.1);
}
.arrow {
  color: var(--primary);
  margin: 0 0.5rem;
}
.details {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.train-actions {
  text-align: right;
  min-width: 150px;
}
.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.2rem;
}
.glowing-ai-card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid rgba(0, 242, 254, 0.3);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  transition: all 0.3s ease;
  flex-direction: column;
}
.glowing-ai-card:hover {
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.2);
  border-color: rgba(0, 242, 254, 0.6);
  transform: translateY(-5px);
}
.ai-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  border-radius: 20px;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

@media (max-width: 768px) {
  .train-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.25rem;
  }
  
  .train-actions {
    text-align: left;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-form .btn {
    width: 100%;
    margin-top: 1rem;
  }
}
</style>
