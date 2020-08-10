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

var currentUser = { id: 'UNKNOWN' }
var firebaseUser = {}

const COMPANY = db.collection('company')
const TUTORIAL = db.collection('tutorial')
const USERS = db.collection('memberstack_users')
const USER_TUTORIAL = db.collection('user_tutorial')
const USER_USER = db.collection('user_user')
const USER_COMPANY = db.collection('user_company')

let increment = firebase.firestore.FieldValue.increment(1)
let decrement = firebase.firestore.FieldValue.increment(-1)

MemberStack.onReady.then(async function (member) {
  console.log(member)
  currentUser = member
  if (member.id) {
    USERS.doc(member.id).get()
      .then(doc => {
        if (doc.exists) {
          firebaseUser = doc.data()
        } else {
          let info = memberstack.information
          USERS.doc(member.id).set(info, { merge: true })
            .then(doc => firebaseUser = doc.data())
        }
      })
      .catch(error => console.log(error))
  } else {
    console.log('no memberstack user')
  }
})

function handleError(error) {
  console.error(error)
  $('#firebase-notification').text(error)
  $('#firebase-notification').show()
  setTimeout(() => $('#firebase-notification').hide(), 4000)
}

function handleSuccess(message) {
  console.log(message)
  $('#firebase-notification').text(message)
  $('#firebase-notification').show()
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

// function firebaseUi() {
//   var firebaseAuthUi = new firebaseui.auth.AuthUI(firebase.auth())
//   firebaseAuthUi.start('#firebaseui-auth-container', {
//     callbacks: {
//       signInSuccessWithAuthResult: function (authResult, redirectUrl) {
//         return true
//         $('.member-only').show()
//       },
//       uiShown: function () {

//       }
//     },
//     signInOptions: [
//       {
//         provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
//         requireDisplayName: true
//       }
//     ]
//   })
// }