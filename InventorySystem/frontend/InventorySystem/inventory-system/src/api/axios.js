
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:7266/api', // your .NET API
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
