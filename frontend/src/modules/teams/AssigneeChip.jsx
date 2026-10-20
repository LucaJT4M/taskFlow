import MemberAvatar from './MemberAvatar'

/** Zeigt auf einer Team-Aufgabe, wer zuständig ist */
function AssigneeChip({ task, members }) {
  if (!members) return null
  const member = members.find((m) => m.user_id === task.assignee_id)
  if (!member) return <span className="assignee-chip none">Niemand zugewiesen</span>
  return (
    <span className="assignee-chip" title={`Zuständig: ${member.username}`}>
      <MemberAvatar name={member.username} size={18} />
      {member.username}
    </span>
  )
}

export default AssigneeChip
