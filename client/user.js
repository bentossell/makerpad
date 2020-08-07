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
