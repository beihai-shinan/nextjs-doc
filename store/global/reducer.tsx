import ACTIONS from './actions'

export interface InitialState {
  global: any
  cart: any
  id2qty: any
}

export const initialState = {
  global: {},
  cart: {
    count: 0,
  },
  id2qty: {},
}

const getTotal = (obj: ObjectType) => {
  if (!obj || typeof obj !== 'object') return 0
  const keys = Object.keys(obj)
  return keys.reduce((pre, cur) => pre + obj[cur], 0)
}

export function simpleInfoCreateProduct2Qty(simpleInfo: any): ObjectType {
  if (!simpleInfo) return {}
  const items = simpleInfo?.items
  if (!items) return {}
  // let normalSection = sections.find(section => section.type === 'normal');
  if (!Array.isArray(items) && items.length === 0) return {}

  const id2qty = {}

  for (const element of items) {
    if (element.status === 'C') {
      continue
    }
    id2qty[element?.product_id] = element?.quantity
  }

  return id2qty
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SET_GLOBAL_INFO:
      return {
        ...state,
        global: action.payload,
      }
    case ACTIONS.SET_CART_DATA:
      const simpleId2qty = simpleInfoCreateProduct2Qty(action.payload)
      return {
        ...state,
        cart: {
          ...action.payload,
          count: getTotal(simpleId2qty),
        },
        id2qty: simpleId2qty,
      }
    case ACTIONS.SET_ADD_CART_DATA:
      const id2qty = simpleInfoCreateProduct2Qty(action.payload)

      return {
        ...state,
        cart: {
          ...action.payload,
          count: getTotal(id2qty),
        },
        id2qty,
      }
    case ACTIONS.ADD_GOODS_IN_CART:
      const id2qtyAdd = { ...state.id2qty }
      id2qtyAdd[action.payload.product_id] = action.payload.quantity
      return {
        ...state,
        cart: {
          ...state.cart,
          count: getTotal(id2qtyAdd),
        },
        id2qty: id2qtyAdd,
      }
    case ACTIONS.SUB_GOODS_IN_CART:
      const id2qtySub = { ...state.id2qty }
      id2qtySub[action.payload.product_id] = action.payload.quantity
      return {
        ...state,
        cart: {
          ...state.cart,
          count: getTotal(id2qtySub),
        },
        id2qty: id2qtySub,
      }

    default:
      return state
  }
}
