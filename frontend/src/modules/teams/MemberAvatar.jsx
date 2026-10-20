// Jede Person bekommt aus ihrem Namen immer dieselbe, ruhige Farbe
const HUES = [88, 150, 195, 28, 330, 260, 52, 0]

export function memberHue(name = '') {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
  return HUES[hash % HUES.length]
}

function MemberAvatar({ name, size = 28, title }) {
  return (
    <span
      className="member-avatar"
      style={{ '--hue': memberHue(name), width: size, height: size, fontSize: size * 0.42 }}
      title={title ?? name}
    >
      {name ? name[0] : '?'}
    </span>
  )
}

export default MemberAvatar
