var project = getProjectFromUrl()
console.log('Project: ' + project)
renderProject()

$().ready(async () => {
  await getCollections()
  console.log('Ready, project: ' + project)
  let isLiked = userLikesProject(project)
  if (isLiked) {
    $('.unlike-project-button').show()
    $('.like-project-button').hide()
  } else {
    $('.unlike-project-button').hide()
    $('.like-project-button').show()
  }
  // if (isCurrentUserContent(project)) {
  //   $('.my-user-content').show()
  // }
})

async function renderProject() {
  if (!project) project = await getProjectFromUrl()
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

// function userLikesProject(id) {
//   if (!currentUser || !currentUser.id) return console.log('currentUser ' + currentUser)
//   return USER_PROJECT
//     .where("userId", "==", currentUser.id)
//     .where("projectId", "==", id)
//     .where("followed", "==", true)
//     .limit(1).get()
//     .then(snapshot => {
//       if (snapshot.empty) return false
//       console.log('Current user likes project')
//       console.log(snapshot.docs[0].data())
//       return snapshot.docs[0].data()
//     })
//     .catch(error => console.log(error))
// }

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