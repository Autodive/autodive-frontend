const req = require.context('./svg', false, /\.svg$/),
  requireAll = (requireContext) => {
    return requireContext.keys().map(requireContext)
  }
requireAll(req)
