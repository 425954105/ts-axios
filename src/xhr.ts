import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'

import { parseHeaders } from './helpers/headers'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { data = null, url, method = 'get', headers, responseType, timeout } = config

    const request = new XMLHttpRequest()
    if (responseType) {
      request.responseType = responseType
    }

    request.open(method.toUpperCase(), url, true)
    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) {
        return
      }
      // const responseHeaders = request.getAllResponseHeaders()
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData = responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      resolve(response)
    }
    request.onerror = function handleError() {
      reject(new Error('NetWork Error'))
    }
    if (timeout) {
      request.timeout = timeout
    }

    request.ontimeout = function handleTimeout() {
      reject(new Error(`Timeout of ${timeout} ms exceeded`))
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    request.send(data)
  })
}
