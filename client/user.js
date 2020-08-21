var userSlug = getUserFromUrl()
var userUsers = []

$().ready(async () => {
  populateUser()
})

function getUserFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

$('#wf-form-Recommendation').submit(function (event) {
  event.preventDefault()
  recommendUser(userSlug)
})

$('.follow-user-button').click(function (event) {
  followUser(userSlug)
})

$('.unfollow-user-button').click(function (event) {
  followUser(userSlug, true)
})

function getUserUsers() {
  return USER_USER.get()
    .then(snapshot => {
      userUsers = snapshot.docs.map(doc => doc.data())
      console.log(userUsers)

      let followingCount = userUsers.filter(item => item.username === userSlug && item.followed == true).length
      let followedCount = userUsers.filter(item => item.targetUser === userSlug && item.followed == true).length
      console.log(followingCount, followedCount)

      $('.user-followers-count').text(followedCount + ' Followers')
      $('.user-following-count').text(followingCount + ' Following')
    })
}

function recommendUser(user) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'
  if (thisIsMyUser() || !currentUser.id) return
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    targetUser: user,
    recommended: true
  }, { merge: true })
    .then(() => console.log('user recommended'))
    .catch(error => console.log(error))
}

function followUser(user, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'
  if (thisIsMyUser()) return console.log("C'mon, can't follow yourself")
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    targetUser: user,
    followed: reverse ? false : true
  }, { merge: true })
    .then(() => {
      console.log(reverse ? 'user unfollowed' : 'user followed')
      if (reverse) {
        $('.follow-user-button').show()
        $('.unfollow-user-button').hide()
      } else {
        $('.follow-user-button').hide()
        $('.unfollow-user-button').show()
      }
    })
    .catch(error => console.log(error))
}

function thisIsMyUser() {
  return firebaseUser.username === userSlug
}

function getUserCollection(collection) {
  return collection
    .where("username", "==", userSlug)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      return data
    })
    .catch(error => console.log(error))
}

async function populateUser() {
  if (!userSlug) userSlug = getUserFromUrl()
  if (userSlug) {
    U.doc(userSlug).get().then(doc => {
      if (!doc.exists) return
      let userProfile = doc.data()
      console.log(userProfile)
      $('.user-full-name').text(userProfile.name)
      $('.user-username').text('@' + userProfile.slug)
      // CHANGE THIS!
      $('.user-bio').text(userProfile.bio)
      $('.user-location').text(userProfile.location)
      $('.user-twitter').attr('href', userProfile['twitter-url'])
      $('.user-website').attr('href', userProfile['website-url'])
      $('.user-newsletter').attr('href', userProfile.newsletter)
      $('.user-youtube').attr('href', userProfile['youtube-channel'])
    })

    getSampleHTML()
    getUserUsers()

    if (currentUser.id) await getCollections()
    populateTutorials()
    populateCompanies()
    populateProjects()

    if (thisIsMyUser()) {
      $('.current-user-content').show()
    } else {
      $('.current-user-content').hide()
    }

    let isFollowed = await userFollowsUser(getUserFromUrl())
    if (isFollowed) {
      $('.follow-user-button').hide()
      $('.unfollow-user-button').show()
    }

    try {

    } catch (e) { }
  }
}

function getSampleHTML() {
  $('.tools-followed').empty()
  $('.tutorial-watchlist').empty()
  $('.user-projects').empty()
}

async function getCompaniesData() {
  // let userCompanies = await db.collection('user_company')
}

async function populateCompanies() {
  let items = await getUserCollection(USER_COMPANY)
  console.log(items)
  if (!items) return console.log('no items found')

  for (item of items) {
    let company = item.company
    let record = companyCollection.find(item => item.slug === company.slug)
    if (record && record.likes) company.likes = record.likes
    company.reviews = 0
    let logo = (company.logo && company.logo.url) ? company.logo.url : ""
    $('.tools-followed').append(`
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
        <div id="w-node-e994fcca9107-b8840649" class="info-text tool-followers">${company.likes ? company.likes + ' followers' : ''}</div>
        <div id="w-node-de18e761f3d1-b8840649" class="info-text tool-review-count">${company.reviews ? company.reviews + ' reviews' : ''}</div>
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

async function populateTutorials() {
  $('.tutorial-watchlist').empty()
  let items = await getUserCollection(USER_TUTORIAL)
  console.log(items)
  if (!items) return

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
        let company = companyCollection.find(com => com.slug === item)
        $(`.tutorial-tools-${tutorial.slug}`).append(`
          <a href="/company/${item}" class="user-tool tool-img w-inline-block">
            <img src="${company.logo ? company.logo.url : ''}" width="40/">
          </a>
          `)
      })
    }

    if (userSavedTutorial(tutorial.slug)) {

    }

    if (thisIsMyUser()) {
      $('.current-user-content').show()
    } else {
      $('.current-user-content').hide()
    }
  }
}

async function populateProjects() {
  let items = await getUserCollection(PROJECTS)
  console.log(items)
  if (!items) return

  for (item of items) {
    let project = item
    $('.user-projects').append(`
    <div class="project-div" data-project="${project.slug}">
      <a href="/p/${project.slug}" class="user-project w-inline-block">
        <img
          src="${project.imageUrl}"
          alt="${project.name}"
          class="image-175 project-image" />
      </a>
      <div class="div-block-924 project-div-footer">
        <a href="/p/${project.slug}" class="user-project project-text"
          <h5 class="project-heading">${project.name}</h5>
        </a>
        <div>
        <button onclick="followProject('${project.slug}')" class="like-button like-project-button w-button"></button>
        <button onclick="followProject('${project.slug}', true)" class="like-button unlike-project-button w-button hidden"></button>
        </div>
      </div>
    </div>`)

    if (userLikesProject(project.slug)) {
      $(`[data-project="${project.slug}"] .unlike-project-button`).show()
      $(`[data-project="${project.slug}"] .like-project-button`).hide()
    } else {
      $(`[data-project="${project.slug}"] .unlike-project-button`).hide()
      $(`[data-project="${project.slug}"] .like-project-button`).show()
    }

    // $('.project-heading').text(project.name)
    // $('.project-image').attr('src', project.imageUrl)
    // $('.user-project').attr('href', `/p/${project.slug}`)
  }
}