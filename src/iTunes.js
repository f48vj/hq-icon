import fetchJsonp from 'fetch-jsonp'

export function expandShortLink (url) {
  return fetch(url, { method: 'HEAD' }).then(res => res.url)
}

export function searchAppById (id, country='US') {
  return fetchJsonp(`https://itunes.apple.com/lookup?id=${id}&country=${country}`).then(res => res.json())
}

export function searchIosApp (term, country='US', limit = 4) {
  return fetchJsonp(`https://itunes.apple.com/search?term=${encodeURI(term)}&country=${country}&entity=software&limit=${limit}`)
        .then(res => res.json())
}

export function searchMacApp (term, country='US', limit = 4) {
  return fetchJsonp(`https://itunes.apple.com/search?term=${encodeURI(term)}&country=${country}&entity=macSoftware&limit=${limit}`)
        .then(res => res.json())
}
