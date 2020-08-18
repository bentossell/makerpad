var project = getProjectFromUrl()
console.log('Project: ' + project)
renderProject()
let activeTags = []

$().ready(async () => {
  $('#active-tags').empty()
  populateTags()
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
    .then(doc => {
      let data = doc.data()
      console.log(data)
      $('.p-name').text(data.name)
      $('.p-tagline').text(data.tagline)
      $('.p-link').attr('href', data.url)
      $('.p-img').attr('src', data.imageUrl)
      $('.p-description').text(data.details)
      $('.project-user-link').attr('href', `/u/${data.username}`)
      $('.project-user-avatar').attr('src', data.user['profile-pic'])
      $('.project-user-full-name').text(data.user['full-name'])
    })
    .catch(error => handleError(error))
}

function getProjectFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function populateTags() {
  if (!$('.multipleSelect')[0]) return console.log('no multiSelect found')
  try {
    $('.multipleSelect').append(`
    <optgroup label="Types" id="tags-types"></optgroup>
    <optgroup label="Challenges" id="tags-challenges"></optgroup>
    <optgroup label="Tools" id="tags-tools"></optgroup>
  `)

    db.collection('company').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          $('#tags-tools').append(`<option value="${doc.id}">${data.name}</option>`)
          // $('#tag-checkboxes').append(generateCheckboxHTML(doc.id, data.name))
        })
      })

    db.collection('type').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          $('#tags-types').append(`<option value="${doc.id}">${data.name}</option>`)
          // $('#tag-checkboxes').append(generateCheckboxHTML(doc.id, data.name))
        })
      })

    db.collection('challenges').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          $('#tags-challenges').append(`<option value="${doc.id}">${data.name}</option>`)
          // $('#tag-checkboxes').append(generateCheckboxHTML(doc.id, data.name))
        })
      })
  } catch (e) { }
}

// function generateCheckboxHTML(id, name) {
//   return `
//   <div role="listitem" class="dropdown-checkbox-2 w-dyn-item">
//     <label class="w-checkbox checkbox-filter dropdown">
//       <input
//         type="checkbox"
//         onChange="handleTagUpdate('${id}', '${name}')"
//         id="checkbox-${id}"
//         name="${id}"
//         data-name="${id}"
//         class="w-checkbox-input jetboost-filter-trigger" />
//       <span class="dropdown-checkbox-label w-form-label">${name}</span>
//     </label>
//     <div class="w-embed">
//       <input type="hidden" class="jetboost-list-item" value="${id}" />
//     </div>
//   </div>`
// }

// function handleTagUpdate(id, name) {
//   console.log(id, name)
//   if (!activeTags.find(item => item.id == id)) {
//     activeTags.push({ id, name })
//   } else {
//     activeTags = activeTags.filter(item => item.id !== id)
//   }
//   $('#active-tags').empty()
//   for (let tag of activeTags) {
//     $('#active-tags').append(`<div class="link-34" style="margin-right: 5px;">${tag.name}</div>`)
//   }
// }

// function userLikesProject(id) {
//   if (!currentUser || !currentUser.id) return console.log('currentUser ' + currentUser)
//   return USER_PROJECT
//     .where("userId", "==", currentUser.id)
//     .where("projectId", "==", id)
//     .where("followed", "==", true)
//     .limit(1).get()
//     .then(snapshot => {
//       if (snapshot.empty) return false
//       console.log('Current user likes project')
//       console.log(snapshot.docs[0].data())
//       return snapshot.docs[0].data()
//     })
//     .catch(error => console.log(error))
// }

async function createProject(data) {
  if (!currentUser) return
  data.slug = slugify(data.name)

  // if (await slugExists(data.slug)) return handleError('Project name already exists.')

  if (await slugExists(data.slug, 'projects') == false) {
    return PROJECTS.doc(data.slug).set({
      userId: currentUser.id,
      ...data
    })
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
        handleSuccess('Project added')
        $('#wf-form-Submit-Project')[0].reset()
      })
      .catch(error => handleError(error))
  } else {
    return handleError('Project name already exists.')
  }
}

$('#wf-form-Submit-Project').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  let selectedTags = $('.multipleSelect').serializeArray().map(item => item.value)
  data.tags = selectedTags
  console.log(data)
  createProject(data)
})

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