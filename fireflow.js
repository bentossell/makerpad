var Fireflow = function () {
  auth()
  var db = firebase.firestore()
  var auth = firebase.auth()
  console.log('Fireflow init')

  var event = new Event('fireflow-ready')
  document.dispatchEvent(event)

  var Colls = document.querySelectorAll("[data-fireflow-collection]")
  var start = performance.now()

  var sampleQueryElements = {
    sample: '[data-fireflow-sample]',
    field: '[data-fireflow-field]',
    href: '[data-fireflow-href]'
  }

  populateCollectionLists()

  function populateCollectionLists() {
    test()
    Colls.forEach(function (el) {

      db.collection(el.dataset.fireflowCollection).limit(5).get()
        .then(function (snap) {
          time('query done')
          return snapshotToHTML(snap, el)
        })
        .catch(function (e) { handleError(e) })
    })
  }

  function test() {
    var el = document.querySelector('#data-fireflow-test')
    firebase.firestore().collection('users').limit(15).get()
      .then(function (snap) {
        snapshotToHTML(snap, el)
      })
      .catch(function (e) { console.error(e) })
  }

  function snapshotToHTML(snap, target) {
    console.log(snap.size + ' docs to ' + target)
    var sample = processSample(target)

    if (!snap) return handleError('No snapshot detected')
    if (!sample) return handleError('No sample element detected')
    if (snap.size == 0) return handleError('No documents')

    if (snap && snap.docs) {
      return snap.docs.forEach(function (doc) { populateData(target, doc, sample) })
      time('done')
    }
  }

  function processSample(target) {
    var sample = target.querySelector(sampleQueryElements.sample) || null
    if (!sample) return null
    var clone = sample.cloneNode(true)
    sample.classList.add('fireflow-hide')
    sample.style.display = 'none'
    console.log(clone)
    return clone
  }

  function populateData(el, doc, sample) {
    var $id = doc.id
    var data = doc.data()

    sample.querySelectorAll("[data-fireflow-field], [data-fireflow-href]").forEach(function (f) {
      var n = f.nodeName

      var val = data[f.dataset.fireflowField]
      var href = f.dataset.fireflowHref

      if (!val) val = data[f.dataset.fireflowFallback]
      if (!val && !href) return

      if (!['IMG', 'A'].includes(n)) f.innerText = val
      if (n === 'IMG') f.src = val
      if (n === 'A') {
        f.href = parseVariable(href, [$id])
      }
    })

    el.appendChild(sample.cloneNode(true))
  }

  function auth() {
    return true || console.error('Fireflow authentication failed')
  }

  function handleAuth() {

  }

  function time(msg) {
    console.log(msg + ": " + (Math.round(performance.now() - start)) + 'ms')
    start = performance.now()
  }

  function filter(q, el) {

  }

  function parseVariable(str, data) {
    return str.replace(/\{\{(.+?)\}\}/g, function (match) {
      return data.shift().toLowerCase() || match
    })
  }

  function handleError(e) {
    console.error(e)
  }
}

Fireflow()