let tutorial = getTutorialFromUrl()

function viewedTutorial(id) {
  TUTORIAL
    .doc(id)
    .update({ views: increment })
    .then(doc => console.log(doc))
    .catch(error => console.log(error))
}

function getTutorialFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function markTutorialWatchLater(tutorialId, reverse) {
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    watchLater: reverse ? false : true
  })
}

function userSavedTutorial(id) {
  return USER_TUTORIAL
    .where("userId", "==", currentUser.id)
    .where("tutorialId", "==", id)
    .limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return false
      console.log(snapshot.docs[0].data())
      return snapshot.docs[0].data()
    })
    .catch(error => console.log(error))
}

function tutorialFollowers() {
  return USER_TUTORIAL
    .where("tutorialId", "==", tutorial)
    .get()
    .then(snapshot => {
      let docs = snapshot.docs.map(doc => doc.data())
      console.log(docs)
      let saved = docs.filter(item => item.watchLater == true)
      let completed = docs.filter(item => item.completed == true)
      console.log({ completed, saved })
      $('.cc-completed-counter').text(completed.length)
      $('.cc-saved-counter').text(saved.length)
    })
}

// Listen for updates to users tutorials or companies
USER_TUTORIAL
  .onSnapshot(function (snapshot) {
    let userTutorials = snapshot.docs.map(doc => doc.data())
    console.log('user_tutorial updated', userTutorials)
    firebaseUser.tutorials = userTutorials
  }, function (error) {
    handleError(error)
  })

USER_COMPANY
  .onSnapshot(function (snapshot) {
    let userCompanies = snapshot.docs.map(doc => doc.data())
    console.log('user_tutorial updated', userTutorials)
    firebaseUser.companies = userCompanies
  }, function (error) {
    handleError(error)
  })

$().ready(async () => {
  let isSaved = await userSavedTutorial(tutorial)
  if (isSaved.watchLater == true) {
    $('.cc-save-item.cc-checked').show()
    $('.cc-save-item.cc-unchecked').hide()
  }
  if (isSaved.completed == true) {
    $('.cc-mark-as-complete.cc-checked').show()
    $('.cc-mark-as-complete.cc-unchecked').hide()
  }
  tutorialFollowers()
})

// mark watch later
$('.cc-save-item.cc-unchecked').click(() => {
  markTutorialWatchLater(tutorial)
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})

// unmark watch later
$('.cc-save-item.cc-checked').click(() => {
  markTutorialWatchLater(tutorial, true)
  $('.cc-save-item.cc-checked').hide()
  $('.cc-save-item.cc-unchecked').show()
})

// mark complete
$('.cc-mark-as-complete.cc-unchecked').click(() => {
  markTutorialComplete(tutorial)
})

// unmark complete
$('.cc-mark-as-complete.cc-checked').click(() => {
  markTutorialComplete(tutorial, true)
})