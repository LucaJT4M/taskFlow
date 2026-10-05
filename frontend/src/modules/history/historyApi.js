import { request } from '../tasks/tasksApi'

export const getHistory = () => request('/history')
