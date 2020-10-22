populateSearch()

function populateSearch() {
  getTags().then(() => {
    createTypeahead('.typeahead')
  })
}

function createTypeahead(selector) {
  if (!selector) selector = '.typeahead'
  console.log('creating Typeahead')
  var source = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: searchArray,
    // filter: function (data) {
    //   return $.map(data, function (item) {
    //     return {
    //       'value': item.value
    //     }
    //   })
    // }
  })
  source.initialize()

  $(selector).typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'search',
    // display: 'value',
    source: source,
    templates: {
      suggestion: function (data) {
        return `<a class="dropdown-item" href="/${data.type}/${data.value}">${data.value}</a>`
      }
    }
  })

  $('.twitter-typeahead').on('keyup', function (e) {
    if (e.which == 13) {
      //window.location.href='1'
      try { document.querySelector('.tt-suggestion').click() } catch { }
    }
  })
}