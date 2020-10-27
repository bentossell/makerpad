populateSearch()

function populateSearch() {
  populateSearchArray().then(() => {
    createTypeahead('.typeahead', searchArray)
  })
}

async function populateSearchArray() {
  return db.collection('SEARCH').doc('_index').get().then(doc => {
    searchArray = [].concat(...Object.values(doc.data()))
  })
}

function createTypeahead(selector, local) {
  if (!selector) selector = '.typeahead'
  if (!local) local = searchArray
  console.log('creating Typeahead')
  var source = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('searchString'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: local.filter(item => item.type === 'company'),
    // limit: 15
    // filter: function (data) {
    //   return $.map(data, function (item) {
    //     return {
    //       'value': item.value
    //     }
    //   })
    // }
  })
  var tutorials = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('searchString'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: local.filter(item => item.type === 'tutorial')
  })
  var projects = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('searchString'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: local.filter(item => item.type === 'project')
  })
  var workflows = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('searchString'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: local.filter(item => item.type === 'workflow')
  })

  $(selector).typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
    {
      name: 'companies',
      display: 'label',
      // limit: 5,
      source: source,
      templates: {
        header: '<a class="dropdown-link w-inline-block dropdown-title" href="/marketplace">Tools</a>',
        suggestion: function (data) {
          return `<a class="dropdown-link w-inline-block" href="/${data.link}">${data.label}</a>`
        }
      }
    },
    {
      name: 'tutorials',
      display: 'label',
      // limit: 5,
      source: tutorials,
      templates: {
        header: '<a class="dropdown-link w-inline-block dropdown-title" href="/tutorials">Tutorials</a>',
        suggestion: function (data) {
          return `<a class="dropdown-link w-inline-block" href="/${data.link}">${data.label}</a>`
        }
      }
    },
    {
      name: 'projects',
      display: 'label',
      // limit: 5,
      source: projects,
      templates: {
        header: '<a class="dropdown-link w-inline-block dropdown-title" href="/projects">Projects</a>',
        suggestion: function (data) {
          return `<a class="dropdown-link w-inline-block" href="/${data.link}">${data.label}</a>`
        }
      }
    },
    {
      name: 'workflows',
      display: 'label',
      // limit: 5,
      source: workflows,
      templates: {
        header: '<a class="dropdown-link w-inline-block dropdown-title" href="/workflows">Workflows</a>',
        suggestion: function (data) {
          return `<a class="dropdown-link w-inline-block" href="/${data.link}">${data.label}</a>`
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