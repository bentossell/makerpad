const increment = firebase.firestore.FieldValue.increment(1)
const decrement = firebase.firestore.FieldValue.increment(-1)

function viewedTutorial(id = 'C36CUuTgkhr1p6P8cQn5') {
  TUTORIALS
    .doc(id)
    .update({ views: increment })
    .then(doc => console.log(doc))
    .catch(error => console.log(error))
}