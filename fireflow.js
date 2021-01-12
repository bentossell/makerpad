!function () {
  var e = firebase.firestore()
  firebase.auth(), console.log("Fireflow init")
  var o = new Event("fireflow-ready")
  document.dispatchEvent(o)
  var o = document.querySelectorAll("[data-fireflow-collection]"), t = performance.now(), l = {
    sample: "[data-fireflow-sample]",
    field: "[data-fireflow-field]",
    href: "[data-fireflow-href]"
  }
  function r(e, r) {
    console.log(e.size + " docs to " + r)
    var n = function (e) {
      var o = e.querySelector(l.sample) || null
      if (!o) return null
      e = o.cloneNode(!0)
      return o.classList.add("fireflow-hide"), o.style.display = "none", console.log(e),
        e
    }(r)
    return e ? n ? 0 == e.size ? f("No documents") : e && e.docs ? e.docs.forEach(function (e) {
      var o, t, l, f
      o = r, t = n, l = (e = e).id, f = e.data(), t.querySelectorAll("[data-fireflow-field], [data-fireflow-href]").forEach(function (e) {
        var o, t = e.nodeName, r = f[e.dataset.fireflowField], n = e.dataset.fireflowHref;
        ((r = r || f[e.dataset.fireflowFallback]) || n) && (["IMG", "A"].includes(t) || (e.innerText = r),
          "IMG" === t && (e.src = r), "A" === t && (e.href = (o = [l], n.replace(/\{\{(.+?)\}\}/g, function (e) {
            return o.shift().toLowerCase() || e
          }))))
      }), o.appendChild(t.cloneNode(!0))
    }) : void 0 : f("No sample element detected") : f("No snapshot detected")
  }
  function n(e) {
    console.log(e + ": " + Math.round(performance.now() - t) + "ms"), t = performance.now()
  }
  function f(e) {
    console.error(e)
  }
  (function () {
    var o = document.querySelector("#data-fireflow-test")
    firebase.firestore().collection("users").limit(15).get().then(function (e) {
      r(e, o)
    }).catch(function (e) {
      console.error(e)
    })
  })(), o.forEach(function (o) {
    e.collection(o.dataset.fireflowCollection).limit(5).get().then(function (e) {
      return n("query done"), r(e, o)
    }).catch(function (e) {
      f(e)
    })
  })
}();