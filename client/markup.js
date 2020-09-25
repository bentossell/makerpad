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
    console.log(item)
    // let target = item.status === 'public' ? '#tutorials-completed' : '#tutorials-saved'
    let target = '#user-workflows'
    $(target).append(`
      <div id="w-node-7fb832c002a6-b8840649" class="div-block-917 user-tutorial-list">
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

