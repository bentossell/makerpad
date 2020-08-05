function getProjectFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function createProject(data) {
  db.collection('projects').add({
    user: currentUser.id,
    ref: db.doc(`memberstack_users/${currentUser.id}`),
    ...data
  })
    .then(() => {
      handleSuccess('Project added')
      $('#wf-form-Submit-Project')[0].reset()
    })
    .catch(error => handleError(error))
}

function followProject(companyId) {
  updateCompany(companyId, {
    followed: true
  })
}

async function updateProject(id, object) {
  await PROJECT.doc(currentUser.id).collection('companies').doc(id).set(object, { merge: true })
    .then(() => console.log('user/companies updated'))
    .catch(error => handleError(error))

  await USER_PROJECT.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log('user_company updated'))
    .catch(error => handleError(error))

  object[`users.${currentUser.id}`] = object
  await PROJECT.doc(id).update(object)
    .then(() => console.log('company updated'))
    .catch(error => handleError(error))
}

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  createProject(data)
})

// $('.cc-saved-counter').text(savedNum)
// $('.cc-completed-counter').text(completeNum)

$('.cc-save-item').click(() => {
  let project = getProjectFromUrl()
  followProject(project)
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})