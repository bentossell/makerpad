const increment = firebase.firestore.FieldValue.increment(1)
const decrement = firebase.firestore.FieldValue.increment(-1)

// function viewedTutorial(id = 'C36CUuTgkhr1p6P8cQn5') {
//   TUTORIALS
//     .doc(id)
//     .update({ views: increment })
//     .then(doc => console.log(doc))
//     .catch(error => console.log(error))
// }
function getTutorialFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function checkRelationships() {

}

// $('.cc-saved-counter').text(savedNum)
// $('.cc-completed-counter').text(completeNum)

$('.cc-save-item').click(() => {
  markTutorialWatchLater(getTutorialFromUrl())
  $('.cc-save-item.cc-checked').show()
  $('.cc-save-item.cc-unchecked').hide()
})

$('.cc-mark-as-complete').click(() => {
  markTutorialComplete(getTutorialFromUrl())
  $('.cc-mark-as-complete.cc-checked').show()
  $('.cc-mark-as-complete.cc-unchecked').hide()
})