var company = getElementFromURL()

$().ready(async () => {
  $('.cc-follow-product.cc-checked').hide()
  company = getElementFromURL()
  console.log('company: ' + company)
  console.log('currentUser: ' + currentUser)
  await getCollections()
  if (company && currentUser) {
    if (userFollowsCompany(company)) {
      $('.cc-follow-product.cc-checked').show()
      $('.cc-follow-product.cc-unchecked').hide()
    } else {
      $('.cc-follow-product.cc-checked').hide()
      $('.cc-follow-product.cc-unchecked').show()
    }
    companyFollowers()
  }
})

function companyFollowers() {
  return USER_COMPANY
    .where("companyId", "==", company)
    .get()
    .then(snapshot => {
      $('.cc-follow-count').text(snapshot.size)
      let users = snapshot.docs.map(doc => doc.data().user)
      console.log(users)
      renderUsers('#tool-users', users)
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