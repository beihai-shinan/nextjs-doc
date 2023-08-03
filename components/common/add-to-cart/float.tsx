import AddCart from './add-cart-enki'
import { twMerge } from 'tailwind-merge'

export default function AddToCart(props) {
  const { onClick, trackAddCart, addCartParams, className, contentClassName, customAddCartApi } = props
  return (
    <div
      onClick={onClick}
      style={{ transform: 'translateZ(3px)' }}
      className={twMerge('cart w-full fixed pb-safe bottom-8 px-4 z-[1000] box-border max-w-[750px]', className)}
    >
      <div className={twMerge('bg-primary-surface-1-bg-idle rounded-full h-12', contentClassName)}>
        <div className="h-full" onClick={trackAddCart}>
          <AddCart {...addCartParams} customAddCartApi={customAddCartApi} isInProductCard={false} className="enki-button-label-base px-2.5 h-full" />
        </div>
      </div>
    </div>
  )
}
