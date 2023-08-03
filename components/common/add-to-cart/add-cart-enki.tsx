'use client'
import React, { useEffect, useMemo, useState } from 'react'

import { CartConsumer } from './consumer'
import { CardType } from '~/components/common/product-card/types'
// import { isAppSupportPurchaseStatusNotify as isAppSupportPurchaseStatus } from '@/utils/weeeapp-notify';
import { getCookie } from '~/utils/cookie-client'
import Cartbtn from './cart-btn'
// import SoldOut from './components/SoldOut/index-enki';
import getReferType from '~/utils/cart/refer-type'
import getReferValue from '~/utils/cart/refer-value'

export interface AddCartProps {
  num?: number
  //每次增加的数量
  count?: number
  text?: string
  imageUrl?: string
  className?: string
  data?: any
  is?: any
  isNotification?: boolean
  source: string | undefined // TODO source 字段 首次优先：如果一个商品已经被加入购物车设置好source，那么在后续其他页面调整其数量，并不修改source；
  referType?: string
  referValue?: string
  customReferType?: string
  customReferValue?: string
  deliveryDate: string
  id2qty?: ObjectType
  /**加购按钮是否显示文案 */
  renderCartCountText?: boolean
  render?: any
  onClick?: (type?, num?) => void
  isInCart?: boolean
  addCart?: (data: any, count: number) => void
  subCart?: (data: any, count: number) => void
  /**delivery组件 根据productId获取商品的配送日期 */
  productId?: number
  minLimitArrowToTarget?: number
  preSell?: boolean
  changeDeliveryDateButtonText?: string
  link?: string
  onNumChange?: () => void
  isInProductCard?: boolean
  showTooltip?: boolean
  positionInfoT2?: any
  isAppSupportPurchaseStatusNotify?: boolean
  index?: number
  trackDataInDialog?: Record<string, any>
  clickTracking?: () => void
  showProductGrouping?: () => void
  useNewUpdateCartApi?: boolean // 是否使用新的更新购物车接口 items/cart/v3
  customAddCartApi?: string // 自定义购物车接口
  defaultExpand?: boolean
}

