const getReferValue = (data, referValue?) => {
  // Global+, referType为seller
  if (data?.is_mkpl) {
    return `${data?.vender_info_view?.vender_id}`
  }
  return referValue || ''
}

export default getReferValue
