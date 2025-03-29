const BASE_URL = '/api/bug/'

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
  getPDFById,
  getAvailableLabels,
}

function query(queryOptions) {
  return axios
    .get(BASE_URL, { params: queryOptions })
    .then((res) => res.data)
    .catch((err) => {
      console.log('Error fetching bugs:', err)
      return { bugs: [], totalPages: 0 }
    })
}

function getById(bugId) {
  return axios
    .get(BASE_URL + bugId)
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error fetching bug by ID:', err)
    })
}

function getPDFById(bugId) {
  const url = `${BASE_URL}${bugId}/pdf`
  return axios
    .get(url, { responseType: 'blob' })
    .then((res) => {
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `bug_${bugId}_report.pdf`
      link.click()
    })
    .catch((err) => {
      console.error('Failed to download PDF:', err)
    })
}

function remove(bugId) {
  return axios
    .delete(BASE_URL + bugId)
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error removing bug:', err)
    })
}

function save(bug) {
  if (bug._id) {
    return axios
      .put(BASE_URL + bug._id, bug)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error updating bug:', err)
      })
  } else {
    return axios
      .post(BASE_URL, bug)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error creating bug:', err)
      })
  }
}

function getAvailableLabels() {
  return axios
    .get(BASE_URL + 'labels')
    .then((res) => res.data)
    .catch((err) => {
      console.error('Failed to fetch labels:', err)
      return []
    })
}

function getDefaultFilter() {
  return {
    title: '',
    description: '',
    severity: 0,
    labels: [],
    sortBy: 'title',
    sortOrder: 'asc',
  }
}
