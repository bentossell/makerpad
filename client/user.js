// TODO: Dashboard page
// TODO: Ability to add to dashboard/complete/delete for different CMS types - eg add tools to my dashboard
// TODO: Public profile to mirror dashboard
const USERS = db.collection('memberstack_users')
const USER_TUTORIAL = db.collection('user_tutorial')
const USER_COMPANY = db.collection('user_company')

async function getUserFromMemberstack() {

}

async function getUser() {
  let user = {}
  // let userId = new URLSearchParams(window.location.search).get('user')

  if (userId) USERS.doc(userId).get()
    .then(doc => {
      user = doc.data()
      $('#username').text(user.name)
      $('.user-image').attr("src", user.profileImage).show()
      console.log(user)
    })
    .catch(error => console.log(error))

  // or search
  if (userId) USERS.where("name", "==", "Mike Williams").limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return
      console.log(snapshot.docs[0].data())
    })
    .catch(error => console.log(error))
}

// TODO: Post projects
function createProject() {
  db.collection('projects').add({
    user: currentUser.id,
    name: 'test project',
    description: 'this is my test project'
  })
    .then(() => handleSuccess('Project added'))
    .catch(error => handleError(error))
}

function followCompany(companyId) {
  updateCompany(companyId, { followed: true })
}

// TODO: Like others projects
function followProject(projectId) {
  USERS.doc(currentUser.id).collection('projects').doc(projectId).set({
    followed: true
  })
    .then(doc => console.log('Project liked'))
    .catch(error => handleError(error))
}

// TODO: Mark tutorials to watch later
function markTutorialWatchLater(tutorialId) {
  updateTutorial(tutorialId, {
    watchLater: true
  })
}

// TODO: Mark tutorials as complete
function markTutorialComplete(tutorialId) {
  updateTutorial(tutorialId, {
    complete: true,
    watchLater: false
  })
}

function updateTutorial(id, object) {
  USERS.doc(currentUser.id).collection('tutorials').doc(id).set(object, { merge: true })
    .catch(error => handleError(error))

  USER_TUTORIAL.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .catch(error => handleError(error))
}

function updateCompany(id, object) {
  USERS.doc(currentUser.id).collection('companies').doc(id).set(object, { merge: true })
    .catch(error => handleError(error))

  USER_COMPANY.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .catch(error => handleError(error))
}

function updateProfileImage(file) {
  storage.ref()
    .child(`profile_images/${currentUser.id}`)
    .put(file)
    .catch(error => handleError(error))
}

// TODO: Profile picture, URLS, emails,