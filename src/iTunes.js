import fetchJsonp from 'fetch-jsonp'

export function expandShortLink (url) {
  return fetch(url, { method: 'HEAD' }).then(res => res.url)
}

export function searchAppById (id) {
  return fetchJsonp(`https://itunes.apple.com/lookup?id=${id}`).then(res => res.json())
}

export function searchIosApp (term, limit = 4) {
  return fetchJsonp(`https://itunes.apple.com/search?term=${encodeURI(term)}&entity=software&limit=${limit}`)
        .then(res => res.json())
}

export function searchMacApp (term, limit = 4) {
  return fetchJsonp(`https://itunes.apple.com/search?term=${encodeURI(term)}&entity=macSoftware&limit=${limit}`)
        .then(res => res.json())
}
