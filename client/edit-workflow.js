let tinyElement = tinymce.get()
$(document).ready(async () => {
  $('#active-tags').empty()
  $('#workflow-tags').empty()
  $('.div-block-955').hide()
  getUsersWorkflows()
  await populateTags()
  $('.fstQueryInput').click()
  await getCollections()
  await getTags()
})

$('#user-workflow-dropdown').change(function () {
  console.log($(this).val())
  populateWorkflowForm($(this).val())
  $('.div-block-955').show()
})

function getUsersWorkflows() {
  return WORKFLOWS.where("userId", "==", currentUser.id).get()
    .then(snapshot => {
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      records.forEach(record => {
        $('#user-workflow-dropdown').append(new Option(record.name, record.slug))
      })
      return records
    })
}

function populateWorkflowForm(workflow) {
  $('#multipleSelect').val([])
  $('.fstChoiceRemove').click()
  WORKFLOWS.doc(workflow).get()
    .then(async doc => {
      if (!doc.exists) return
      let data = doc.data()
      console.log(data)
      // loop
      populateFormFromData(data)
      $('.image-180').attr('src', data.imageUrl)
      $('#multipleSelect').val(data.tags)
      console.log(data.tags)
      data.tags.forEach(tag => {
        $(".fstResultItem").filter(function () {
          return $(this).text() === tag
        }).click()
      })
      tinymce.get()[0].setContent(data.details)
    })
}

async function createWorkflow(data) {
  if (!currentUser) return
  return WORKFLOWS.add({
    userId: currentUser.id,
    ...data
  })
    .then(doc => {
      let image = $('#image')[0].files[0] || null
      if (image) {
        console.log(image)
        storage
          .ref()
          .child(`workflow_images/${doc.id}`)
          .put(image)
          .then((snapshot) => {
            console.log(snapshot.ref.getDownloadURL())
            snapshot.ref.getDownloadURL().then((imageUrl) => {
              WORKFLOWS.doc(doc.id).update({ imageUrl })
            })
          })
      }
      handleSuccess('Workflow updated')
      addToolsFromTags(data.tags)
      if ($('#wf-form-Submit-Workflow').length > 0) $('#wf-form-Submit-Workflow')[0].reset()
      if ($('#wf-form-Edit-Workflow').length > 0) $('#wf-form-Edit-Workflow')[0].reset()
    })
    .catch(error => handleError(error))
}

async function updateWorkflow(data) {
  if (!currentUser) return
  console.log('updating ' + data.slug)
  await getUsersWorkflows()
    .then(records => {
      console.log(records)
      let userOwnsWorkflow = records.find(item => (item.slug === data.slug && item.userId === currentUser.id))
      console.log(userOwnsWorkflow)
      if (userOwnsWorkflow) {
        setWorkflow(data)
        return handleSuccess('successfully updated')
      } else {
        return handleError(`You can't edit this workflow`)
      }
    })
}

async function deleteWorkflow(data) {
  if (!currentUser || !data || !data.slug || data.slug === 'Select Option') return
  let confirmed = prompt(`To confirm, please type the slug of this workflow - '${data.slug}'`)
  if (confirmed === data.slug) {
    console.log('deleting ' + data.slug)
    await getUsersWorkflows()
      .then(async records => {
        console.log(records)
        let userOwnsWorkflow = records.find(item => (item.slug === data.slug && item.userId === currentUser.id))
        console.log(userOwnsWorkflow)
        if (userOwnsWorkflow) {
          await WORKFLOWS.doc(data.slug).delete()
            .catch(e => handleError(e))
          return handleSuccess('successfully deleted')
        } else {
          return handleError(`You can't edit this workflow`)
        }
      })
  }
  $('.div-block-955').hide()
}

async function setWorkflow(data) {
  if (!currentUser) return
  return WORKFLOWS.doc(data.slug).set({
    userId: currentUser.id,
    ...data
  }, { merge: true })
    .then(doc => {
      let image = $('#image')[0].files[0] || null
      if (image) {
        console.log(image)
        storage
          .ref()
          .child(`workflow_images/${data.slug}`)
          .put(image)
          .then((snapshot) => {
            console.log(snapshot.ref.getDownloadURL())
            snapshot.ref.getDownloadURL().then((imageUrl) => {
              WORKFLOWS.doc(data.slug).update({ imageUrl })
            })
          })
      }
      handleSuccess('Workflow updated')
      addToolsFromTags(data.tags)
      if ($('#wf-form-Submit-Workflow').length > 0) $('#wf-form-Submit-Workflow')[0].reset()
      if ($('#wf-form-Edit-Workflow').length > 0) $('#wf-form-Edit-Workflow')[0].reset()
    })
    .catch(error => handleError(error))
}

$('#wf-form-Submit-Workflow').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  selectedTags = [...new Set(selectedTags)]
  data.tags = selectedTags
  console.log(data)
  createWorkflow(data)
})

$('#wf-form-Edit-Workflow').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  selectedTags = [...new Set(selectedTags)]
  data.tags = selectedTags
  console.log(data)
  updateWorkflow(data)
})

$('.delete-workflow-button').click(function (event) {
  let data = objectifyForm($('#wf-form-Edit-Workflow').serializeArray())
  if (!data || !data.slug) return
  deleteWorkflow(data)
})

function addToolsFromTags(tags) {
  let toolTags = tagsArray.filter(item => item.type === 'company').map(item => item.value)
  let userTags = firebaseCollections['user_company'].map(item => item.companyId)
  console.log({ toolTags, userTags })
  let newTools = tags.filter(item => toolTags.includes(item) && !userTags.includes(item))
  console.log(newTools)
  return newTools.forEach(item => {
    followCompany(item)
  })
}