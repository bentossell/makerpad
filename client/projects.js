var project = getElementFromURL()
console.log('Project: ' + project)
renderProject()
let activeTags = []

$().ready(async () => {
  $('#active-tags').empty()
  $('#project-tags').empty()
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
  let userOwnsProject = projectCollection.find(item => (item.slug === project && item.userId === currentUser.id))
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
      $('.p-img').attr('src', data.imageUrl)
      $('.p-description').html(data.details)
      $('.project-user-link').attr('href', `/u/${data.username}`)
      $('.project-user-full-name').text(data.user['full-name'])

      let userPic = getUserImage(data.user)
      $('.project-user-avatar').attr("src", userPic)

      if (data.clone) $('.clone').attr('href', data.clone).show()
      if (data['sale-url']) $('.purchase').attr('href', data['sale-url'])
      if (data.price) $('.project-price-text').text(data.price)
      if (data['sale-url'] || data.price) $('#project-purchase-block').show()

      // $('.user-image').removeClass('w-dyn-bind-empty')

      await getTags()

      if (data.tags) data.tags.forEach(tag => {
        let tagItem = tagsArray.find(item => item.value === tag)
        $('#project-tags').append(`
          <a href="/${tagItem.type}/${tagItem.value}" class="project-tag">${tag}</a>
        `)
      })
    })
    .catch(error => handleError(error))
}

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