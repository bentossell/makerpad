function getUserFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

async function getUser() {
  let user = {}
  // let userId = new URLSearchParams(window.location.search).get('user')

  if (userId) USERS.doc(userId).get()
    .then(doc => {
      user = doc.data()
      $('#username').text(user.name)
      $('.user-image').attr("src", user.profileImage).show()
      console.log(user)
    })
    .catch(error => console.log(error))

  // or search
  if (userId) searchUserBySlug(getUserFromUrl())
}

function searchUserBySlug(slug) {
  return USERS.where("slug", "==", slug).limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) return
      console.log(snapshot.docs[0].data())
    })
    .catch(error => console.log(error))
}
