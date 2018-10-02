import axios from 'axios';

class AxiosManager {
  static getInstance() {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: process.env.REACT_APP_API_GATEWAY,
      });

      this.instance.interceptors.request.use((config) => {
        console.log('[request]', config);
        return config;
      });

      this.instance.interceptors.response.use((res) => {
        console.log('[response]', res);
        return res;
      }, (e) => {
        console.log('[response]', e);
        return e;
      });
    }
    return this.instance;
  }
}

export default AxiosManager.getInstance();