const { useState, useRef } = React

export function BugFilter({ filterBy, onSetFilterBy, availableLabels = [] }) {
  const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })
  const labelRefs = useRef([])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break
      case 'checkbox':
        value = target.checked
        break
      default:
        break
    }

    setFilterByToEdit((prevFilter) => ({ ...prevFilter, [field]: value }))
  }

  function onSubmitFilter(ev) {
    ev.preventDefault()
    onSetFilterBy(filterByToEdit)
  }

  function onClearFilter() {
    const clearedFilter = { title: '', description: '', severity: '', labels: [] }
    setFilterByToEdit(clearedFilter)
    onSetFilterBy(clearedFilter)
  }

  function toggleLabel(label) {
    const labels = filterByToEdit.labels || []
    const updatedLabels = labels.includes(label) ? labels.filter((l) => l !== label) : [...labels, label]

    const updatedFilter = { ...filterByToEdit, labels: updatedLabels }
    setFilterByToEdit(updatedFilter)
    onSetFilterBy(updatedFilter)
  }

  function handleLabelKeyDown(ev, idx) {
    if (ev.key === 'ArrowRight') {
      ev.preventDefault()
      const next = labelRefs.current[idx + 1]
      if (next) next.focus()
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault()
      const prev = labelRefs.current[idx - 1]
      if (prev) prev.focus()
    }
  }

  const { title = '', description = '', severity = '', labels = [] } = filterByToEdit

  return (
    <section className='bug-filter'>
      <h2>Filter Bugs</h2>

      <form onSubmit={onSubmitFilter}>
        <label htmlFor='title'>Title: </label>
        <input value={title} onChange={handleChange} type='text' id='title' name='title' placeholder='Search by title' />

        <label htmlFor='description'>Description: </label>
        <input value={description} onChange={handleChange} type='text' id='description' name='description' placeholder='Search by description' />

        <label htmlFor='severity'>Severity: </label>
        <input value={severity} onChange={handleChange} type='number' id='severity' name='severity' placeholder='Min severity' />

        {availableLabels.length > 0 && (
          <div className='label-filter'>
            <h4>Filter by Labels:</h4>
            <div className='label-list'>
              {availableLabels.map((label, idx) => (
                <label key={label} className='tag'>
                  <input
                    ref={(el) => (labelRefs.current[idx] = el)}
                    type='checkbox'
                    name='labels'
                    value={label}
                    checked={labels.includes(label)}
                    onChange={() => toggleLabel(label)}
                    onKeyDown={(ev) => handleLabelKeyDown(ev, idx)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className='sort-section'>
          <label htmlFor='sortBy'>Sort By:</label>
          <select id='sortBy' name='sortBy' value={filterByToEdit.sortBy} onChange={handleChange}>
            <option value='title'>Title</option>
            <option value='description'>Description</option>
            <option value='severity'>Severity</option>
          </select>

          <label htmlFor='sortOrder'>Order:</label>
          <select id='sortOrder' name='sortOrder' value={filterByToEdit.sortOrder} onChange={handleChange}>
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </select>
        </div>

        <div className='form-actions'>
          <button type='submit'>Apply Filter</button>
          <button type='button' onClick={onClearFilter}>
            Clear Filter
          </button>
        </div>
      </form>
    </section>
  )
}
