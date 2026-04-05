<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script>
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCoordinates } from '../utils/coordinates';

export default {
  name: 'RouteMap',
  props: {
    source: { type: String, required: true },
    destination: { type: String, required: true },
    delay: { type: Number, default: 0 }
  },
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    initMap() {
      const L = window.L;
      if (!L) {
         console.error("Leaflet failed to load onto the window.");
         return;
      }
      
      const srcCoord = getCoordinates(this.source);
      const destCoord = getCoordinates(this.destination);

      this.map = L.map(this.$refs.mapContainer, {
        zoomControl: false,
        attributionControl: false
      });

      // Dark theme tiles for premium aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(this.map);

      // Core Anchor Locations
      const dotIconSrc = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color: var(--primary); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);'></div>",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const dotIconDest = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color: var(--primary); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);'></div>",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker(srcCoord, { icon: dotIconSrc }).addTo(this.map).bindPopup(`Origin: ${this.source}`);
      L.marker(destCoord, { icon: dotIconDest }).addTo(this.map).bindPopup(`Destination: ${this.destination}`);

      // Primary Traversal Route
      const latlngs = [srcCoord, destCoord];
      const polyline = L.polyline(latlngs, {
        color: '#00f2fe',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 12'
      }).addTo(this.map);

      this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Simulated Intelligent Trajectory: Extrapolates distance based on 'delay' values
      const progress = this.delay > 10 ? 0.35 : 0.78; 
      const currentLat = srcCoord[0] + (destCoord[0] - srcCoord[0]) * progress;
      const currentLng = srcCoord[1] + (destCoord[1] - srcCoord[1]) * progress;

      const trainIcon = L.divIcon({
        className: 'train-icon-sim',
        html: "<div class='pulse-dot' style='background-color: #ff4757; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 20px rgba(255, 71, 87, 0.8); display: flex; align-items: center; justify-content: center;'><span style='font-size: 11px'>🚆</span></div>",
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([currentLat, currentLng], { icon: trainIcon }).addTo(this.map).bindPopup("<strong>Tracked Position</strong><br>GPS Simulation active.").openPopup();
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5);
  margin-top: 1.5rem;
  background: var(--surface);
}
:deep(.pulse-dot) {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(255, 71, 87, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
}
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  font-family: inherit;
  backdrop-filter: blur(10px);
}
:deep(.leaflet-popup-content) {
  margin: 10px 14px;
}
:deep(.leaflet-popup-tip) {
  background: rgba(15, 23, 42, 0.95);
}
</style>
