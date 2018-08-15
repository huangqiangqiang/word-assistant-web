import axios from 'axios';

class AxiosManager{
    static getInstance() {
        if(!this.instance) {
            this.instance = axios.create({
                // baseURL: process.env.REACT_APP_API_GATEWAY,
                baseURL: 'http://159.203.244.176:8080/',
                // baseURL: 'http://127.0.0.1:3001/',
                // baseURL: 'http://192.168.1.103:3001/',
                // baseURL: 'http://192.168.0.104:3001/',
            });
        }
        return this.instance;
    }
}

export default AxiosManager.getInstance();