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

const USERS = db.collection('memberstack_users')
const TUTORIALS = db.collection('tutorials')
const PROJECTS = db.collection('p')
const USER_TUTORIAL = db.collection('user_tutorial')
const USER_COMPANY = db.collection('user_company')
const USER_PROJECT = db.collection('user_project')

MemberStack.onReady.then(async function (member) {
  if (member.id) {
    db.collection('memberstack_users').doc(member.id).get()
      .then(doc => {
        currentUser = doc.data()
      })
      .catch(error => console.log(error))
  } else {
    console.log('no memberstack user')
  }
})

function handleError(error) {
  console.error(error)
  Sentry.captureException(error)
  $('#firebase-error').text(error)
  $('#firebase-error').show()
  setTimeout(() => $('#firebase-error').hide(), 4000)
}

function handleSuccess(message) {
  console.log(message)
  $('#firebase-success').text(message)
  $('#firebase-success').show()
  setTimeout(() => $('#firebase-success').hide(), 4000)
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