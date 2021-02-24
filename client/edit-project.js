var projectSlug = 'null'
var projectId = getParamFromURL('projectId')
$(document).ready(async () => {
  $('#active-tags').empty()
  $('#project-tags').empty()
  $('.div-block-955').hide()
  getUsersProjects()
  await populateTags()
  $('.fstQueryInput').click()
  await getCollections()
  await getTags()

  if (projectId) {
    $(`#user-project-dropdown option[value="${projectId}"]`).attr('selected', true)
    $('#user-project-dropdown').change()
  }
})

$('#user-project-dropdown').change(function () {
  console.log($(this).val())
  populateProjectForm($(this).val())
  $('.div-block-955').show()
})

function getUsersProjects() {
  return PROJECTS.where("userId", "==", currentUser.id).get()
    .then(snapshot => {
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      records.forEach(record => {
        $('#user-project-dropdown').append(new Option(record.name, record.slug))
      })
      return records
    })
}

function populateProjectForm(project) {
  $('#multipleSelect').val([])
  $('.fstChoiceRemove').click()
  PROJECTS.doc(project).get()
    .then(doc => {
      if (!doc.exists) return
      let data = doc.data()
      console.log(data)
      $('#name').val(data.name)
      $('#tagline').val(data.tagline)
      $('#url').val(data.url)
      $('#details').val(data.details)
      $('.image-180').attr('src', data.imageUrl)
      $('#multipleSelect').val(data.tags)
      $('#clone').val(data.clone)
      $('#sale-url').val(data['sale-url'])
      $('#price').val(data.price)
      $('.project-sale').click()
      console.log(data.tags)
      for (var tag of data.tags) {
        $(".fstResultItem").filter(function () {
          return $(this).text() === tag
        }).click()
      }
      tinymce.get()[0].setContent(data.details)
    })
}

async function createProject(data) {
  if (!currentUser) return
  data.slug = slugify(data.name)

  if (await slugExists(data.slug, 'projects') == false) {
    await setProject(data)
  } else {
    return handleError('Project name already exists.')
  }
}

async function updateProject(data) {
  if (!currentUser) return
  console.log('updating ' + data.slug)
  await getUsersProjects()
    .then(records => {
      console.log(records)
      let userOwnsProject = records.find(item => (item.slug === data.slug && item.userId === currentUser.id))
      console.log(userOwnsProject)
      if (userOwnsProject) {
        setProject(data)
        return handleSuccess('successfully updated')
      } else {
        return handleError(`You can't edit this project`)
      }
    })
}

async function deleteProject(data) {
  if (!currentUser || !data || !data.slug || data.slug === 'Select Option') return
  let confirmed = prompt(`To confirm, please type the slug of this project - '${data.slug}'`)
  if (confirmed === data.slug) {
    console.log('deleting ' + data.slug)
    await getUsersProjects()
      .then(async records => {
        console.log(records)
        let userOwnsProject = records.find(item => (item.slug === data.slug && item.userId === currentUser.id))
        console.log(userOwnsProject)
        if (userOwnsProject) {
          await PROJECTS.doc(data.slug).delete()
            .catch(e => handleError(e))
          return location.reload()
        } else {
          return handleError(`You can't edit this project`)
        }
      })
  }
  $('.div-block-955').hide()
}

async function setProject(data) {
  return PROJECTS.doc(data.slug).set({
    userId: currentUser.id,
    ...data
  }, { merge: true })
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
      handleSuccess('Project updated')
      addToolsFromTags(data.tags)
      if ($('#wf-form-Submit-Project').length > 0) $('#wf-form-Submit-Project')[0].reset()
      if ($('#wf-form-Edit-Project').length > 0) $('#wf-form-Edit-Project')[0].reset()
    })
    .catch(error => handleError(error))
}

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())

  data.details = tinymce.get()[0].getContent()

  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  data.tags = [...new Set(selectedTags)]

  console.log(data)
  createProject(data)
})

$('#wf-form-Edit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray().filter(i => i.value))

  data.details = tinymce.get()[0].getContent()

  let selectedTags = $('.multiple-select').serializeArray().map(item => item.value)
  data.tags = [...new Set(selectedTags)]

  console.log(data)
  updateProject(data)
})

$('.delete-project-button').click(function (event) {
  let data = objectifyForm($('#wf-form-Edit-Project').serializeArray())
  if (!data || !data.slug) return
  deleteProject(data)
})