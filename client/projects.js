function getProjectFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

let batch = db.batch()

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

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  createProject(data)
})

// $('.cc-saved-counter').text(savedNum)
// $('.cc-completed-counter').text(completeNum)

$('.cc-save-item').click(() => {
  followProject(getProjectFromUrl())
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})