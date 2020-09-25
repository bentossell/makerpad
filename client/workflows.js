let workflow = getParamFromURL('id')
renderWorkflow()

$().ready(async () => {
  $('#active-tags').empty()
  $('#workflow-tags').empty()
  await getCollections()
  let isLiked = userSavedWorkflow(workflow)
  if (isLiked) {
    $('.unlike-workflow-button').show()
    $('.like-workflow-button').hide()
  } else {
    $('.unlike-workflow-button').hide()
    $('.like-workflow-button').show()
  }
  let userOwnsWorkflow = firebaseCollections['workflows'].find(item => (item.userId === currentUser.id))
  if (userOwnsWorkflow) {
    $('.edit-workflow').attr('href', `/edit-workflow?id=${workflow}`).show()
    $('.delete-workflow').show()
  }
})

async function renderWorkflow() {
  if (!workflow) workflow = getParamFromURL('id')
  if (workflow === 'add-workflow') return
  WORKFLOWS.doc(workflow).get()
    .then(async doc => {
      let data = doc.data()
      console.log(data)
      $('.workflow-name').text(data.name).show()
      $('.workflow-link').attr('href', data.url)
      $('.p-description').html(data.details)
      $('.workflow-user-link').attr('href', `/u/${data.username}`)
      $('.workflow-user-full-name').text(data.user['full-name'])

      let userPic = getUserImage(data.user)
      $('.workflow-user-avatar').attr("src", userPic)

      if (data.clone) $('.clone-workflow-link').attr('href', data.clone).show()
      if (data.cloned_from) {
        try {
          WORKFLOWS.doc(data.cloned_from).get()
            .then(doc => {
              $('.cloned-from-workflow').attr('href', `/workflows?id=${data.cloned_from}`).text(doc.data().name)
              $('#cloned-from').show()
            })
        } catch (error) { }
      }

      getTags()
        .then(() => {
          if (data.tags) data.tags.forEach(tag => {
            let tagItem = tagsArray.find(item => item.value === tag)
            $('#workflow-tags').append(`
              <a href="/${tagItem.type}/${tagItem.value}" class="workflow-tag">${tag}</a>
            `)
          })
        })
    })
    .catch(error => handleError(error))
}

async function cloneWorkflow(workflowId) {
  if (!currentUser) return
  if (!confirm(`Please confirm cloning this workflow`)) return
  return WORKFLOWS.doc(workflowId).get().then(doc => {
    if (doc.exists) {
      let data = doc.data()
      data.userId = currentUser.id
      WORKFLOWS.add({ ...data, cloned_from: workflowId })
        .then(doc => {
          window.location.replace(`/edit-workflow?id=${doc.id}`)
        })
    }
  })
}

$('.clone-workflow').click(() => {
  cloneWorkflow(workflow)
})

// follow
$('.like-workflow-button').click(() => {
  saveWorkflow(workflow)
  $('.unlike-workflow-button').show()
  $('.like-workflow-button').hide()
})

// unfollow
$('.unlike-workflow-button').click(() => {
  saveWorkflow(workflow, true)
  $('.unlike-workflow-button').hide()
  $('.like-workflow-button').show()
})