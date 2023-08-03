import React, { useEffect } from 'react'
import Popup from '~/components/common/popup'
// import ChangeZipCode from './ChangeZipCode';
// import ChangeDate from './ChangeDate';
// import ChangeStore from './ChangeStore';
// import { ChangeDeliveryInfo } from './ChangeDeliveryInfo';
// import { fixedBody, looseBody } from '@/utils/common/dom';

type CommonDrawer = {
  [key: string]: any
  children?: React.ReactNode
}

const COMPONENT_MAP = {
  // date: ChangeDate,
  // zipcode: ChangeZipCode,
  // store: ChangeStore,
  // delivery: ChangeDeliveryInfo
}

const POPUP_CONFIG = {
  //选择store
  store: (params) => {
    return {
      animationType: 'slide-up',
      position: 'bottom',
      wrapperClassName: params.isClosable ? 'rounded-tl-5 rounded-tr-5' : '',
    }
  },
  delivery: (_params) => {
    return {
      animationType: 'slide-up',
      position: 'bottom',
      wrapperClassName: 'top-6 rounded-tl-5 rounded-tr-5',
      className: 'rounded-tl-5 rounded-tr-5',
    }
  },
  default: (_params) => {
    return {
      animationType: 'slide-left',
      position: 'left',
    }
  },
}

export default function CommonDrawer(props: CommonDrawer) {
  const { visible, onCancel, show, params, ...rest } = props
  const Component = COMPONENT_MAP[params.type]
  const popConfig = (POPUP_CONFIG[params.type] || POPUP_CONFIG['default'])(params)

  useEffect(() => {
    if (visible) {
      // fixedBody();
    }
  }, [visible])

  const hide = () => {
    // looseBody();
    onCancel?.()
  }

  return (
    <Popup
      {...popConfig}
      popStyle={{
        transform: 'translateZ(0px)',
      }}
      zIndex={501}
      destroyOnClose
      onClose={onCancel}
      popupId="homepage-change-porder"
      show={visible}
    >
      <div>{params.type}</div>
      {/* <Component
        className={popConfig?.className}
        hide={hide}
        onBack={hide}
        closable={params.isClosable || false}
        show={show}
      /> */}
    </Popup>
  )
}
