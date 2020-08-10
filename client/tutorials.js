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

function markTutorialComplete(tutorialId, reverse) {
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    completed: reverse ? false : true,
    watchLater: reverse ? true : false
  })
}

function updateTutorial(id, object) {
  USER_TUTORIAL.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(doc => console.log(object))
    .catch(error => handleError(error))

  // USERS.doc(currentUser.id).collection('tutorial').doc(id).set(object, { merge: true })
  //   .then(doc => console.log(object))
  //   .catch(error => handleError(error))
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
      $('.cc-completed-counter').text(saved.length)
      $('.cc-saved-counter').text(completed.length)
    })
}

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
  $('.cc-mark-as-complete.cc-checked').show()
  $('.cc-mark-as-complete.cc-unchecked').hide()
})

// unmark complete
$('.cc-mark-as-complete.cc-checked').click(() => {
  markTutorialComplete(tutorial, true)
  $('.cc-mark-as-complete.cc-checked').hide()
  $('.cc-mark-as-complete.cc-unchecked').show()
})