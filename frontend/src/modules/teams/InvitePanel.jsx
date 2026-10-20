import { useState } from 'react'
import { Check, Copy, Link2, RefreshCw } from 'lucide-react'
import { formatCode } from './teamsApi'
import { t } from '../../i18n'

/** Einladungscode anzeigen und kopieren (Code oder fertigen Link) */
function InvitePanel({ team, isOwner, onNewCode }) {
  const [copied, setCopied] = useState(null)
  const code = formatCode(team.invite_code)
  const link = `${window.location.origin}/teams?join=${team.invite_code}`

  async function copy(what, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="invite-panel">
      <p className="invite-label">{t('invite.label')}</p>
      <div className="invite-code">{code}</div>
      <div className="invite-buttons">
        <button type="button" className="btn-ghost" onClick={() => copy('code', team.invite_code)}>
          {copied === 'code' ? <Check size={14} /> : <Copy size={14} strokeWidth={1.75} />}
          {copied === 'code' ? t('invite.copied') : t('invite.copyCode')}
        </button>
        <button type="button" className="btn-ghost" onClick={() => copy('link', link)}>
          {copied === 'link' ? <Check size={14} /> : <Link2 size={14} strokeWidth={1.75} />}
          {copied === 'link' ? t('invite.copied') : t('invite.copyLink')}
        </button>
      </div>
      {isOwner && (
        <button type="button" className="link-btn" onClick={onNewCode}>
          <RefreshCw size={12} strokeWidth={2} /> {t('invite.newCode')}
        </button>
      )}
    </div>
  )
}

export default InvitePanel
