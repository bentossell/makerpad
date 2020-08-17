const firebaseConfig = {
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
firebase.analytics()

const db = firebase.firestore()
const storage = firebase.storage()

var currentUser = {}
var firebaseUser = {}
var userTutorial = []
var userProject = []
var userUser = []
var userCompany = []
var companyCollection = []
var projectCollection = []

const COMPANY = db.collection('company')
const TUTORIAL = db.collection('tutorial')
const PROJECTS = db.collection('projects')
const USERS = db.collection('memberstack_users')
const U = db.collection('u')
const USER_TUTORIAL = db.collection('user_tutorial')
const USER_PROJECT = db.collection('user_project')
const USER_USER = db.collection('user_user')
const USER_COMPANY = db.collection('user_company')

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
          $('#username-2').val(firebaseUser.username)
        } else {
          console.log('new user detected, adding to firebase')
          var info = memberstack.information
          USERS.doc(member.id).set(info, { merge: true })
            .then(doc => firebaseUser = doc.data())
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

// firebaseAuth()
function firebaseAuth() {
  // Sign in anonymously to restrict firestore access to makerpad.com
  firebase.auth().signInAnonymously()
    .then(user => console.log('Firebase signed in anon'))
    .catch(error => console.log(error))

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      firebaseUser = user
      // console.log(firebaseUser)
      document.getElementById('member').style.display = 'block'
    } else {

    }
  })
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

$().ready(async () => {
  // total company follows
  // set users tutorials, companies, user
  // $('.current-user-content').hide()
})

function isCurrentUserContent(checkValue) {
  return false
}

function userSavedTutorial(id) {
  return userTutorial.some(item => item.tutorialId === id && item.watchLater == true)
}

function userFollowsCompany(id) {
  return userCompany.some(item => item.companyId === id && item.followed == true)
}

function userLikesProject(id) {
  return userProject.some(item => item.projectId === id && item.followed == true)
}

function userFollowsUser(id) {
  return userUser.some(item => item.targetUser === id && item.followed == true)
}

function followProject(projectId, reverse) {
  if (!currentUser) return console.log('no currentUser')
  updateProject(projectId, {
    userId: currentUser.id,
    projectId,
    followed: reverse ? false : true
  })
  PROJECTS.doc(projectId).update({
    likes: reverse ? decrement : increment
  })
}

async function getCollections() {
  await USER_PROJECT
    .where("userId", "==", currentUser.id)
    .where("followed", "==", true)
    .get()
    .then(snapshot => {
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      userProject = records
      return records
    })

  await USER_USER
    .where("userId", "==", currentUser.id)
    .get()
    .then(snapshot => {
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      userUser = records
      return records
    })

  await USER_TUTORIAL
    .where("userId", "==", currentUser.id)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      userTutorial = records
      return records
    })

  await USER_COMPANY
    .where("userId", "==", currentUser.id)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      userCompany = records
      return records
    })

  await COMPANY
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      companyCollection = records
      return records
    })

  await PROJECTS
    .get()
    .then(snapshot => {
      if (snapshot.empty) return false
      let records = snapshot.docs.map(doc => doc.data())
      console.log(records)
      projectCollection = records
      return records
    })
}

async function updateProject(id, object) {
  await USER_PROJECT.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))
}

function markTutorialComplete(tutorialId, reverse) {
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