export const AddCart = (props: any) => {
  const {
    data = {},
    text,
    className,
    addCart,
    subCart,
    source,
    customReferType,
    customReferValue,
    deliveryDate,
    id2qty,
    renderCartCountText,
    onClick,
    render,
    minLimitArrowToTarget,
    preSell,
    changeDeliveryDateButtonText,
    isInProductCard,
    showTooltip,
    positionInfoT2,
    clickTracking,
    showProductGrouping,
    defaultExpand,
    index,
    link,
    cardType,
    customAddCartApi,
  } = props
  const [num, setNum] = useState<number>(0)
  const min = +data?.min_order_quantity || 0
  const goodsUsefulInfo = useMemo(() => {
    const goods: any = {
      product_id: data?.product_id || data?.id,
      source,
      source_store: getCookie('weee_store'),
      refer_type: customReferType || getReferType(data),
      refer_value: customReferValue || getReferValue(data),
      delivery_date: deliveryDate,
      img: data?.img,
      title: data?.title || data?.name,
      unit_info: data?.unit_info || '',
      sold_status: data?.sold_status || 'available',
      max_order_quantity: data?.max_order_quantity || 9999,
      min_order_quantity: data?.min_order_quantity || 1,
      is_pantry: data?.is_pantry || false,
      is_alcohol: data?.is_alcohol || false,
      item_type: data?.item_type || '',
      buttonText: changeDeliveryDateButtonText,
      is_mkpl: data?.is_mkpl || false,
      product_key: data?.product_key ? data.product_key : undefined,
      options: data?.options ? data.options : undefined,
      positionInfoT2: positionInfoT2,
      ctx: positionInfoT2?.context,
    }
    if (customAddCartApi === 'mkplGroupOrder') {
      goods.user_id = data?.user_id || undefined
      goods.slug = data?.slug || undefined
    }
    return goods
  }, [JSON.stringify(data), customReferType, JSON.stringify(positionInfoT2)])

  useEffect(() => {
    let uniqueId = goodsUsefulInfo.product_id

    setNum(id2qty?.[uniqueId] || 0)
  }, [JSON.stringify(id2qty), goodsUsefulInfo.product_id])

  const addCount = (e, onAdd: (num: number) => void) => {
    if (num < min) {
      setNum(min)
      addCart?.(goodsUsefulInfo, min)
      onAdd && onAdd(min)
      onClick && onClick('add', min)
    } else {
      setNum((cartQty) => cartQty + 1)
      addCart?.(goodsUsefulInfo, num + 1)
      onAdd && onAdd(num + 1)
      onClick && onClick('add', num + 1)
    }

    //gtm add to cart pixel event
    window?.pixelAddToCart?.({
      title: data?.title || data?.name,
      product_id: data?.id,
      id: data?.id,
      quantity: num < min ? min : num + 1,
      price: data?.price,
      item_price: data?.price,
      google_business_vertical: 'retail',
    })

    //gtag add
    window.gtag?.('event', 'add_to_cart', {
      value: data?.price,
      items: [
        {
          id: data?.id,
          quantity: num < min ? min : num + 1,
          google_business_vertical: 'retail',
        },
      ],
    })
  }
  const subtractCount = (e) => {
    if (num === min) {
      setNum(0)
      subCart?.(goodsUsefulInfo, 0)
    } else {
      setNum((cartQty) => cartQty - 1)
      subCart?.(goodsUsefulInfo, num - 1)
    }

    //gtm add to cart pixel event
    window?.pixelAddToCart?.({
      title: data?.title || data?.name,
      product_id: data?.id,
      id: data?.id,
      quantity: num === min ? 0 : num - 1,
      price: data?.price,
      item_price: data?.price,
      google_business_vertical: 'retail',
    })

    //gtag add
    window.gtag?.('event', 'add_to_cart', {
      value: data?.price,
      items: [
        {
          id: data?.id,
          quantity: num === min ? 0 : num - 1,
          google_business_vertical: 'retail',
        },
      ],
    })
  }

  // if (render) {
  //   return render({ ...(data || {}), ...(goodsUsefulInfo || {}) }, addCart, subCart, index)
  // }
  switch (goodsUsefulInfo?.sold_status) {
    case 'available':
      return (
        <Cartbtn
          className={className}
          preSell={preSell}
          text={text}
          renderCartCountText={renderCartCountText}
          num={num}
          max={goodsUsefulInfo?.max_order_quantity}
          min={goodsUsefulInfo?.min_order_quantity}
          addCount={addCount}
          subtractCount={subtractCount}
          minLimitArrowToTarget={minLimitArrowToTarget}
          is_pantry={goodsUsefulInfo?.is_pantry}
          // isAlcohol={
          //   goodsUsefulInfo?.item_type === CartType.alcohol || goodsUsefulInfo?.refer_type === CartType.alcohol
          // }
          data={data}
          showTooltip={showTooltip}
          link={link}
          isInProductCard={isInProductCard}
          showProductGrouping={showProductGrouping}
          defaultExpand={defaultExpand}
        />
      )
    case 'change_other_day':
    // return <Purchased isInProductCard={isInProductCard} className={className} />;
    case 'sold_out':
    // return (
    //   <ChangeOtherDay isInProductCard={isInProductCard} item={goodsUsefulInfo} className={className} data={data} />
    // );
    case 'reach_limit':
    // return (
    //   <SoldOut
    //     isInProductCard={isInProductCard}
    //     id={goodsUsefulInfo.product_id}
    //     cardType={cardType}
    //     className={className}
    //     clickTracking={clickTracking}
    //     data={data}
    //   />
    // );
    default:
      return <div></div>
  }
}

// 通知APP更新购物车数据
// const notifyAppToUpdate = (params?: PerchaseItemReq[], isAppSupportPurchaseStatusNotify?: boolean) => {
//   try {
//     if (isSayWeeeApp()) {
//       const isAppSupportPurchaseStatusNotifyVersion = isAppSupportPurchaseStatus();
//       if (isAppSupportPurchaseStatusNotify && isAppSupportPurchaseStatusNotifyVersion) {
//         const args = {
//           products: params
//         };
//         callAppFunction('purchaseStatusNotify', args);
//       } else {
//         callAppFunction('preOrderStatusNotify', {
//           pre_order_id: getCookie(constants.PRE_ORDER_ID),
//           token: getCookie(constants.ORDER_TOKEN),
//           status: 'propertyChanged'
//         });
//       }
//     }
//   } catch (error) {
//     console.log('notifyAppToUpdate error', error);
//   }
// };
const AddCartEnhance = ({
  isInCart,
  useNewUpdateCartApi,
  customAddCartApi,
  isAppSupportPurchaseStatusNotify,
  onNumChange,
  trackDataInDialog,
  ...rest
}) => {
  return (
    <CartConsumer
      trackDataInDialog={trackDataInDialog}
      customAddCartApi={customAddCartApi}
      useNewUpdateCartApi={useNewUpdateCartApi}
      isInCart={isInCart}
      isAppSupportPurchaseStatusNotify={isAppSupportPurchaseStatusNotify}
      changeNum={(params, isAppSupportPurchaseStatusNotify) => {
        onNumChange?.()
        // notifyAppToUpdate(params, isAppSupportPurchaseStatusNotify);
      }}
    >
      <AddCart {...rest} customAddCartApi={customAddCartApi} />
    </CartConsumer>
  )
}

export default AddCartEnhance
