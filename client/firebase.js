var firebaseConfig = {
  apiKey: "AIzaSyAyeQF-e3zLH63-EQPb8TmNT6kPbPDQ-9Q",
  authDomain: "makerpad-94656.firebaseapp.com",
  databaseURL: "https://makerpad-94656.firebaseio.com",
  projectId: "makerpad-94656",
  storageBucket: "makerpad-94656.appspot.com",
  messagingSenderId: "605558417729",
  appId: "1:605558417729:web:335367a103d85d967519c0",
  measurementId: "G-Y9ZL70K32T"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
try {
  firebase.analytics()
} catch (e) { }

var db = firebase.firestore()
var storage = firebase.storage()
firebaseAuth()
var debugMode = getParamFromURL('debug')

var currentUser = {}
var firebaseUser = {}
var tagsArray = []

var firebaseCollections = {
  'company': [], 'projects': [], 'user_project': [], 'user_user': [], 'user_tutorial': [], 'user_company': [], 'reviews': [], 'workflows': []
}

var COMPANY = db.collection('company')
var TUTORIAL = db.collection('tutorial')
var PROJECTS = db.collection('projects')
var USERS = db.collection('memberstack_users')
var U = db.collection('u')
var USER_TUTORIAL = db.collection('user_tutorial')
var USER_PROJECT = db.collection('user_project')
var USER_USER = db.collection('user_user')
var USER_COMPANY = db.collection('user_company')
var USER_WORKFLOW = db.collection('user_workflow')
var REVIEWS = db.collection('reviews')
var WORKFLOWS = db.collection('workflows')

var increment = firebase.firestore.FieldValue.increment(1)
var decrement = firebase.firestore.FieldValue.increment(-1)

MemberStack.onReady.then(async function (member) {
  console.log(member)
  currentUser = member
  if (member.id) {
    USERS.doc(member.id).get()
      .then(doc => {
        if (doc.exists) {
          firebaseUser = doc.data()
          $('.current-user-profile-link').attr('href', `/u/${firebaseUser.username}`)
          $('.image-111').attr('src', firebaseUser.imageUrl)
          $('#username-2').val(firebaseUser.username)
          $('#sponsor').val(firebaseUser.sponsor)
          $('#hire').val(firebaseUser.hire)
        } else {
          console.log('new user detected, adding to firebase')
          var info = memberstack.information
          USERS.doc(member.id).set(info, { merge: true })
            .then(() => {
              USERS.doc(member.id).get()
                .then(doc => {
                  firebaseUser = doc.data()
                  $('#username-2').val(firebaseUser.username)
                  $('.current-user-profile-link').attr('href', `/u/${firebaseUser.username}`)
                })
            })
        }
      })
      .catch(error => console.log(error))
  } else {
    console.log('no memberstack user')
  }
})

function getUserNameFromMemberstackId(memberstackId) {
  return USERS.doc(memberstackId).get()
    .then(doc => {
      if (doc.exists) {
        let data = doc.data()
        return data.username
      } else {
        return false
      }
    })
    .catch(error => console.error(error))
}

function getMemberstackIdFromUsername(username) {
  return USERS.where("username", "==", username).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
    })
    .catch(error => console.log(error))
}

function handleError(error) {
  console.error(error)
  $('#firebase-notification').text(error).show()
  setTimeout(() => $('#firebase-notification').hide(), 4000)
}

function handleSuccess(message) {
  console.log(message)
  $('#firebase-notification').text(message).show()
  setTimeout(() => $('#firebase-notification').hide(), 4000)
}

function firebaseAuth() {
  // Sign in anonymously to restrict firestore access to makerpad.com
  firebase.auth().signInAnonymously()
    .then(user => console.log('Firebase signed in anon'))
    .catch(error => console.log(error))
}

