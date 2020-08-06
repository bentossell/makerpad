let increment = firebase.firestore.FieldValue.increment(1)
let decrement = firebase.firestore.FieldValue.increment(-1)

let tutorial = getTutorialFromUrl()

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
    complete: reverse ? false : true,
    watchLater: reverse ? true : false
  })
}

function updateTutorial(id, object) {
  USER_TUTORIAL.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(doc => console.log(object))
    .catch(error => handleError(error))

  USERS.doc(currentUser.id).collection('tutorial').doc(id).set(object, { merge: true })
    .then(doc => console.log(object))
    .catch(error => handleError(error))
}

// $('.cc-saved-counter').text(savedNum)
// $('.cc-completed-counter').text(completeNum)

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