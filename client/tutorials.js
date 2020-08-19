let tutorial = getTutorialFromUrl()

$().ready(async () => {
  tutorial = getTutorialFromUrl()
  if (tutorial && currentUser) {
    await getCollections()

    if (userSavedTutorial(tutorial)) {
      $('.cc-save-item.cc-checked').show()
      $('.cc-save-item.cc-unchecked').hide()
    } else {
      $('.cc-save-item.cc-checked').hide()
      $('.cc-save-item.cc-unchecked').show()
    }
    if (userCompletedTutorial(tutorial)) {
      $('.cc-mark-as-complete.cc-checked').show()
      $('.cc-mark-as-complete.cc-unchecked').hide()
    } else {
      $('.cc-mark-as-complete.cc-checked').hide()
      $('.cc-mark-as-complete.cc-unchecked').show()
    }
  }
  tutorialFollowers()
})

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
  if (!currentUser.id) return
  updateTutorial(tutorialId, {
    userId: currentUser.id,
    tutorialId,
    watchLater: reverse ? false : true
  })
  TUTORIAL.doc(tutorialId).update({
    saves: reverse ? decrement : increment
  })
}

// function userSavedTutorial(id) {
//   if (!currentUser) return
//   return USER_TUTORIAL
//     .where("userId", "==", currentUser.id)
//     .where("tutorialId", "==", id)
//     .limit(1).get()
//     .then(snapshot => {
//       if (snapshot.empty) return false
//       console.log(snapshot.docs[0].data())
//       return snapshot.docs[0].data()
//     })
//     .catch(error => console.log(error))
// }

function tutorialFollowers() {
  if (!currentUser || !currentUser.id) return false
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