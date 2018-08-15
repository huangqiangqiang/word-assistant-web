import axios from 'axios';

class AxiosManager{
    static getInstance() {
        if(!this.instance) {
            this.instance = axios.create({
                baseURL: process.env.REACT_APP_API_GATEWAY,
            });
        }
        return this.instance;
    }
}

export default AxiosManager.getInstance();