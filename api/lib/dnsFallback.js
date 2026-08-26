const dns = require('dns')

if (process.env.NODE_ENV !== 'production' && !globalThis.__oneMoreRepDnsFallback) {
  globalThis.__oneMoreRepDnsFallback = true

  const fallback = new dns.Resolver()
  fallback.setServers(['8.8.8.8', '1.1.1.1'])

  const originalLookup = dns.lookup

  function resolveWithFallback(hostname, options, callback) {
    fallback.resolve4(hostname, (resolveErr, addresses) => {
      if (resolveErr || !addresses?.length) {
        callback(resolveErr ?? new Error(`DNS lookup failed for ${hostname}`))
        return
      }

      const address = addresses[0]
      if (options.all) {
        callback(null, addresses.map((item) => ({ address: item, family: 4 })))
        return
      }

      callback(null, address, 4)
    })
  }

  dns.lookup = function patchedLookup(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    } else if (typeof options === 'number') {
      options = { family: options }
    }

    options = options ?? {}

    originalLookup.call(dns, hostname, options, (err, address, family) => {
      if (!err) {
        callback(err, address, family)
        return
      }

      if ((options.family ?? 0) === 6) {
        callback(err, address, family)
        return
      }

      resolveWithFallback(hostname, options, (resolveErr, resolvedAddress, resolvedFamily) => {
        if (resolveErr) {
          callback(err, address, family)
          return
        }

        if (options.all) {
          callback(null, resolvedAddress)
          return
        }

        callback(null, resolvedAddress, resolvedFamily)
      })
    })
  }
}
