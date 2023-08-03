export interface ISection {
  components: IComponent[]
  section_key: string
}

export interface IDataSourceItem {
  next: string | ObjectType
  is_static: boolean
  now: string | ObjectType
  time: number
}

export interface IProperties {
  more_link?: string
  more_link_style?: string
  title?: string
  event_key?: string
  style?: string
  tabs?: string
  keys?: string
  event_keys?: string
  tips?: string
  contents?: string
  item_card_size?: 'M' | 'L' | 'Auto'
  img_url?: string
  // cms btn
  alias?: string
  background?: string
  text?: string
  button_style?: 'style1' | 'style2'
  link_url?: string
  // cms divider
  color?: string
  display_mode?: 'solid' | 'dotted'
  divider_height?: 'large' | 'middle' | 'small'
  // title
  font_size?: 'large' | 'middle' | 'small'
  align?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent'
  // text
  font_weight?: 'normal' | 'weight'
  italic?: 'normal' | 'italic'
  display_line?: string
  // product array
  sub_title?: string
  line?: string
  // banner
  width_type?: string
  autoplay?: string
  rounded_corner?: string
  horizontal_margin?: string
  vertical_margin?: 'large' | 'middle' | 'small'
  title_style?: string
  sub_title_style?: string
  html_text?: string
  icon?: string
}

export interface IComponent {
  component_priority: number
  component_key: any
  datasource: string[]
  component_config_id: number | string
  properties: IProperties
}

export interface ICms {
  layout: {
    page_key: string
    sections: ISection[]
    page_param?: ObjectType
  }
  datasource: {
    [key: string]: IDataSourceItem
  }
  version?: string
}

export interface IExtraProps {
  userInfo?: ObjectType
  isRobot?: boolean
  [key: string]: any
}

export interface ComponentProps {
  cmsComponentKey: string
  componentDataSourceKey?: string
  componentMultipleDataSourceKey?: string[]
  multipleDataSource?: any
  postUrls?: string[]
  properties: IProperties
  component_config_id: number | string
  postUrl?: string
  isStatic: boolean
  data: any
  loading?: boolean
  link?: string
  componentPosition?: number
  componentPos?: number
  trackClick?: () => void
  isRobot?: boolean
  isLogin?: boolean
  title?: string
  skeleton?: React.ReactElement
  isGlobal?: boolean
  showSoldBy?: boolean
  showBrandName?: boolean
  isWaterfallPage?: boolean
  trackingContext?: ObjectType
}

export enum ISize {
  small = 'small',
  middle = 'middle',
  large = 'large',
}

export enum IWeight {
  normal = 'normal',
  weight = 'weight',
}

export enum ImgSize {
  original_img = 'original_image',
  max_width = 'max_width',
}

export enum bgType {
  image = 'image',
  color = 'color',
}

export enum IStatus {
  yes = 'yes',
  no = 'no',
}

/**
 * 非通用加购接口更新时使用次属性
 */
export type customAddCartApi = 'mkplGroupOrder' | 'mkplSellerOrder' | null

export interface PoolExtraProps {
  uniqueVideoPlayerRef?: React.MutableRefObject<any>
  showSoldBy?: boolean
  transformProductLink?: (data: Record<string, any>) => {
    to: string
    reload: boolean
  }
  trackingContext?: ObjectType
  addCartParams?: {
    source?: string
    referType: string
  } & ObjectType
  infiniteScrollOptions?: ObjectType
  domId?: string //无限加载组件的宿主容器id
  customAddCartApi?: customAddCartApi
  [key: string]: any
}
export interface CmsComponentOriginProps {
  componentDataSourceKey: string
  title: string
  cmsComponentKey: string
  isStatic: boolean
  properties: Record<string, any>
  componentPos: number
  //ts类型, 如果 isStatic 为 true, 则存在 data 属性, 否则存在 postUrl 属性
  data?: any
  postUrl?: string
}

export interface CmsComponentProps extends CmsComponentOriginProps, PoolExtraProps {}
