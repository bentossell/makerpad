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
  // if (isCurrentUserContent(project)) {
  //   $('.my-user-content').show()
  // }
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
      $('.project-user-avatar').attr('src', data.user['profile-pic'])
      $('.project-user-full-name').text(data.user['full-name'])

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