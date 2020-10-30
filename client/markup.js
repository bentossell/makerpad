async function renderCompanies(target, items) {
  for (item of items) {
    let company = item.company
    let record = firebaseCollections['company'].find(item => item.slug === company.slug)
    if (record && record.likes) company.likes = record.likes
    company.reviews = 0
    let logo = (company.logo && company.logo.url) ? company.logo.url : ""
    $(target).append(`
      <div data-company="${company.companyId}" class="div-block-917 user-tool-list">
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
    let target = item.completed ? '#tutorials-completed' : '#tutorials-saved'
    $(target).append(`
      <div data-tutorial="${item.tutorialId}" class="div-block-917 user-tutorial-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <a href="/tutorial/${tutorial.slug}" class="tutorial-list-link">
              <h4 class="heading-259 tutorial-name">${tutorial.name}</h4>
            </a>
          </div>
        </div>
        <div class="tutorial-tools-${tutorial.slug}">

        </div>
        <div class="current-user-content">
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

    // if (thisIsMyUser()) {
    //   $('.current-user-content').show()
    // } else {
    //   $('.current-user-content').hide()
    // }
  }
}

async function renderReviews(target, items) {
  for (item of items) {
    $(target).append(`
      <div class="div-block-917 tool-review-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <h4 class="heading-259 review-text">${item.review}</h4>
          </div>
        </div>
        ${userElement(item)}
      </div>`
    )
  }
}

async function renderWorkflows(target, items) {
  for (item of items) {
    if (item.userId !== currentUser.id && item.publicity === 'private') continue
    $(target).append(`
        <div class="div-block-917 user-workflow-list _4-column bottom-border" data-workflow="${item.id}">
          <div class="div-block-167">
            <div class="div-block-169">
              ${item.publicity === 'private' ? `<div class="private-workflow">🔐</div>` : ``}
              <a href="/workflows?id=${item.id}" class="workflow-list-link w-inline-block">
                <h4 class="heading-259 workflow-name">${item.name}</h4>
              </a>
            </div>
          </div>

          <div class="div-block-914 tools-condensed">

          </div>

          ${userElement(item, false)}
          
          <div class="current-user-content" style="display: block;">
            <div class="div-block-925">
              <a href="#" onclick="likeWorkflow('${item.id}')" class="like-button like-workflow-button w-button"></a>
              <a href="#" onclick="likeWorkflow('${item.id}', true)" class="hidden like-button unlike-workflow-button w-button"></a>
              <a href="#" onclick="cloneWorkflow('${item.id}')" target="_blank" class="hidden clone-workflow tippy w-button">
                <span class="button-icon-text">Clone</span>
              </a>
              <a href="#" onclick="saveWorkflow('${item.id}')" target="_blank" class="save-workflow tippy w-button">
                <span class="button-icon-text">Save</span>
              </a>
              <a href="#" onclick="saveWorkflow('${item.id}', true)" target="_blank" class="hidden unsave-workflow w-button">
                <span class="button-icon-text">Saved</span>
              </a>
            </div>
          </div>
        </div>`
    )

    if (userLikesWorkflow(item.id)) {
      $(`[data-workflow="${item.id}"] .unlike-workflow-button`).show()
      $(`[data-workflow="${item.id}"] .like-workflow-button`).hide()
    } else {
      $(`[data-workflow="${item.id}"] .unlike-workflow-button`).hide()
      $(`[data-workflow="${item.id}"] .like-workflow-button`).show()
    }

    if (userSavedWorkflow(item.id)) {
      $(`[data-workflow="${item.id}"] .unsave-workflow`).show()
      $(`[data-workflow="${item.id}"] .save-workflow`).hide()
    } else {
      $(`[data-workflow="${item.id}"] .unsave-workflow`).hide()
      $(`[data-workflow="${item.id}"] .save-workflow`).show()
    }

    if (item.tags) {
      $(`[data-workflow="${item.id}"] .tools-condensed`).empty()
      item.tags.forEach(tag => {
        let company = firebaseCollections['company'].find(com => com.slug === tag)
        if (company) {
          $(`[data-workflow="${item.id}"] .tools-condensed`).append(`
            <a href="/company/${tag}" class="user-tool tool-img w-inline-block">
              <img src="${company.logo ? company.logo.url : ''}" width="40/">
            </a>
            `)
        }
      })
    }

    if (firebaseUser.username) {
      $('.current-user-content').show()
    } else {
      $('.current-user-content').hide()
    }
  }
}

function userElement(item, showName = true) {
  let userImage = getUserImage(item.user)
  return `
    <a href="/u/${item.username}" class="link-block-73 workflow-user-link w-inline-block"><img
      src="${userImage}" alt="${item.username}"
      class="image-179 workflow-user-avatar">
      <div class="text-block-441 workflow-user-full-name ${showName ? '' : 'hidden'}">${item.user['full-name']}</div>
    </a>`
}

async function getRandomUsers() {
  let randomNumber = (Math.floor(Math.random() * 1100))
  let items = await USERS
    .orderBy('username')
    .startAt(randomNumber)
    .limit(300)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
  items = items.filter(i => getUserImage(i) !== 'https://w5insight.com/wp-content/uploads/2014/07/placeholder-user-400x400.png')
  renderUsers('.random-users', items)
  let random10 = Math.floor(Math.random() * items.length)
  let pick10 = items.slice(random10, random10 + 10)
  console.log(pick10)
  $('.div-block-932').empty()
  pick10.forEach(item => {
    let profileImage = getUserImage(item)
    if (profileImage === 'https://w5insight.com/wp-content/uploads/2014/07/placeholder-user-400x400.png') return
    $('.div-block-932').append(`
      <a href="/u/${item.username}" class="link-block-74 w-inline-block">
        <img src="${profileImage}" alt=""
          class="directory-user-image">
      </a>
    `)
  })
}

