import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api", //change to IP when in mobile device usage
    
    withCredentials: true
})