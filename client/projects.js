async function renderProject() {
  db.collection('projects').doc(getProjectFromUrl).get()
    .then(doc => {
      let data = doc.data()
      console.log(data)
      $('#project-name').text(data.name)
      $('#project-tagline').text(data.tagline)
      $('#project-details').text(data.details)
      $('#project-url').text(data.url)
      $('#project-image').src(data.image)
    })
    .catch(error => handleError(error))
}

function getProjectFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

async function createProject(data) {
  data.slug = slugify(data.name)

  // if (await slugExists(data.slug)) return handleError('Project name already exists.')

  if (await slugExists(data.slug, 'projects') == false) {
    return PROJECTS.doc(data.slug).set({
      userId: currentUser.id,
      ...data
    })
      .then(doc => {
        let image = $('#image')[0].files[0] || null
        if (image) {
          console.log(image)
          storage
            .ref()
            .child(`project_images/${data.slug}`)
            .put(image)
        }
        handleSuccess('Project added')
        $('#wf-form-Submit-Project')[0].reset()
      })
      .catch(error => handleError(error))
  } else {
    return handleError('Project name already exists.')
  }
}

function followProject(projectId, reverse) {
  updateProject(projectId, {
    userId: currentUser.id,
    projectId,
    followed: reverse ? false : true
  })
}

async function updateProject(id, object) {

  await USER_PROJECT.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))

  await PROJECTS.doc(currentUser.id).collection('projects').doc(id).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))
}

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  createProject(data)
})

// follow
$('.cc-save-item.cc-unchecked').click(() => {
  let project = getProjectFromUrl()
  followProject(project)
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})

// unfollow
$('.cc-save-item.cc-checked').click(() => {
  let project = getProjectFromUrl()
  followProject(project, true)
  $('.cc-save-item.cc-checked').hide()
  $('.cc-save-item.cc-unchecked').show()
})