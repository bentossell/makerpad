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

$('.follow-user-button').submit(function (event) {
  followUser(getUserFromUrl())
  $('.follow-user-button').hide()
  $('.unfollow-user-button').show()
})

$('.unfollow-user-button').submit(function (event) {
  followUser(getUserFromUrl(), true)
  $('.follow-user-button').show()
  $('.unfollow-user-button').hide()
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
      .then(doc => {
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
    .then(() => console.log(reverse ? 'user unfollowed' : 'user followed'))
    .catch(error => console.log(error))
}

function getUserTutorials() {
  return USER_TUTORIAL
    .where("userId", "==", currentUser.id)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let data = snapshot.docs.map(doc => doc.data())
      currentUser.tutorials = data
      firebaseUser.tutorials = data
      return data
    })
    .catch(error => console.log(error))
}

function getUserCompanies() {
  return USER_COMPANY
    .where("userId", "==", currentUser.id)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let data = snapshot.docs.map(doc => doc.data())
      currentUser.companies = data
      firebaseUser.companies = data
      return data
    })
    .catch(error => console.log(error))
}

function populateUser() {
  $('.user-full-name').text(currentUser['full-name'])
  $('.user-bio').text(currentUser.bio)
  $('.user-location').text(currentUser.location)
  $('.user-twitter').attr('href', currentUser.twitter)
  $('.user-website').attr('href', currentUser.website)
  $('.user-newsletter').attr('href', currentUser.newsletter)
  $('.user-youtube').attr('href', currentUser.youtube)

  populateProjects()
  populateTutorials()
  populateCompanies()
}

async function populateCompanies() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await getUserCompanies()

  for (company of companies) {
    $('#tools-used').append(`
    <a href=https://makerpad.co/company/${company.name} 
      class="m-4 p-6 flex flex-col items-center border border-gray-300 justify-center rounded-lg">
      <img class="w-10 h-10 rounded" src="${company.image}" />
      <p class="mt-2 text-blue-600">${company.name}</p>
    </a>`)
  }
}

async function populateTutorials() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await getUserCompanies()

  for (company of companies) {
    $('#tools-used').append(`
    <a href=https://makerpad.co/company/${company.name} 
      class="m-4 p-6 flex flex-col items-center border border-gray-300 justify-center rounded-lg">
      <img class="w-10 h-10 rounded" src="${company.image}" />
      <p class="mt-2 text-blue-600">${company.name}</p>
    </a>`)
  }
}

async function populateProjects() {
  getUser()
  console.log(window.location.href.substring(window.location.href.lastIndexOf('/')))
  let companies = await getUserCompanies()

  for (company of companies) {
    $('#tools-used').append(`
    <a href=https://makerpad.co/company/${company.name} 
      class="m-4 p-6 flex flex-col items-center border border-gray-300 justify-center rounded-lg">
      <img class="w-10 h-10 rounded" src="${company.image}" />
      <p class="mt-2 text-blue-600">${company.name}</p>
    </a>`)
  }
}