async function renderCompanies(target, items) {
  for (item of items) {
    let company = item.company
    let record = firebaseCollections['company'].find(item => item.slug === company.slug)
    if (record && record.likes) company.likes = record.likes
    company.reviews = 0
    let logo = (company.logo && company.logo.url) ? company.logo.url : ""
    $(target).append(`
      <div id="w-node-28d9c17ddbae-b8840649" data-company="${company.companyId}" class="div-block-917 user-tool-list">
        <div class="div-block-167"><img width="40"
            src="${logo}" alt="${company.name}"
            class="image-37 tool-img">
          <div class="div-block-168 vertical">
            <div class="div-block-169">
              <h4 class="heading-259 tool-name">${company.name}</h4>
              ${company.verified ? `<img
                src = "https://assets-global.website-files.com/5c1a1fb9f264d636fe4b69fa/5cc1f1edad50d9c97c425e83_check-badge%20copy%202.svg"
                width = "15" tooltipster = "top" alt = "" class= "image-41 tool-verified tooltipstered" >` : ''}
            </div>
            <div class="text-block-438 tool-tagline">${company.tagline}</div>
          </div>
        </div>
        <div id="w-node-e994fcca9107-b8840649" class="info-text tool-followers">${company.likes ? company.likes : ''}</div>
        <div id="w-node-de18e761f3d1-b8840649" class="info-text tool-review-count">${company.reviews ? company.reviews : ''}</div>
        <a id="w-node-99eeb6584ca7-b8840649" href="/company/${company.slug}" class="profile-button tool-profile-link w-button">
          Company Profile
        </a>
      </div>
      `)

    $('.tools-condensed').append(`
       <a href="/company/${company.slug}" class="user-tool tool-img w-inline-block">
         <img src="${company.logo.url}" width=40/>
       </a>
      `)
  }
}

async function renderTutorials(items) {
  for (item of items) {
    let tutorial = item.tutorial
    console.log(item)
    let target = item.completed ? '#tutorials-completed' : '#tutorials-saved'
    $(target).append(`
      <div id="w-node-7fb832c002a6-b8840649" data-tutorial="${item.tutorialId}" class="div-block-917 user-tutorial-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <a href="/tutorial/${tutorial.slug}" class="tutorial-list-link">
              <h4 class="heading-259 tutorial-name">${tutorial.name}</h4>
            </a>
          </div>
        </div>
        <div class="tutorial-tools-${tutorial.slug}">

        </div>
        <div id="w-node-463d8f97bb89-b8840649" class="current-user-content">
          <div data-ms-content="profile" class="dashboard-component save-complete current-user-content">
            <button onclick="markTutorialComplete('${tutorial.slug}')" class="cc-mark-as-complete cc-unchecked w-inline-block">
              <span>Mark as complete</span>
            </button>
            <button onclick="markTutorialComplete('${tutorial.slug}', true)" class="cc-mark-as-complete cc-checked w-inline-block">
              Completed
            </button>
          </div>
        </div>
      </div>`
    )

    if (userCompletedTutorial(tutorial.slug)) {
      $(`[data-tutorial="${tutorial.slug}"] .cc-mark-as-complete.cc-checked`).show()
      $(`[data-tutorial="${tutorial.slug}"] .cc-mark-as-complete.cc-unchecked`).hide()
    } else {
      $(`[data-tutorial="${tutorial.slug}"] .cc-mark-as-complete.cc-checked`).hide()
      $(`[data-tutorial="${tutorial.slug}"] .cc-mark-as-complete.cc-unchecked`).show()
    }

    if (tutorial.tools_used) {
      tutorial.tools_used.forEach(item => {
        let company = firebaseCollections['company'].find(com => com.slug === item)
        $(`.tutorial-tools-${tutorial.slug}`).append(`
          <a href="/company/${item}" class="user-tool tool-img w-inline-block">
            <img src="${company.logo ? company.logo.url : ''}" width="40/">
          </a>
          `)
      })
    }

    if (thisIsMyUser()) {
      $('.current-user-content').show()
    } else {
      $('.current-user-content').hide()
    }
  }
}

async function renderWorkflows(target, items) {
  for (item of items) {
    if (item.userId !== currentUser.id && item.publicity === 'private') continue
    console.log(item)
    // let target = item.status === 'public' ? '#tutorials-completed' : '#tutorials-saved'
    $(target).append(`
      <div id="w-node-7fb832c002a6-b8840649" data-workflow=${item.id} class="div-block-917 user-tutorial-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <a href="/workflows?id=${item.id}" class="tutorial-list-link">
              <h4 class="heading-259 tutorial-name">${item.name}</h4>
            </a>
          </div>
        </div>
        <div class="tutorial-tools-${item.id}">

        </div>
      </div>`
    )

    if (item.tags) {
      item.tags.forEach(tag => {
        let company = firebaseCollections['company'].find(com => com.slug === tag)
        if (company) {
          $(`.tutorial-tools-${item.id}`).append(`
            <a href="/company/${tag}" class="user-tool tool-img w-inline-block">
              <img src="${company.logo ? company.logo.url : ''}" width="40/">
            </a>
            `)
        }
      })
    }
  }
}

