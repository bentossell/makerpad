let userSlug = getUserFromUrl()
populateUser()
let userUsers = []

$().ready(async () => {
  userSlug = getUserFromUrl()
  let isFollowed = await userFollowsUser(userSlug)
  if (isFollowed.followed == true) {
    $('.follow-user-button').hide()
    $('.unfollow-user-button').show()
  }
  getUserUsers()
})

function getUserFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

$('#wf-form-Recommendation').submit(function (event) {
  event.preventDefault()
  recommendUser(getUserFromUrl())
})

$('.follow-user-button').click(function (event) {
  followUser(getUserFromUrl())
})

$('.unfollow-user-button').click(function (event) {
  followUser(getUserFromUrl(), true)
})

async function getUser() {
  let user = {}
  // let userId = new URLSearchParams(window.location.search).get('user')

  if (userId) USERS.doc(userId).get()
    .then(doc => {
      user = doc.data()
      $('#username').text(user.name)
      $('.user-image').attr("src", user.profileImage).show()
      console.log(user)
    })
    .catch(error => console.log(error))

  // or search
  if (userId) searchUserBySlug(getUserFromUrl())
}

function getUserUsers() {
  USER_USER.get()
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

function searchUserBySlug(slug) {
  return USERS.where("username", "==", slug).limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
      return true
    })
    .catch(error => console.log(error))
}

function recommendUser(user) {
  if (user === firebaseUser.username) return
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    targetUser: user,
    recommended: true
  }, { merge: true })
    .then(() => console.log('user recommended'))
    .catch(error => console.log(error))
}

function followUser(user, reverse) {
  if (user === firebaseUser.username) return console.log("Can't follow yourself")
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

function userFollowsUser(id) {
  return USER_USER
    .where("userId", "==", currentUser.id)
    .where("targetUser", "==", id)
    .where("followed", "==", true)
    .limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
      return snapshot.docs[0].data()
    })
    .catch(error => console.log(error))
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

function populateUser() {
  userSlug = getUserFromUrl()
  if (userSlug) {
    U.doc(userSlug).get().then(doc => {
      if (!doc.exists) return
      let userProfile = doc.data()
      console.log(userProfile)
      $('.user-full-name').text(userProfile['full-name'])
      $('.user-username').text('@' + userProfile.slug)
      // CHANGE THIS!
      $('.user-bio').text(userProfile.bio)
      $('.user-location').text(userProfile.location)
      $('.user-twitter').attr('href', userProfile['twitter-url'])
      $('.user-website').attr('href', userProfile['website-url'])
      $('.user-newsletter').attr('href', userProfile.newsletter)
      $('.user-youtube').attr('href', userProfile['youtube-channel'])
    })

    populateProjects()
    populateTutorials()
    populateCompanies()
  }
}

async function populateCompanies() {
  $('.tools-followed').empty()
  let items = await getUserCollection(USER_COMPANY)
  console.log(items)
  if (!items) return console.log('no items found')

  for (item of items) {
    let company = item.company
    $('.tools-followed').append(`
      <div id="w-node-28d9c17ddbae-b8840649" data-tutorial="${company.companyId}" class="div-block-917 user-tool-list">
        <div class="div-block-167"><img width="40"
            src="${company.logo.url}" alt="${company.name}"
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
        <div id="w-node-e994fcca9107-b8840649" class="info-text tool-followers">${1} followers</div>
        <div id="w-node-de18e761f3d1-b8840649" class="info-text tool-review-count">${1} reviews</div>
        <a id="w-node-99eeb6584ca7-b8840649" href="https://www.makerpad.co/company/${company.slug}" class="profile-button tool-profile-link w-button">
          Company Profile
        </a>
      </div>
      `)

    $('.tools-condensed').append(`
       <a href="https://www.makerpad.co/company/${company.slug}" class="user-tool tool-img w-inline-block">
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
    $('.tutorial-watchlist').append(`
      <div id="w-node-7fb832c002a6-b8840649" data-tutorial="${tutorial.tutorialId}" class="div-block-917 user-tutorial-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <a href="https://makerpad.co/tutorial/${tutorial.slug}">
              <h4 class="heading-259 tutorial-name">${tutorial.name}</h4>
            </a>
          </div>
        </div>
        <div></div>
        <div id="w-node-463d8f97bb89-b8840649">
          <div data-ms-content="profile" class="dashboard-component save-complete">
            <button stlyle="display:none;" class="cc-mark-as-complete cc-unchecked w-inline-block">
              <div>Mark as complete</div>
            </button>
            <button class="cc-mark-as-complete cc-checked w-inline-block">
                Completed (
                <span class="cc-completed-counter">${tutorial.completed}</span>
                )
            </button>
          </div>
        </div>
      </div>`)
  }
}

async function populateProjects() {
  $('.user-projects').empty()
  let items = await getUserCollection(PROJECTS)
  console.log(items)
  if (!items) return

  for (item of items) {
    let project = item
    $('.user-projects').append(`
      <a href="https://makerpad.co/p/${project.slug}" class="user-project w-inline-block" data-project="${project.slug}">
        <img
          src="${project.imageUrl}"
          alt="${project.name}"
          class="image-175 project-image" />
        <h5 class="project-heading">${project.name}</h5>
      </a>`)
  }
}