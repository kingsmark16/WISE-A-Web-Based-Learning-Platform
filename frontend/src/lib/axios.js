import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "http://192.168.254.180:3000/api",
    
    withCredentials: true
})