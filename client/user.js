let userSlug = getUserFromUrl()
populateUser()

$().ready(async () => {
  let isFollowed = await userFollowsUser(userSlug)
  if (isFollowed.followed == true) {
    $('.follow-user-button').hide()
    $('.unfollow-user-button').show()
  }
})

function getUserFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

$('#wf-form-Editing-Profile').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  updateUser(data)
})

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

async function updateUser(data) {
  if (await searchUserBySlug(data.username) == false) {
    return USERS.doc(currentUser.id).set({
      user: currentUser.id,
      ...data
    })
      .then(() => {
        let image = $('#profile-pic')[0].files[0] || null
        if (image) {
          console.log(image)
          storage
            .ref()
            .child(`profile_pictures/${data.username}`)
            .put(image)
          // store memberstack redundantly for now
          storage
            .ref()
            .child(`memberstack_pictures/${currentUser.id}`)
            .put(image)
        }
        // METADATA
        handleSuccess('User updated')
        $('#wf-form-Editing-Profile')[0].reset()
      })
      .catch(error => handleError(error))
  } else {
    return handleError('Username already exists')
  }
}

function searchUserBySlug(slug) {
  return USERS.where("slug", "==", slug).limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
      return true
    })
    .catch(error => console.log(error))
}

function recommendUser(user) {
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    recommendedUser: user,
    recommended: true
  }, { merge: true })
    .then(() => console.log('user recommended'))
    .catch(error => console.log(error))
}

function followUser(user, reverse) {
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    followedUser: user,
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
  return USER_TUTORIAL
    .where("userId", "==", currentUser.id)
    .where("followedUser", "==", id)
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
      <div id="w-node-28d9c17ddbae-b8840649" class="div-block-917 user-tool-list">
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
      <div id="w-node-7fb832c002a6-b8840649" class="div-block-917 user-tutorial-list">
        <div class="div-block-167">
          <div class="div-block-169">
            <h4 class="heading-259 tutorial-name">${tutorial.name}</h4>
          </div>
        </div>
        <div></div>
        <div id="w-node-463d8f97bb89-b8840649">
          <div data-ms-content="profile" class="dashboard-component save-complete">
            <button class="cc-mark-as-complete cc-unchecked w-inline-block">
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
      <a href="#" class="user-project w-inline-block">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/makerpad-94656.appspot.com/o/project_images%2F${project.slug}?alt=media&token=e54eebb6-e1cc-4e33-ba7e-e60365ff6420"
          alt="${project.name}"
          class="image-175 project-image" />
        <h5 class="project-heading">${project.name}</h5>
      </a>`)
  }
}