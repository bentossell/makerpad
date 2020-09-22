let workflow = getParamFromURL('id')
renderWorkflow()

$().ready(async () => {
  $('#active-tags').empty()
  $('#project-tags').empty()
  await getCollections()
  let isLiked = userSavedWorkflow(workflow)
  if (isLiked) {
    $('.unlike-project-button').show()
    $('.like-project-button').hide()
  } else {
    $('.unlike-project-button').hide()
    $('.like-project-button').show()
  }
  let userOwnsWorkflow = firebaseCollections['workflows'].find(item => (item.userId === currentUser.id))
  if (userOwnsWorkflow) {
    $('.edit-project').attr('href', `/edit-workflow?workflowId=${workflow}`).show()
    $('.delete-project').show()
  }
})

async function renderWorkflow() {
  if (!workflow) workflow = await getWorkflowFromUrl()
  if (workflow === 'add-workflow') return
  WORKFLOWS.doc(workflow).get()
    .then(async doc => {
      let data = doc.data()
      console.log(data)
      $('.p-name').text(data.name)
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

async function cloneWorkflow(workflowId) {
  if (!currentUser) return
  if (!confirm(`Please confirm cloning this workflow`)) return
  return WORKFLOWS.doc(workflowId).get().then(doc => {
    if (doc.exists) {
      WORKFLOWS.add({ ...doc.data(), cloned_from: workflowId })
        .then(doc => {
          window.location.replace(`/workflow?id=${doc.id}`)
        })
    }
  })
}

$('.clone-workflow-button').click(() => {
  cloneWorkflow(workflow)
})

// follow
$('.like-project-button').click(() => {
  followWorkflow(workflow)
  $('.unlike-project-button').show()
  $('.like-project-button').hide()
})

// unfollow
$('.unlike-project-button').click(() => {
  followWorkflow(workflow, true)
  $('.unlike-project-button').hide()
  $('.like-project-button').show()
})