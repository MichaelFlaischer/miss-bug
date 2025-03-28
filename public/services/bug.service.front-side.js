const BASE_URL = '/api/bug/'

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
  getPDFById,
}

function query(queryOptions) {
  return axios
    .get(BASE_URL, { params: queryOptions })
    .then((res) => res.data)
    .catch((err) => {
      console.log('Error fetching bugs:', err)
      return []
    })
}

function getById(bugId) {
  return axios
    .get(BASE_URL + bugId)
    .then((res) => res.data)
    .catch((bugErr) => console.dir(bugErr, 'hello'))
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
  return axios.get(BASE_URL + bugId + '/remove').then((res) => res.data)
}

function save(bug) {
  const url = BASE_URL + 'save'
  let queryParams = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`

  if (bug._id) queryParams += `&_id=${bug._id}`

  return axios
    .get(url + queryParams)
    .then((res) => res.data)
    .catch((err) => {
      console.log('Error saving bug:', err)
    })
}

function getDefaultFilter() {
  return { txt: '', severity: 0 }
}
