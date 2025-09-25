import axios from 'axios';
import { store } from '../store/store';
import { setConnectivityStatus } from '../store/store';

const BASE_URL = process.env.NODE_ENV === "production" ? "/api/" : "http://localhost:3030/api/";

class ConnectivityService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    // Check immediately
    this.checkConnectivity();
    
    // Then check every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async checkConnectivity() {
    try {
      const response = await axios({
        url: `${BASE_URL}is-online`,
        method: 'GET',
        timeout: 1500, // 1.5 second timeout
        withCredentials: true
      });
      
      const status = response.data.online ? "online" : "offline";
      store.dispatch(setConnectivityStatus(status));
    } catch (error) {
      store.dispatch(setConnectivityStatus("offline"));
    }
  }

  getCurrentStatus() {
    return store.getState().response.connectivityStatus;
  }
}

// Create singleton instance
export const connectivityService = new ConnectivityService();
