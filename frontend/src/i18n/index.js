import { useEffect, useState } from 'react'
import de from './de'
import en from './en'

/*
 * Kleine Übersetzungs-Hilfe ohne extra Bibliothek.
 *
 *   t('tasks.title')                -> "Meine Aufgaben" / "My tasks"
 *   t('due.overdue', { date: ... }) -> Platzhalter {date} wird ersetzt
 *
 * Ein Eintrag im Wörterbuch kann auch eine Funktion sein (für Mehrzahl):
 *   'garden.plants': ({ n }) => (n === 1 ? 'Pflanze' : 'Pflanzen')
 *
 * Beim Sprachwechsel wird die App neu gezeichnet (siehe main.jsx).
 */

export const LANGUAGES = { de, en }
const STORAGE_KEY = 'lang'

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved in LANGUAGES) return saved
  } catch {
    // z. B. privater Modus
  }
  return 'de'
}

let current = initialLang()
const listeners = new Set()
document.documentElement.lang = current

export const getLang = () => current

/** Für Datumsangaben: toLocaleDateString(locale(), …) */
export const locale = () => (current === 'de' ? 'de-DE' : 'en-GB')

export function setLang(lang) {
  if (!(lang in LANGUAGES) || lang === current) return
  current = lang
  document.documentElement.lang = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // egal – gilt dann nur bis zum Neuladen
  }
  listeners.forEach((fn) => fn(lang))
}

export function toggleLang() {
  setLang(current === 'de' ? 'en' : 'de')
}

export function t(key, vars = {}) {
  const value = LANGUAGES[current][key] ?? LANGUAGES.de[key]
  if (value === undefined) return key
  if (typeof value === 'function') return value(vars)
  if (typeof value !== 'string') return value // z. B. Liste der Wochentage
  return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '')
}

/** Stufen-Namen kommen vom Backend auf Deutsch ("Samen", "Baum" …) */
export function stageName(name) {
  return (current !== 'de' && LANGUAGES[current].stages?.[name]) || name
}

/** Fehlermeldungen vom Backend (deutsch) für Englisch übersetzen */
export function serverMessage(message) {
  return (current !== 'de' && LANGUAGES[current].server?.[message]) || message
}

/** Hook: aktuelle Sprache – Komponente zeichnet sich bei Wechsel neu */
export function useLang() {
  const [lang, setState] = useState(current)
  useEffect(() => {
    listeners.add(setState)
    return () => listeners.delete(setState)
  }, [])
  return lang
}