function objectifyForm(formArray) {
  var returnArray = {}
  for (var i = 0; i < formArray.length; i++) {
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function slugExists(slug, collection) {
  return db.collection(collection).doc(slug).get()
    .then(doc => {
      if (doc.exists) return true
      return false
    })
}

function isCurrentUserContent(checkValue) {
  return false
}

function userSavedTutorial(id) {
  return firebaseCollections['user_tutorial'].some(item => item.tutorialId === id && item.watchLater == true)
}

function userCompletedTutorial(id) {
  return firebaseCollections['user_tutorial'].some(item => item.tutorialId === id && item.completed == true)
}

function userFollowsCompany(id) {
  return firebaseCollections['user_company'].some(item => item.companyId === id && item.followed == true)
}

function userLikesProject(id) {
  return firebaseCollections['user_project'].some(item => item.projectId === id && item.followed == true)
}

function userLikesWorkflow(id) {
  return firebaseCollections['user_workflow'].some(item => item.workflowId === id && item.liked == true)
}

function userSavedWorkflow(id) {
  return firebaseCollections['user_workflow'].some(item => item.workflowId === id && item.saved == true)
}

function userFollowsUser(id) {
  return firebaseCollections['user_user'].some(item => item.targetUser === id && item.followed == true)
}

function followCompany(companyId, reverse) {
  if (!currentUser.id) return
  updateCompany(companyId, {
    userId: currentUser.id,
    companyId,
    followed: reverse ? false : true
  })
  COMPANY.doc(companyId).update({
    likes: reverse ? decrement : increment
  })
}

async function updateCompany(id, object) {
  await USER_COMPANY.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))
}

function followProject(projectId, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'

  let object = {
    userId: currentUser.id,
    projectId,
    followed: reverse ? false : true
  }

  USER_PROJECT.doc(`${currentUser.id}-${projectId}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))

  if (reverse) {
    $(`[data-project="${projectId}"] .unlike-project-button`).hide()
    $(`[data-project="${projectId}"] .like-project-button`).show()
  } else {
    $(`[data-project="${projectId}"] .unlike-project-button`).show()
    $(`[data-project="${projectId}"] .like-project-button`).hide()
  }
  PROJECTS.doc(projectId).update({
    likes: reverse ? decrement : increment
  })
}

function likeWorkflow(workflowId, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'

  let object = {
    userId: currentUser.id,
    workflowId,
    liked: reverse ? false : true
  }

  USER_WORKFLOW.doc(`${currentUser.id}-${workflowId}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))

  if (reverse) {
    $(`[data-workflow="${workflowId}"] .unlike-workflow-button`).hide()
    $(`[data-workflow="${workflowId}"] .like-workflow-button`).show()
  } else {
    $(`[data-workflow="${workflowId}"] .unlike-workflow-button`).show()
    $(`[data-workflow="${workflowId}"] .like-workflow-button`).hide()
  }
  WORKFLOWS.doc(workflowId).update({
    likes: reverse ? decrement : increment
  })
}

