import { BasicLayoutPage, BlankLayoutPage, Iframe } from '@jetlinks/components'

type Buttons = Array<{ id: string }>

type MenuItem = {
    icon: string,
    name: string
    code: string
    url: string
    isShow?: boolean
    buttons?: Buttons
}

const hasAppID = (item: { appId?: string, url?: string }): { isApp: boolean, appUrl: string } => {
    return {
        isApp: !!item.appId,
        appUrl: `/${item.appId}${item.url}`
    }
}

const handleButtons = (buttons?: Buttons) => {
    return buttons?.map((b) => b.id) || []
}

const handleMeta = (item: MenuItem, isApp: boolean) => {
    return {
        icon: item.icon,
        title: item.name,
        hideInMenu: item.isShow === false,
        buttons: handleButtons(item.buttons),
        isApp
    }
}

const findComponents = (code: string, level: number, isApp: boolean, components: any) => {
    const myComponents = components[code]

    if (level === 1) { // BasicLayoutPage
      return BasicLayoutPage
    } else if (level === 2) { // BlankLayoutPage or components
      return myComponents ? () => myComponents() : BlankLayoutPage
    } else if (isApp){ // iframe
      return () => Iframe
    } else if(myComponents) { // components
        return () => myComponents()
    }
    return components['demo'] // 开发测试用
    // return undefined
}

const hasExtraChildren = (item: MenuItem, extraMenus: any ) => {
    const extraItem = extraMenus[item.code]
    if (extraItem) {
        return extraItem.map(e => ({
          ...e,
          url: `${item.url}${e.url}`,
          isShow: false
        }))
    }

    return undefined
}

export const handleMenus = (menuData: any, extraMenus: any, components: any, level: number = 1) => {
    if (menuData && menuData.length) {
        return menuData.map(item => {
            const { isApp, appUrl } = hasAppID(item) // 是否为第三方程序
            const meta = handleMeta(item, isApp)
            const route: any = {
                path: isApp ? appUrl : `${item.url}`,
                name: isApp ? appUrl : item.code,
                url: isApp ? appUrl : item.url,
                meta: meta,
                children: item.children
            }

            route.component = findComponents(item.code, level, isApp, components)

            const extraRoute = hasExtraChildren(item, extraMenus)

            if (extraRoute && !isApp) { // 包含额外的子路由
                route.children = route.children ? [...route.children, ...extraRoute] : extraRoute
            }

            if (route.children && route.children.length) {
              route.children = handleMenus(route.children, extraMenus, components, level + 1)
            }

            const showChildren = route.children?.filter(r => !r.meta?.hideInMenu) || []

            if (route.children && route.children.length && showChildren.length) {
              route.redirect = showChildren[0].path
            }

            return route
        })
    }

    return []
}

const hideInMenu = (code: string) => {
  return ['account-center', 'message-subscribe'].includes(code)
}

export const handleSiderMenu = (menuData: any) => {
  if (menuData && menuData.length) {
    return menuData.map(item => {
      const { isApp, appUrl } = hasAppID(item) // 是否为第三方程序
      const meta = handleMeta(item, isApp)
      const route: any = {
        path: isApp ? appUrl : `${item.url}`,
        name: isApp ? appUrl : item.code,
        url: isApp ? appUrl : item.url,
        meta: meta,
        children: item.children
      }

      if (route.children && route.children.length) {
        route.children = handleSiderMenu(route.children)
      }

      route.meta.hideInMenu = hideInMenu(item.code)

      return route
    })
  }
  return []
}


export const handleAuthMenu = (menuData: any, cb: (code, buttons) => void) => {
  if (menuData && menuData.length) {
    return menuData.forEach(item => {
      const { isApp } = hasAppID(item) // 是否为第三方程序
      if (!isApp) {
        const { code, buttons, children} = item

        if (buttons) {
          cb(code, buttons)
        }

        if (children) {
          handleAuthMenu(children, cb)
        }
      }
    })
  }
}
