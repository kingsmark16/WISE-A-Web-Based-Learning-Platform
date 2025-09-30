import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "http://192.168.254.180:3000/api", // change to IP when in mobile device usage
    withCredentials: true
})

export default axiosInstance;