export function BugPreview({ bug }) {
  return (
    <article className='bug-preview'>
      <p className='title'>{bug.title}</p>
      <p>
        description: <span>{bug.description}</span>
      </p>
      <p>
        Severity: <span>{bug.severity}</span>
      </p>
    </article>
  )
}
