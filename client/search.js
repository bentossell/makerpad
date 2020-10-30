populateSearch()

const images = {
  tutorials: `https://assets-global.website-files.com/5c1a1fb9f264d636fe4b69fa/5f60991182328e6d706206a6_streamline-icon-filter-camera%40140x140.svg`,
  tools: `https://assets-global.website-files.com/5c1a1fb9f264d636fe4b69fa/5f60991382328e25096206c5_streamline-icon-tools-wench-screwdriver%40140x140.svg`,
  workflows: `https://assets-global.website-files.com/5c1a1fb9f264d636fe4b69fa/5f770570f32ef9e8c62bc149_streamline-icon-data-transfer%40140x140.svg`,
  projects: `https://assets-global.website-files.com/5c1a1fb9f264d636fe4b69fa/5f609913e89fbb907f897f6d_streamline-icon-app-window-star%40140x140.svg`
}

function iconMarkup(option) {
  return `<img src="${option}" style="height: 16px; width: 16px; margin-right: 8px; margin-left:10px" alt="" class="icon"></img>`
}

function populateSearch() {
  populateSearchArray().then(() => {
    createTypeahead('.typeahead', searchArray)
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
      source: source,
      templates: {
        header: `<a class="dropdown-link w-inline-block dropdown-title" href="/marketplace">
        <img src="${images.tools}" style="height: 20px; width: 20px; margin-right: 8px; margin-left:10px" alt="" class="icon">Tools
        </a>`,
        suggestion: function (data) {
          return `<a class="nav-link-details-2" href="/${data.link}">${data.label}</a>`
        }
      }
    },
    {
      name: 'tutorials',
      display: 'label',
      source: tutorials,
      templates: {
        header: `<a class="dropdown-link w-inline-block dropdown-title" href="/tutorials"><img src="${images.tutorials}" style="height: 20px; width: 20px; margin-right: 8px; margin-left:10px" alt="" class="icon">Tutorials</a>`,
        suggestion: function (data) {
          return `
          <a class="nav-link-details-2" href="/${data.link}">${data.label}</a>`
        }
      }
    },
    {
      name: 'projects',
      display: 'label',
      source: projects,
      templates: {
        header: `<a class="dropdown-link w-inline-block dropdown-title" href="/projects"><img src="${images.projects}" style="height: 20px; width: 20px; margin-right: 8px; margin-left:10px" alt="" class="icon">Projects</a>`,
        suggestion: function (data) {
          return `
          <a class="nav-link-details-2" href="/${data.link}">
          ${data.label}
          </a>`
        }
      }
    },
    {
      name: 'workflows',
      display: 'label',
      source: workflows,
      templates: {
        header: `<a class="dropdown-link w-inline-block dropdown-title" href="/workflows"><img src="${images.workflows}" style="height: 20px; width: 20px; margin-right: 8px; margin-left:10px" alt="" class="icon">Workflows</a>`,
        suggestion: function (data) {
          return `<a class="nav-link-details-2" href="/${data.link}">${data.label}</a>`
        }
      }
    })

  $('.twitter-typeahead').on('keyup', function (e) {
    if (e.which == 13) {
      try { document.querySelector('.tt-suggestion').click() } catch { }
    }
  })
  console.log('Typeahead done')
}