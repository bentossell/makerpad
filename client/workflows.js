let workflow = getParamFromURL('id')
renderWorkflow()

$().ready(async () => {
  !workflow ? $('#workflow-detail-container').hide() : $('#user-workflows').parent().hide()
  if (!debugMode) $('#workflow-tags, #user-workflows, #saved-workflows').empty()
  getCollections().then(() => {
    let isLiked = userLikesWorkflow(workflow)
    let isSaved = userSavedWorkflow(workflow)
    if (isLiked) {
      $('.unlike-workflow-button').show()
      $('.like-workflow-button').hide()
    } else {
      $('.unlike-workflow-button').hide()
      $('.like-workflow-button').show()
    }
    renderWorkflows('#user-workflows', firebaseCollections['workflows'].filter(item => item.userId === currentUser.id))
    renderWorkflows('#saved-workflows', firebaseCollections['user_workflow'].filter(i => i.saved == true).map(item => item.workflow))
    let userOwnsWorkflow = firebaseCollections['workflows'].find(item => (item.userId === currentUser.id))
    if (userOwnsWorkflow) {
      $('.edit-workflow').attr('href', `/edit-workflow?id=${workflow}`).show()
      $('.delete-workflow').show()
    }
  })
})

async function renderWorkflow() {
  if (!workflow || workflow === 'add-workflow') return
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

$('.like-workflow-button').click(() => {
  likeWorkflow(workflow)
  $('.unlike-workflow-button').show()
  $('.like-workflow-button').hide()
})

$('.unlike-workflow-button').click(() => {
  likeWorkflow(workflow, true)
  $('.unlike-workflow-button').hide()
  $('.like-workflow-button').show()
})

$('.save-workflow').click(() => {
  saveWorkflow(workflow)
  $('.unsave-workflow').show()
  $('.save-workflow').hide()
})

$('.unlike-workflow-button').click(() => {
  saveWorkflow(workflow, true)
  $('.unsave-workflow').hide()
  $('.save-workflow').show()
})