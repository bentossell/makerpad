var tinyElement = tinymce.get()
var workflowId = getParamFromURL('id')

$(document).ready(async () => {
  console.log('document ready')
  $('#active-tags').empty()
  $('#workflow-tags').empty()
  $('.div-block-955').hide()
  getUsersWorkflows()
  await populateTags()
  $('.fstQueryInput').click()
  await getCollections()
  await getTags()

  if (workflowId) {
    $(`#user-workflow-dropdown option[value="${workflowId}"]`).attr('selected', true)
    $('#user-workflow-dropdown').change()
  }
})

$('#user-workflow-dropdown').change(function () {
  console.log($(this).val())
  populateWorkflowForm($(this).val())
  $('.div-block-955').show()
})

function getUsersWorkflows() {
  return WORKFLOWS.where("userId", "==", currentUser.id).get()
    .then(snapshot => {
      let records = snapshot.docs.map(doc => {
        return { ...doc.data(), id: doc.id }
      })
      console.log(records)
      records.forEach(record => {
        $('#user-workflow-dropdown').append(new Option(`${record.name} (${record.id})`, record.id))
      })
      // if (workflowId) {
      //   $(`#user-workflow-dropdown option[value="${workflowId}"]`).attr('selected', true)
      //   $('#user-workflow-dropdown').change()
      // }
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
      // populateFormFromData(data)
      $(`[name=name]`).val(data.name)
      $(`[name=url]`).val(data.url)
      $(`[name=sale-url]`).val(data['sale-url'])
      $(`[name=price]`).val(data.price)
      $(`#${data.publicity}`).prop("checked", true)
      $('#multipleSelect').val(data.tags)
      // $('.project-sale').click()
      console.log(data.tags)
      for (var tag of data.tags) {
        $(".fstResultItem").filter(function () {
          return $(this).text() === tag
        }).click()
      }
      tinymce.get()[0].setContent(data.details)
    })
}

function createWorkflow(data) {
  if (!currentUser) return
  return WORKFLOWS.add({
    userId: currentUser.id,
    ...data
  })
    .then(async doc => {
      handleSuccess('Workflow created')
      await addToolsFromTags(data.tags)
      if ($('#wf-form-Submit-Workflow').length > 0) $('#wf-form-Submit-Workflow')[0].reset()
      if ($('#wf-form-Edit-Workflow').length > 0) $('#wf-form-Edit-Workflow')[0].reset()
      window.location.replace(`/workflows?id=${doc.id}`)
    })
    .catch(error => handleError(error))
}

async function updateWorkflow(data) {
  if (!currentUser) return
  console.log('updating ' + data.id)
  await getUsersWorkflows()
    .then(records => {
      console.log(records)
      let userOwnsWorkflow = records.find(item => (item.id === data.id && item.userId === currentUser.id))
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
  if (!currentUser || !data || !data.id || data.id === 'Select Option') return
  let confirmed = prompt(`To confirm, please type the id of this workflow - '${data.id}'`)
  if (confirmed === data.id) {
    console.log('deleting ' + data.id)
    await getUsersWorkflows()
      .then(async records => {
        console.log(records)
        let userOwnsWorkflow = records.find(item => (item.id === data.id && item.userId === currentUser.id))
        console.log(userOwnsWorkflow)
        if (userOwnsWorkflow) {
          await WORKFLOWS.doc(data.id).delete()
            .catch(e => handleError(e))
          return location.reload()
        } else {
          return handleError(`You can't edit this workflow`)
        }
      })
  }
  $('.div-block-955').hide()
}

function setWorkflow(data) {
  if (!currentUser) return
  console.log(data)
  return WORKFLOWS.doc(data.id).set({
    userId: currentUser.id,
    ...data
  }, { merge: true })
    .then(async doc => {
      handleSuccess('Workflow updated')
      await addToolsFromTags(data.tags)
      if ($('#wf-form-Submit-Workflow').length > 0) $('#wf-form-Submit-Workflow')[0].reset()
      if ($('#wf-form-Edit-Workflow').length > 0) $('#wf-form-Edit-Workflow')[0].reset()
      window.location.replace(`/workflows?id=${data.id}`)
    })
    .catch(error => handleError(error))
}

$('#wf-form-Submit-Workflow').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())

  data.details = tinymce.get()[0].getContent()

  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  data.tags = [...new Set(selectedTags)]

  console.log(data)
  createWorkflow(data)
})

$('#wf-form-Edit-Workflow').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray().filter(i => i.value))

  data.details = tinymce.get()[0].getContent()

  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  data.tags = [...new Set(selectedTags)]

  console.log(data)
  updateWorkflow(data)
})

$('.delete-project-button').click(function (event) {
  let data = objectifyForm($('#wf-form-Edit-Workflow').serializeArray())
  if (!data || !data.id) return
  deleteWorkflow(data)
})