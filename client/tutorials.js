const increment = firebase.firestore.FieldValue.increment(1)
const decrement = firebase.firestore.FieldValue.increment(-1)

function viewedTutorial(id = 'C36CUuTgkhr1p6P8cQn5') {
  TUTORIALS
    .doc(id)
    .update({ views: increment })
    .then(doc => console.log(doc))
    .catch(error => console.log(error))
}

function getTutorialFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function markTutorialWatchLater(tutorialId) {
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    watchLater: true
  })
}

function markTutorialComplete(tutorialId) {
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    complete: true,
    watchLater: false
  })
}

function updateTutorial(id, object) {
  USER_TUTORIAL.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .catch(error => handleError(error))

  USERS.doc(currentUser.id).collection('tutorials').doc(id).set(object, { merge: true })
    .catch(error => handleError(error))
}

// $('.cc-saved-counter').text(savedNum)
// $('.cc-completed-counter').text(completeNum)

// mark watch later
$('.cc-save-item.cc-unchecked').click(() => {
  let tutorial = getTutorialFromUrl()
  markTutorialWatchLater(tutorial)
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})

// unmark watch later
$('.cc-save-item.cc-checked').click(() => {
  let tutorial = getTutorialFromUrl()
  markTutorialWatchLater(tutorial)
  $('.cc-save-item.cc-checked').hide()
  $('.cc-save-item.cc-unchecked').show()
})

// mark complete
$('.cc-mark-as-complete.cc-unchecked').click(() => {
  let tutorial = getTutorialFromUrl()
  markTutorialComplete(tutorial)
  $('.cc-mark-as-complete.cc-checked').show()
  $('.cc-mark-as-complete.cc-unchecked').hide()
})

// unmark complete
$('.cc-mark-as-complete.cc-checked').click(() => {
  let tutorial = getTutorialFromUrl()
  markTutorialComplete(tutorial)
  $('.cc-mark-as-complete.cc-checked').hide()
  $('.cc-mark-as-complete.cc-unchecked').show()
})