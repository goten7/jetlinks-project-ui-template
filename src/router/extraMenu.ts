const modulesFiles = import.meta.glob('../modules/*/index.ts', { eager: true})
import i18n from "@/locales";

export const getExtraRouters = () => {
  const extraMenu = {
    'system/Role': [{ // 角色管理
      code: 'Detail',
      url: '/Detail/:id',
      name: i18n.global.t('router.extraMenu.260658-0')
    }],
    'system/Menu': [
      {
        code: 'Detail',
        url: '/Detail/:id',
        name: i18n.global.t('router.extraMenu.260658-2')
      },
    ],
    'system/Positions': [
      {
        code: 'Detail',
        url: '/Detail/:id',
        name: i18n.global.t('router.extraMenu.260658-3')
      }
    ]
  }


  Object.keys(modulesFiles).forEach(key => {
    const routes = (modulesFiles[key] as any).default.getExtraRoutesMap()
    Object.assign(extraMenu, routes)
  })

  return extraMenu
}
