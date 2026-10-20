import { t } from '../../i18n'

// title als Getter: wird bei jedem Zugriff in der aktuellen Sprache gelesen
export const STATUSES = ['todo', 'in_progress', 'done'].map((status) => ({
  status,
  get title() {
    return t(`status.${status}`)
  },
}))
