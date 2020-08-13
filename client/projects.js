let project = getProjectFromUrl()
renderProject()

async function renderProject() {
  if (!project) project = getProjectFromUrl()
  PROJECTS.doc(project).get()
    .then(doc => {
      let data = doc.data()
      console.log(data)
      $('.p-name').text(data.name)
      $('.p-tagline').text(data.tagline)
      $('.p-link').attr('href', data.url)
      $('.p-img').attr('src', data.imageUrl)
      $('.p-description').text(data.details)
      $('.project-user-link').attr('href', `/u/${data.username}`)
      $('.project-user-avatar').attr('src', data.user['profile-pic'])
      $('.project-user-full-name').text(data.user['full-name'])
    })
    .catch(error => handleError(error))
}

function getProjectFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

async function createProject(data) {
  if (!currentUser) return
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
            .then((snapshot) => {
              console.log(snapshot.ref.getDownloadURL())
              snapshot.ref.getDownloadURL().then((imageUrl) => {
                PROJECTS.doc(data.slug).update({ imageUrl })
              })
            })
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
  if (!currentUser) return
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
}

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  createProject(data)
})

// follow
$('.like-project-button').click(() => {
  followProject(project)
  $('.unlike-project-button').show()
  $('.like-project-button').hide()
})

// unfollow
$('.unlike-project-button').click(() => {
  followProject(project, true)
  $('.unlike-project-button').hide()
  $('.like-project-button').show()
})