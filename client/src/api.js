import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getSpese = () => api.get('/spese').then(r => r.data)
export const getCategorie = () => api.get('/categorie').then(r => r.data)
export const addSpesa = (data) => api.post('/spese', data).then(r => r.data)
export const updateSpesa = (id, data) => api.put(`/spese/${id}`, data).then(r => r.data)
export const deleteSpesa = (id) => api.delete(`/spese/${id}`).then(r => r.data)
export const addCategoria = (nome) => api.post('/categorie', { nome }).then(r => r.data)
