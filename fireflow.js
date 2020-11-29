var Fireflow = function () {
  auth()
  var db = firebase.firestore()
  console.log('Fireflow init')

  var Colls = document.querySelectorAll(".fireflow-list")
  var start = performance.now()

  populateCollectionLists()

  function populateCollectionLists() {
    Colls.forEach(function (el) {

      var sample = el.querySelector('.fireflow-sample')

      db.collection(el.dataset.fireflowCollection).limit(15).get()
        .then(function (snap) {
          time('query done')
          snap.docs.forEach(function (doc) { return populateData(el, doc, sample) })
          sample.style.display = 'none'
          time('done')
        })
        .catch(function (e) { handleError(e) })
    })
  }

  function populateData(el, doc, sample) {
    var $id = doc.id
    var data = doc.data()

    var clone = sample.cloneNode(true)
    clone.classList.remove('fireflow-sample')
    clone.querySelectorAll("[data-fireflow-field], [data-fireflow-href]").forEach(function (f) {
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

    el.appendChild(clone)
  }

  function auth() {
    return true || console.error('Fireflow authentication failed')
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