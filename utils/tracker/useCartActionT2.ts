import Tracker from './track-instance'
import { formatImpression } from '@weee-fe/weee-biz-web'

const formatParam = (param) => {
  return {
    mod_nm: param?.mod_nm ?? null,
    mod_pos: param?.mod_pos ?? null,
    sec_nm: param?.sec_nm ?? null,
    sec_pos: param?.sec_pos ?? null,
    co: param?.co,
    ctx: param?.ctx,
  }
}

const formatProductInfo = (data) => {
  if (!data) return null
  return {
    prod_pos: data?.index,
    prod_id: data?.id || data?.product_id,
    old_qty: data?.old_qty || 0,
    new_qty: data?.quantity,
    refer_type: data?.refer_type,
    source: data?.source,
    is_mkpl: data?.is_mkpl,
    recommendation_trace_id: data?.recommend_trace_id || data?.recommendation_trace_id,
  }
}

export default function useCartActionT2(trackDataInDialog?: Record<string, any>) {
  const cartActionTracking = (param) => {
    const params = formatParam(param)
    params.co = formatProductInfo(params?.co)
    if (params?.ctx) {
      params.ctx = formatImpression.formatCtx(params?.ctx)
      params.ctx === null && delete params.ctx
    }
    if (trackDataInDialog) {
      new Tracker().addEventInDialog('t2_cart_action', params, trackDataInDialog).send()
    } else {
      new Tracker().addEvent('t2_cart_action', params).send()
    }
  }

  const rtgCartActionTracking = (params) => {
    new Tracker().addEvent('t2_cart_action', params).send()
  }

  return {
    cartActionTracking,
    rtgCartActionTracking,
  }
}
