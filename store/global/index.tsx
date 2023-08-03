import React, { createContext, useContext, useReducer } from 'react'

import { reducer, initialState, InitialState } from './reducer'

import ACTIONS from './actions'

const GlobalContext = createContext<{ [key: string]: any }>(initialState)

export const GlobalProvider = ({ children, data }) => {
  const [store, dispatch] = useReducer(reducer, { ...initialState, ...data })
  return <GlobalContext.Provider value={{ store, dispatch }}>{children}</GlobalContext.Provider>
}

export interface IGlobalState extends InitialState {
  setCartData: (data: any) => void
  setAddCartData: (data: any) => void
  addGoodsInCart: (goods: any) => void
  subGoodsInCart: (goods: any) => void
}

export default function useGlobal(): IGlobalState {
  const { dispatch, ...store } = useContext(GlobalContext)
  return {
    ...store.store,
    setCartData: (data) => {
      dispatch({ type: ACTIONS.SET_CART_DATA, payload: data })
    },
    setAddCartData: (data) => {
      dispatch({ type: ACTIONS.SET_ADD_CART_DATA, payload: data })
    },
    addGoodsInCart: (goods) => {
      dispatch({ type: ACTIONS.ADD_GOODS_IN_CART, payload: goods })
    },
    subGoodsInCart: (goods) => {
      dispatch({ type: ACTIONS.SUB_GOODS_IN_CART, payload: goods })
    },
  }
}