function saveWorkflow(workflowId, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'

  let object = {
    userId: currentUser.id,
    workflowId,
    saved: reverse ? false : true
  }

  USER_WORKFLOW.doc(`${currentUser.id}-${workflowId}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))

  if (reverse) {
    $(`[data-workflow="${workflowId}"] .unsave-workflow`).hide()
    $(`[data-workflow="${workflowId}"] .save-workflow`).show()
  } else {
    $(`[data-workflow="${workflowId}"] .unsave-workflow`).show()
    $(`[data-workflow="${workflowId}"] .save-workflow`).hide()
  }
  WORKFLOWS.doc(workflowId).update({
    saves: reverse ? decrement : increment
  })
}

async function getCollections() {

  let companyPromise = COMPANY
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log('got COMPANY')
      firebaseCollections['company'] = records
      return records
    })

  let projectPromise = PROJECTS
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log('got PROJECTS')
      firebaseCollections['projects'] = records
      return records
    })

  let workflowPromise = WORKFLOWS
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log('got WORKFLOWS')
      firebaseCollections['workflows'] = records
      return records
    })

  if (currentUser.id) {
    let userProjectPromise = USER_PROJECT
      .where("userId", "==", currentUser.id)
      .where("followed", "==", true)
      .get()
      .then(snapshot => {
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got USER_PROJECT')
        firebaseCollections['user_project'] = records
        return records
      })
    let userUserPromise = USER_USER
      .where("userId", "==", currentUser.id)
      .get()
      .then(snapshot => {
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got USER_USER')
        firebaseCollections['user_user'] = records
        return records
      })
    let userTutorialPromise = USER_TUTORIAL
      .where("userId", "==", currentUser.id)
      .get()
      .then(snapshot => {
        if (snapshot.empty) return false
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got USER_TUTORIAL')
        firebaseCollections['user_tutorial'] = records
        return records
      })

    let userCompanyPromise = USER_COMPANY
      .where("userId", "==", currentUser.id)
      .get()
      .then(snapshot => {
        if (snapshot.empty) return false
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got USER_COMPANY')
        firebaseCollections['user_company'] = records
        return records
      })

    let userWorkflowPromise = USER_WORKFLOW
      .where("userId", "==", currentUser.id)
      .get()
      .then(snapshot => {
        if (snapshot.empty) return false
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got USER_WORKFLOW')
        firebaseCollections['user_workflow'] = records
        return records
      })

    let reviewPromise = REVIEWS
      .get()
      .then(snapshot => {
        if (snapshot.empty) return false
        let records = snapshot.docs.map(doc => doc.data())
        console.log('got REVIEWS')
        firebaseCollections['reviews'] = records
        return records
      })

    await Promise.all([userCompanyPromise, userTutorialPromise, userUserPromise, userProjectPromise, userWorkflowPromise, reviewPromise])
  }
  await Promise.all([companyPromise, projectPromise, workflowPromise])
}

async function populateTags() {
  if (!$('.multiple-select')[0]) return console.log('no multiSelect found')
  try {
    $('.multiple-select').append(`
    <optgroup label="Types" id="tags-types"></optgroup>
    <optgroup label="Challenges" id="tags-challenges"></optgroup>
    <optgroup label="Tools" id="tags-tools"></optgroup>
  `)

    await db.collection('company').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          // tagsArray.push({ type: 'company', value: data.slug })
          $('#tags-tools').append(`<option value="${doc.id}">${data.slug}</option>`)
        })
      })

    await db.collection('type').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          // tagsArray.push({ type: 'type', value: data.slug })
          $('#tags-types').append(`<option value="${doc.id}">${data.slug}</option>`)
        })
      })

    await db.collection('challenges').get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let data = doc.data()
          // tagsArray.push({ type: 'challenges', value: data.slug })
          $('#tags-challenges').append(`<option value="${doc.id}">${data.slug}</option>`)
        })
      })
  } catch (e) { }
  return
}

async function getTaggedProjects(tags) {
  if (!tags) return []
  return PROJECTS
    .where('tags', 'array-contains-any', tags)
    .orderBy("created_at", "desc")
    .get()
    .then(snapshot => {
      if (snapshot.empty) return []
      let data = snapshot.docs.map(doc => doc.data())
      // data = data.sort((a, b) => a.created_at > b.created_at)
      console.log(data)
      return data
    })
    .catch(error => console.log(error))
}

async function getTags() {
  await db.collection('company').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let data = doc.data()
        tagsArray.push({ type: 'company', value: data.slug })
      })
    })

  await db.collection('type').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let data = doc.data()
        tagsArray.push({ type: 'type', value: data.slug })
      })
    })

  await db.collection('challenges').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let data = doc.data()
        tagsArray.push({ type: 'challenges', value: data.slug })
      })
    })
}

function getElementFromURL() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function getParamFromURL(param) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

function populateFormFromData(data) {
  for (let [key, value] of Object.entries(data)) {
    if (key === 'id' || key === 'slug') return
    try {
      $(`[name=${key}]`).val(value)
    } catch (error) { }
  }
}

function markTutorialComplete(tutorialId, reverse) {
  if (!currentUser || !currentUser.id) return window.location = 'https://www.makerpad.co/pricing'
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    completed: reverse ? false : true,
    watchLater: reverse ? true : false
  })
  TUTORIAL.doc(tutorialId).update({
    completes: reverse ? decrement : increment
  })
  if (reverse) {
    $(`[data-tutorial="${tutorialId}"] .cc-mark-as-complete.cc-checked`).hide()
    $(`[data-tutorial="${tutorialId}"] .cc-mark-as-complete.cc-unchecked`).show()
  } else {
    $(`[data-tutorial="${tutorialId}"] .cc-mark-as-complete.cc-checked`).show()
    $(`[data-tutorial="${tutorialId}"] .cc-mark-as-complete.cc-unchecked`).hide()
  }
}

function updateTutorial(id, object) {
  USER_TUTORIAL.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(doc => console.log(object))
    .catch(error => handleError(error))
}

function getUserImage(userObject) {
  // return `https://firebasestorage.googleapis.com/v0/b/makerpad-94656.appspot.com/o/profile_pictures%2F${username}?alt=media&token=acf25318-5b18-454e-85d5-b3d2e694b04a`
  if (userObject.imageUrl) {
    return userObject.imageUrl
  } else if (userObject['profile-pic']) {
    return userObject['profile-pic']
  } else if (userObject.profile && userObject.profile['profile-pic']) {
    return userObject.profile['profile-pic']
  } else {
    return 'https://w5insight.com/wp-content/uploads/2014/07/placeholder-user-400x400.png'
  }
}

async function renderUsers(target, items) {
  console.log(items)
  $(target).empty()
  items.forEach(item => {
    let profileImage = getUserImage(item)
    $(target).append(`
      <a href="/u/${item.username}" class="div-block-167 w-inline-block"><img width="40"
        src="${profileImage}"
        alt="" class="image-37 tool-img">
      <div class="div-block-168 vertical">
        <div class="div-block-169">
          <h4 class="heading-259 tool-name">${item['full-name']}</h4>
        </div>
        <div class="text-block-438 tool-tagline">${item.bio}</div>
      </div>
    </a>
    `)
  })
}

async function renderProjects(target, items) {
  console.log(items)
  if (firebaseCollections['projects'].length == 0) await getCollections()
  if (!items) return

  for (item of items) {
    let project = item
    $(target).append(`
    <div class="project-div" data-project="${project.slug}">
      <a href="/p/${project.slug}" class="user-project w-inline-block">
        <img
          src="${project.imageUrl}"
          alt="${project.name}"
          class="image-175 project-image" />
      </a>
      <div class="div-block-924 project-div-footer">
        <a href="/p/${project.slug}" class="user-project project-text"
          <h5 class="project-heading">${project.name}</h5>
        </a>
        <div class="flex items-center">
          <button onclick="window.location.href='/edit-project?projectId=${project.slug}'" class="edit-project w-button hidden">Edit</button>
          <button onclick="followProject('${project.slug}')" class="like-button like-project-button w-button"></button>
          <button onclick="followProject('${project.slug}', true)" class="like-button unlike-project-button w-button hidden"></button>
        </div>
      </div>
    </div>`)

    if (userLikesProject(project.slug)) {
      $(`[data-project="${project.slug}"] .unlike-project-button`).show()
      $(`[data-project="${project.slug}"] .like-project-button`).hide()
    } else {
      $(`[data-project="${project.slug}"] .unlike-project-button`).hide()
      $(`[data-project="${project.slug}"] .like-project-button`).show()
    }
    if (project.userId === currentUser.id) $(`[data-project="${project.slug}"] .edit-project`).show()

    // $('.project-heading').text(project.name)
    // $('.project-image').attr('src', project.imageUrl)
    // $('.user-project').attr('href', `/p/${project.slug}`)
  }
}