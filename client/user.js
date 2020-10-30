var userSlug = getElementFromURL()
var userUsers = []

$().ready(async () => {
  populateUser()
  let body = {
    userId: currentUser.id || null,
    targetUser: userSlug,
    created_at: new Date()
  }
  $('.sponsor').click(() => {
    return db.collection('click_log').add({
      ...body,
      type: 'sponsor',
    })
  })
  $('.hire').click(() => {
    return db.collection('click_log').add({
      ...body,
      type: 'hire',
    })
  })
})

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

      let followingCount = userUsers.filter(item => item.username === userSlug && item.followed == true).length
      let followedCount = userUsers.filter(item => item.targetUser === userSlug && item.followed == true).length
      console.log(followingCount, followedCount)

      $('.user-followers-count').text(followedCount + ' Followers')
      $('.user-following-count').text(followingCount + ' Following')
    })
}

function recommendUser(user) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'
  if (thisIsMyUser(userSlug) || !currentUser.id) return
  return USER_USER.doc(`${currentUser.id}-${user}`).set({
    userId: currentUser.id,
    targetUser: user,
    recommended: true
  }, { merge: true })
    .catch(error => console.log(error))
}

function followUser(user, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'
  if (thisIsMyUser(userSlug)) return console.log("C'mon, can't follow yourself")
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

function getUserCollection(collection) {
  return collection
    .where("username", "==", userSlug)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => {
        return { ...doc.data(), id: doc.id }
      })
      return data
    })
    .catch(error => console.log(error))
}

async function populateUser() {
  if (!userSlug) userSlug = getElementFromURL()
  if (userSlug) {
    U.doc(userSlug).get().then(doc => {
      if (!doc.exists) return
      let userProfile = doc.data()
      $('.user-full-name').text(userProfile.name)
      $('.user-username').text('@' + userProfile.slug)
      // CHANGE THIS!
      $('.user-bio').text(userProfile.bio)
      $('.user-location').text(userProfile.location)
      $('.user-twitter').attr('href', userProfile['twitter-url'])
      $('.user-website').attr('href', userProfile['website-url'])
      $('.user-newsletter').attr('href', userProfile.newsletter)
      $('.user-youtube').attr('href', userProfile['youtube-channel'])

      let userImage = getUserImage(userProfile)

      if (userImage) {
        $('.user-image').attr("src", userImage)
        $('.user-image').removeClass('w-dyn-bind-empty')
      }

      if (userProfile.sponsor) {
        $('.sponsor').attr('href', userProfile.sponsor).show()
      }
      if (userProfile.hire) {
        $('.hire').attr('href', userProfile.hire).show()
      }
    })

    getSampleHTML()
    getUserUsers()

    await getCollections()
    populateProjects()
    populateWorkflows()
    populateTutorials().then(() => {
      if (thisIsMyUser(userSlug)) {
        $('.current-user-content').show()
        $('.follow-user-button').hide()
      } else {
        $('.current-user-content').hide()
        $('.alert-watchlist, .alert-tools, .alert-projects').hide()
      }
    })
    populateCompanies()


    let isFollowed = await userFollowsUser(getElementFromURL())
    if (await userFollowsUser(getElementFromURL())) {
      $('.follow-user-button').hide()
      $('.unfollow-user-button').show()
    }

    try {

    } catch (e) { }
  }
}

function getSampleHTML() {
  if (!debugMode) $('.tools-followed, .tutorial-watchlist, .user-projects, #user-workflows').empty()
}

async function populateCompanies() {
  let items = await getUserCollection(USER_COMPANY)
  if (!items.length) {
    // $('[data-w-tab="Projects"]').hide()
    return $('[data-w-tab="Watchlist"]').click()
  }
  $('.alert-tools').hide()

  renderCompanies('.tools-followed', items)
}

async function populateTutorials() {
  let items = await getUserCollection(USER_TUTORIAL)
  console.log(items)
  if (!items.length) {
    // $('[data-w-tab="Watchlist"]').hide()
    return
  }
  $('.alert-watchlist').hide()
  renderTutorials(items)
}

async function populateProjects() {
  let items = await getUserCollection(PROJECTS)
  console.log(items)
  if (!items.length) {
    // $('[data-w-tab="Projects"]').hide()
    return $('[data-w-tab="Workflows"]').click()
  }
  $('.alert-projects').hide()
  renderProjects('.user-projects', items)
}

async function populateWorkflows() {
  let items = await getUserCollection(WORKFLOWS)
  console.log(items)
  if (!items.length) {
    $('[data-w-tab="Workflows"]').hide()
    return $('[data-w-tab="Tools"]').click()
  }
  renderWorkflows('#user-workflows', items, 2)
}