import defaultSettings from '@/settings'

const title = defaultSettings.title || '德和信平台管理后台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle}-${title}`
  }
  return `${title}`
}
