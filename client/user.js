var userSlug = getElementFromURL()

$().ready(async () => {
  if (!debugMode) $('.tools-followed, .tutorial-watchlist, .user-projects, #user-workflows').empty()
  if (thisIsMyUser(userSlug)) {
    $('.current-user-content, .follow-user-button').toggle()
    $('.alert-watchlist, .alert-tools, .alert-projects, .current-user-content').show()
  } else {
    $('.alert-watchlist, .alert-tools, .alert-projects, .current-user-content').hide()
  }
  populateUser()
})

function logClick(type) {
  return db.collection('click_log').add({
    userId: currentUser.id || null,
    targetUser: userSlug,
    type,
    created_at: new Date()
  })
}

$('.sponsor').click(() => logClick('sponsor'))
$('.hire').click(() => logClick('hire'))
$('.follow-user-button').click(() => followUser(userSlug))
$('.unfollow-user-button').click(() => followUser(userSlug, true))

function getUserUsers() {
  return USER_USER.get()
    .then(snapshot => {
      let userUsers = snapshot.docs.map(doc => doc.data())

      $('.user-followers-count').text(userUsers.filter(item => item.targetUser === userSlug && item.followed == true).length + ' Followers')
      $('.user-following-count').text(userUsers.filter(item => item.username === userSlug && item.followed == true).length + ' Following')
    })
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
      $('.follow-user-button, .unfollow-user-button').toggle()
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
      $('.user-bio').text(userProfile.bio)
      $('.user-location').text(userProfile.location)
      $('.user-twitter').attr('href', userProfile['twitter-url'])
      $('.user-website').attr('href', userProfile['website-url'])
      $('.user-newsletter').attr('href', userProfile.newsletter)
      $('.user-youtube').attr('href', userProfile['youtube-channel'])

      let userImage = getUserImage(userProfile)

      if (userImage === stockImages.user && thisIsMyUser(userSlug)) $('.alert-profile').show()

      if (userImage) $('.user-image').attr("src", userImage).removeClass('w-dyn-bind-empty')
      if (userProfile.sponsor) $('.sponsor').attr('href', userProfile.sponsor).show()
      if (userProfile.hire) $('.hire').attr('href', userProfile.hire).show()
    })

    getUserUsers()

    await getCollections()
    populateProjects()
    populateWorkflows()
    populateTutorials()
    populateCompanies()

    if (await userFollowsUser(userSlug)) {
      $('.follow-user-button, .unfollow-user-button').toggle()
    }
  }
}

async function populateCompanies() {
  let items = await getUserCollection(USER_COMPANY)
  processItems(items, '', '.alert-tools')
  renderCompanies('.tools-followed', items)
}

async function populateTutorials() {
  let items = await getUserCollection(USER_TUTORIAL)
  processItems(items, 'Tools', '.alert-watchlist')
  renderTutorials(items)
}

async function populateProjects() {
  let items = await getUserCollection(PROJECTS)
  processItems(items, 'Workflows', '.alert-projects')
  renderProjects('.user-projects', items)
}

async function populateWorkflows() {
  let items = await getUserCollection(WORKFLOWS)
  processItems(items, 'Tutorials', '.alert-workflows')
  renderWorkflows('#user-workflows', items, 2)
}

function processItems(items, fallbackTab, alertElement) {
  console.log(items)
  if (!items.length) {
    return $(`[data-w-tab="${fallbackTab}"]`).click()
  }
  $(alertElement).hide()
}