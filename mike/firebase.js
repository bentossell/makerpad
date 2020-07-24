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

const db = firebase.firestore();

// $('#public').hide()

const USERS = db.collection('users')
const PROJECTS = db.collection('projects')
const TUTORIALS = db.collection('tutorials')
const COMPANIES = db.collection('companies')

const increment = firebase.firestore.FieldValue.increment(1)
const decrement = firebase.firestore.FieldValue.increment(-1)

let currentUser = {}

// get user ID from url parameter
async function getUser() {
  let user = {}
  let userId = new URLSearchParams(window.location.search).get('user')
  if (userId) USERS.doc(userId).get().then(doc => {
    user = doc.data()
    $('#username').text(user.name)
    $('.user-image').attr("src", user.profileImage).show()
    console.log(user)
  })

  // or search
  if (userId) USERS.where("name", "==", "Mike Williams").limit(1).get().then(snapshot => {
    if (snapshot.empty) return
    console.log(snapshot.docs[0].data())
  })
}

firebaseAuth()
function firebaseAuth() {
  // Sign in anonymously to restrict firestore access to makerpad.com
  firebase.auth().signInAnonymously().then(user => console.log(user)).catch(error => console.log(error))
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user
      console.log(currentUser)
      document.getElementById('member').style.display = 'block'
    } else {

    }
  })
}

function firebaseUi() {
  var firebaseAuthUi = new firebaseui.auth.AuthUI(firebase.auth())
  firebaseAuthUi.start('#firebaseui-auth-container', {
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        return true;
        $('.member-only').show()
      },
      uiShown: function () {

      }
    },
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: true
      }
    ]
  })
}