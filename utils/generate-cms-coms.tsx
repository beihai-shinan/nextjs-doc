import { COMPONENT_POOL } from '~/utils/coms-pool'
import { ICms, CmsComponentProps, PoolExtraProps } from '~/types/cms'
import dayjs from 'dayjs'

type Props = {
  cmsConfig: ICms
  componentPool: {
    [key: string]: React.FC<any> | JSX.Element
  }
  extraProps?: PoolExtraProps
  //给每个单独组件的props，key是组件的key，value是props的值
  extraComponentProps?: Record<string, any>
}

export default function useComponentPool(option: Props) {
  const { cmsConfig, componentPool = COMPONENT_POOL, extraProps, extraComponentProps } = option

  if (!cmsConfig) return null

  const renderComponent = () => {
    const componentsMap: any = []
    let componentsIndex = -1
    const { layout, datasource } = option?.cmsConfig || {}
    const sections = layout?.sections || []
    for (let i = 0; i < sections.length; ++i) {
      const { components = [] } = sections[i] || {}
      for (let j = 0; j < components.length; ++j) {
        const { component_key, component_config_id, properties } = components[j]
        const componentDataSourceKey = components[j]?.datasource[0]
        const componentData = datasource[componentDataSourceKey]

        if (componentDataSourceKey && !componentData) {
          // console.log(`layout 中存在但是 datasource 中不存在的数据源:${components[j].component_key}`);
          continue
        }
        const { now, next, time, is_static } = componentData || {}
        let staticData = now || next //兼容如果now无值但是next有值情况
        //如果当前时间比time的时间晚, 说明now数据过期了
        if (time && dayjs.unix(time).isBefore(dayjs())) {
          staticData = next || now
        }
        const Component = componentPool[component_key]
        let key = `${component_key}-${component_config_id}`
        if (Component) {
          componentsIndex++
          const componentProps: CmsComponentProps = {
            componentDataSourceKey,
            title: properties.title,
            cmsComponentKey: component_key,
            isStatic: is_static,
            properties: properties,
            componentPos: componentsIndex,
            componentPosition: componentsIndex,
            ...extraProps,
            ...(extraComponentProps?.[component_key] || {}),
          }
          if (is_static) {
            componentProps.data = staticData
          } else {
            componentProps.postUrl = staticData as string
          }
          let node = <Component key={`${component_key}-${component_config_id}`} {...componentProps} />
          componentsMap.push(node)
        }
      }
    }
    return componentsMap
  }

  return renderComponent()
}
