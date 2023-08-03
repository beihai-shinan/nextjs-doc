export const AddToCartReferType = {
  normal: 'normal',
  pantry: 'pantry',
  seller: 'seller',
  group: 'seller_group_order',
}

const getReferType = (data) => {
  return [
    {
      matched: !!data?.refer_type,
      value: data?.refer_type,
    },
    {
      matched: !!data?.is_pantry,
      value: AddToCartReferType.pantry,
    },
    {
      matched: !!data?.is_mkpl,
      value: AddToCartReferType.seller,
    },
    {
      matched: true,
      value: AddToCartReferType.normal,
    },
  ].find((item) => {
    return item.matched
  })?.value
}

export default getReferType
