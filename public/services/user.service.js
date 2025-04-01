const BASE_URL = '/api/user/'

export const userService = {
  query,
  getById,
  remove,
  save,
  getEmptyCredentials,
}

function query() {
  return axios.get(BASE_URL).then((res) => res.data)
}

function getById(userId) {
  return axios.get(BASE_URL + userId).then((res) => res.data)
}

function remove(userId) {
  return axios.delete(BASE_URL + userId).then((res) => res.data)
}

function save(user) {
  if (user._id) {
    return axios.put(BASE_URL + user._id, user).then((res) => res.data)
  } else {
    return axios.post(BASE_URL, user).then((res) => res.data)
  }
}

function getEmptyCredentials() {
  return {
    username: '',
    password: '',
    fullname: '',
  }
}
