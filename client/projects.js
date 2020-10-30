var project = getElementFromURL()
renderProject()

$().ready(async () => {
  $('#active-tags, #project-tags').empty()
  await getCollections()
  console.log('Ready, project: ' + project)
  let isLiked = userLikesProject(project)
  if (isLiked) $('.unlike-project-button, .like-project-button').toggle()
  let userOwnsProject = firebaseCollections['projects'].find(item => (item.slug === project && item.userId === currentUser.id))
  console.log(userOwnsProject)
  if (userOwnsProject) {
    $('.edit-project').attr('href', `/edit-project?projectId=${project}`).show()
    $('.delete-project').show()
  }
})

async function renderProject() {
  if (!project) project = await getProjectFromUrl()
  if (project === 'add-project') return
  PROJECTS.doc(project).get()
    .then(async doc => {
      let data = doc.data()
      console.log(data)
      $('.p-name').text(data.name)
      $('.p-tagline').text(data.tagline)
      $('.p-link').attr('href', data.url)
      data.imageUrl ? $('.p-img').attr('src', data.imageUrl) : $('.p-img').hide()
      $('.p-description').html(data.details)
      $('.project-user-link').attr('href', `/u/${data.username}`)

      let userPic = getUserImage(data.user)
      $('.project-user-full-name').text(data.user['full-name'] || data.user.profile['full-name'])
      $('.project-user-avatar').attr("src", userPic)

      if (data.clone) $('.clone').attr('href', data.clone).show()
      if (data['sale-url']) $('.purchase').attr('href', data['sale-url'])
      if (data.price) $('.project-price-text').text(data.price)
      if (data['sale-url'] || data.price) $('#project-purchase-block').show()

      renderTags('#project-tags', data, 'project-tag')

    })
    .catch(error => handleError(error))
}

$('.like-project-button').click(() => {
  followProject(project)
  $('.unlike-project-button, .like-project-button').toggle()
})

$('.unlike-project-button').click(() => {
  followProject(project, true)
  $('.unlike-project-button, .like-project-button').toggle()
})