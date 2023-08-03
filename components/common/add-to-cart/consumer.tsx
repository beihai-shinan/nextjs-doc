'use client'
import { cloneElement, useMemo, useRef } from 'react'

// import { getSimpleInfo, purchaseInCart, purchaseInCartV3, purchaseNormal, purchaseNormalV3 } from '@/api/so';
import useCart from '~/store/global'
import { callApi } from '~/utils/axios'
import { getCookie } from '~/utils/cookie-client'
import useCartActionT2 from '~/utils/tracker/useCartActionT2'

type CartItemV2 = any
export const CartConsumer = ({
  isInCart,
  /**
   * combine checkout调整, 优先使用v3, 特殊情况使用v2
   */
  useNewUpdateCartApi = true,
  isAppSupportPurchaseStatusNotify,
  changeNum,
  trackDataInDialog,
  children,
  customAddCartApi,
}) => {
  const {
    id2qty: commonId2qty,
    addGoodsInCart: commonAddGoodsInCart,
    subGoodsInCart: commonSubGoodsInCart,
    setCartData: handleSyncSimpleCart,
    setAddCartData: handleSyncAllCartData,
  } = useCart()

  const { cartActionTracking } = useCartActionT2(trackDataInDialog)

  const delay = 300
  const timer = useRef<any>()
  const isMkplGroupOrderRequest = customAddCartApi === 'mkplGroupOrder'

  const id2qty = commonId2qty

  const addGoodsInCart = commonAddGoodsInCart

  const subGoodsInCart = commonSubGoodsInCart

  async function addToCart(goodsInfo: CartItemV2, count: number, isImmediately?: boolean) {
    const goods: CartItemV2 = { ...goodsInfo }
    goods.quantity = count
    delete goods.img
    delete goods.title
    delete goods.unit_info
    delete goods.sold_status
    delete goods.max_order_quantity

    if (isImmediately) {
      immediatelyUpdate([goods])
    } else {
      changeNum && changeNum([goods], isAppSupportPurchaseStatusNotify) //实时同步购物车数据到app 新版本purchaseStatusNotify
      addGoodsInCart(goods)
      debounceUpdate([goods])
    }
  }

  function subToCart(goodsInfo: CartItemV2, count: number, isImmediately?: boolean) {
    const goods: CartItemV2 = { ...goodsInfo }
    goods.quantity = count
    delete goods.img
    delete goods.title
    delete goods.unit_info
    delete goods.sold_status
    delete goods.max_order_quantity

    if (isImmediately) {
      immediatelyUpdate([goods])
    } else {
      changeNum && changeNum([goods], isAppSupportPurchaseStatusNotify)
      subGoodsInCart(goods)
      debounceUpdate([goods])
    }
  }

  function debounceUpdate(params) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (isInCart) {
        updateCart(params)
      } else {
        updateSimpleCart(params)
      }
      clearTimeout(timer.current)
    }, delay)
  }

  function immediatelyUpdate(params) {
    if (isInCart) {
      updateCart(params)
    } else {
      updateSimpleCart(params)
    }
  }

  async function updateSimpleInfo(params?, isAppSupportPurchaseStatusNotify?) {
    const requestHeader = {
      log: true,
      'b-cookie': getCookie('b_cookie') || '',
      Authorization: `Bearer ${getCookie('auth_token')}`,
      lang: getCookie('site_lang'),
      'weee-session-token': getCookie('weee_session_token') || '',
      zipcode: getCookie('NEW_ZIP_CODE') || '',
      'weee-store': getCookie('weee-store') || '',
      'device-id': getCookie('device-id') || '',
      platform: getCookie('platform') || 'h5',
    }
    const innerRes = await callApi(`/ec/so/porder/simple`, {
      method: 'GET',
      headers: requestHeader,
    })
    handleSyncSimpleCart(innerRes)
    const oldParams = params?.map((item) => {
      return {
        ...item,
        quantity: innerRes?.items?.find((itemInner) => itemInner.product_id === item.product_id)?.quantity ?? 0,
      }
    })
    // 增删商品失败，则更新app购物车 新版本purchaseStatusNotify（目前支持收藏列表页面）
    changeNum && changeNum(oldParams, isAppSupportPurchaseStatusNotify)
  }

  async function updateSimpleCart(params) {
    if (!params) return
    params.forEach((product) => {
      const pageData = window._weeeTracker?.pageContext.getPageContext()
      const newSource = {
        ...(product?.positionInfoT2?.modSecPos || {}),
        prod_pos: product?.positionInfoT2?.prodPos ?? null,
        page_key: pageData?.page_key ?? null,
        referer_page_key: pageData?.referer_page_key ?? null,
        view_id: pageData?.view_id ?? null,
      }
      product.new_source = JSON.stringify(newSource)
    })
    try {
      params.forEach((product) => {
        let oldQty = isMkplGroupOrderRequest ? id2qty?.[`${product?.user_id}-${product?.product_id}`] : id2qty?.[product?.product_id]
        cartActionTracking({
          ...(product?.positionInfoT2?.modSecPos || {}),
          co: {
            ...product,
            index: product?.positionInfoT2?.prodPos,
            old_qty: oldQty || 0,
          },
          ctx: product?.context || product?.ctx || product?.positionInfoT2?.context,
        })
      })

      let res: any = {}
      const requestHeader = {
        log: true,
        'b-cookie': getCookie('b_cookie') || '',
        Authorization: `Bearer ${getCookie('auth_token')}`,
        lang: getCookie('site_lang'),
        'weee-session-token': getCookie('weee_session_token') || '',
        zipcode: getCookie('NEW_ZIP_CODE') || '',
        'weee-store': getCookie('weee-store') || '',
        'device-id': getCookie('device-id') || '',
        platform: getCookie('platform') || 'h5',
      }
      if (isMkplGroupOrderRequest) {
        // res = await makeGroupOrderCartFetech(params);
      } else if (useNewUpdateCartApi) {
        res = await callApi(`/ec/so/porder/items/v3`, {
          method: 'PUT',
          headers: requestHeader,
          body: JSON.stringify(params),
        })
      } else {
        res = await callApi(`/ec/so/porder/items/v2`, {
          method: 'PUT',
          headers: requestHeader,
          body: JSON.stringify(params),
        })
      }
      if (res && res?.sellerTagInfo && !isMkplGroupOrderRequest) {
      }
      // if (res && useNewUpdateCartApi) {
      //   handleSyncAllCartData(res)
      // }
      if (!res && !isMkplGroupOrderRequest) {
        updateSimpleInfo(params, isAppSupportPurchaseStatusNotify)
      } else {
        //  增删成功同步app购物车数据 老版本purchaseStatusNotify（比如bogo页面等）
        changeNum && changeNum()
      }
    } catch (error) {
      // 如果失败，主动同步小购物车校准数据
      updateSimpleInfo(params, isAppSupportPurchaseStatusNotify)
    }
  }

  async function updateCart(params) {
    if (!params) return
    const requestHeader = {
      log: true,
      'b-cookie': getCookie('b_cookie') || '',
      Authorization: `Bearer ${getCookie('auth_token')}`,
      lang: getCookie('site_lang'),
      'weee-session-token': getCookie('weee_session_token') || '',
      zipcode: getCookie('NEW_ZIP_CODE') || '',
      'weee-store': getCookie('weee-store') || '',
      'device-id': getCookie('device-id') || '',
      platform: getCookie('platform') || 'h5',
    }
    params.forEach((product) => {
      const pageData = window._weeeTracker?.pageContext.getPageContext()
      const newSource = {
        ...(product?.positionInfoT2?.modSecPos || {}),
        prod_pos: product?.positionInfoT2?.prodPos ?? null,
        page_key: pageData?.page_key ?? null,
        referer_page_key: pageData?.referer_page_key ?? null,
        view_id: pageData?.view_id ?? null,
      }
      product.new_source = JSON.stringify(newSource)
    })
    try {
      let res: any = {}
      if (isMkplGroupOrderRequest) {
        // res = await makeGroupOrderCartFetech(params);
      } else if (useNewUpdateCartApi) {
        res = await callApi(`/ec/so/porder/items/cart/v3`, {
          method: 'PUT',
          headers: requestHeader,
          body: JSON.stringify(params),
        })
      } else {
        res = await callApi(`/ec/so/porder/items/cart/v2`, {
          method: 'PUT',
          headers: requestHeader,
          body: JSON.stringify(params),
        })
      }
      if (res) {
        // 增删成功同步app购物车数据 老版本purchaseStatusNotify（比如换购页面）
        changeNum && changeNum()
        params.forEach((product) => {
          let oldQty = isMkplGroupOrderRequest ? id2qty?.[`${product?.user_id}-${product?.product_id}`] : id2qty?.[product?.product_id]
          cartActionTracking({
            ...(product?.positionInfoT2?.modSecPos || {}),
            co: {
              ...product,
              old_qty: oldQty || 0,
              index: product?.positionInfoT2?.prodPos,
            },
            ctx: product?.context || product?.ctx || product?.positionInfoT2?.context,
          })
        })
        if (useNewUpdateCartApi) {
          // handleSyncAllCartData(res)
        }
      }
    } catch (error) {}
  }

  return cloneElement(children, {
    addCart: addToCart,
    subCart: subToCart,
    id2qty,
  })
}
