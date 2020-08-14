let company = getCompanyFromUrl()

$().ready(async () => {
  company = getCompanyFromUrl()
  console.log('company: ' + company)
  console.log('currentUser: ' + currentUser)
  if (company && currentUser) {
    let isSaved = userFollowsCompany(company)
    if (isSaved) {
      $('.cc-follow-product.cc-checked').show()
      $('.cc-follow-product.cc-unchecked').hide()
    }
    companyFollowers()
  }
})

function getCompanyFromUrl() {
  var url = window.location.pathname
  return url.substring(url.lastIndexOf('/') + 1)
}

function followCompany(companyId, reverse) {
  if (!currentUser.id) return
  updateCompany(companyId, {
    userId: currentUser.id,
    companyId,
    followed: reverse ? false : true
  })
  COMPANY.doc(companyId).update({
    likes: reverse ? decrement : increment
  })
}

async function updateCompany(id, object) {
  await USER_COMPANY.doc(`${currentUser.id}-${id}`).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(error => handleError(error))
}

// function userFollowsCompany(id) {
//   console.log(currentUser)
//   if (currentUser && currentUser.id) {
//     return USER_COMPANY
//       .where("userId", "==", currentUser.id)
//       .where("companyId", "==", id)
//       .limit(1).get()
//       .then(snapshot => {
//         if (snapshot.empty) return false
//         console.log(snapshot.docs[0].data())
//         return snapshot.docs[0].data()
//       })
//       .catch(error => console.log(error))
//   } else return false
// }

function companyFollowers() {
  return USER_COMPANY
    .where("companyId", "==", company)
    .get()
    .then(snapshot => {
      $('.cc-follow-count').text(snapshot.size)
    })
}

// follow
$('.cc-follow-product.cc-unchecked').click(() => {
  followCompany(company)
  $('.cc-follow-product.cc-checked').show()
  $('.cc-follow-product.cc-unchecked').hide()
})

// unfollow
$('.cc-follow-product.cc-checked').click(() => {
  followCompany(company, true)
  $('.cc-follow-product.cc-checked').hide()
  $('.cc-follow-product.cc-unchecked').show()
})