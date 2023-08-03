'use client'
import { WeeeIcon } from '~/components/common/icon'
import MiniCart from '~/components/common/mini-cart'
// import Constants from '@/constants/const';
// import useHomepage from '@/store/home';
// import useCart from '@/store/shopping';
// import { getZipcode, getAddressCity } from '@/utils/common/porder';
import LOGO from '@/assets/images/weee-logo-black.svg'
import { useRef } from 'react'
import { getCookie } from '~/utils/cookie-client'
import HomeDrawer from '~/components/common/home-drawer'

export enum DrawerType {
  'store' = 'store',
  'zipcode' = 'zipcode',
  'date' = 'date',
  'delivery' = 'delivery',
}
export type HeaderProps = {
  className?: string
  // openDrawer?: (type: keyof typeof DrawerType, closable?: boolean) => () => void;
  simple?: ObjectType
  storeInfo?: ObjectType
}
// import { getCroppedImageUrl } from '@/components/common/CroppedImage';

function HomeHeader(props: HeaderProps) {
  const { simple, storeInfo } = props
  const drawerRef = useRef<any>()
  // const { store } = useHomepage();
  // const { simple } = useCart();

  // const { storeInfo } = store;
  const showStore = storeInfo?.in_test && storeInfo?.select_store
  const zipcode = getCookie('NEW_ZIP_CODE')
  const city = getCookie('NEW_ZIP_CITY')

  const openDrawer =
    (...args) =>
    () => {
      drawerRef.current?.show(...args)
    }

  return (
    <>
      <div className="w-full h-[48px] flex items-center z-[100] px-5 bg-white" key={`shipping`}>
        <div className="flex-1">
          <div
            onClick={openDrawer(showStore ? DrawerType.delivery : DrawerType.zipcode)}
            className="border border-solid border-surface-1-fg-hairline-idle rounded-[50px] h-10 flex flex-col items-center justify-center"
            style={{ width: 102 }}
          >
            <div>
              <WeeeIcon type="iconlocation-filled" className="text-black" style={{ fontSize: 13 }} />
              <span className="mx-1 enki-utility-xs text-surface-1-fg-default-idle">{zipcode}</span>
              <WeeeIcon type="iconarrow-down" style={{ fontSize: 6, color: '#1B1B1D', fontWeight: 600 }} />
            </div>
            {showStore ? (
              <span className="text-surface-1-fg-minor-idle enki-utility-xs text-center w-20 inline-block whitespace-nowrap overflow-hidden text-ellipsis">
                {simple?.eta_date_desc || <span className="w-[50px] h-[13px] bg-[#f3f3f3] skeleton block" />}
              </span>
            ) : (
              <span className="text-surface-1-fg-minor-idle enki-utility-xs text-center w-20 inline-block whitespace-nowrap overflow-hidden text-ellipsis">
                {city}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center flex-col justify-center">
          <img className="w-[70px] h-5" src={LOGO} />
          <div className="mt-1 flex-1 flex items-center justify-center">
            {showStore ? (
              <span className="enki-utility-xs text-surface-1-fg-default-idle" onClick={openDrawer(DrawerType.store, true)}>
                {storeInfo?.select_store_name}
              </span>
            ) : (
              <span className="enki-utility-xs text-surface-1-fg-default-idle" onClick={openDrawer(DrawerType.date)}>
                {simple?.eta_date_desc || <span className="w-[50px] h-[13px] bg-[#f3f3f3] skeleton block" />}
              </span>
            )}
            <WeeeIcon type="iconarrow-down" style={{ fontSize: 6, color: '#1B1B1D', fontWeight: 600 }} />
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <MiniCart />
        </div>
      </div>
      <HomeDrawer ref={drawerRef} />
    </>
  )
}

export default HomeHeader
