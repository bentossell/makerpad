$().ready(() => {
  $('#username-2').val(firebaseUser.username)
})

$('#wf-form-Editing-Profile').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  updateUser(data)
})

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
  return USERS.where("username", "==", slug).limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
      return true
    })
    .catch(error => console.log(error))
}