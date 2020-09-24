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
      $('.w-name').text(data.name)
      $('.workflow-link').attr('href', data.url)
      $('.p-img').attr('src', data.imageUrl)
      $('.p-description').html(data.details)
      $('.workflow-user-link').attr('href', `/u/${data.username}`)
      $('.workflow-user-full-name').text(data.user['full-name'])

      let userPic = getUserImage(data.user)
      $('.workflow-user-avatar').attr("src", userPic)

      if (data.clone) $('.clone-workflow-link').attr('href', data.clone).show()
      if (data.cloned_from) {
        $('#cloned-from').show()
        $('.cloned-from-workflow').attr('href', `/u/${data.cloned_from}`)
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
      WORKFLOWS.add({ ...doc.data(), cloned_from: workflowId })
        .then(doc => {
          window.location.replace(`/workflows?id=${doc.id}`)
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