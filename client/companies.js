var company = getElementFromURL()

$().ready(async () => {
  $('.cc-follow-product.cc-checked').hide()
  if (!debugMode) $('#user-workflows, #tool-reviews').empty()
  company = getElementFromURL()
  console.log('company: ' + company)
  console.log('currentUser: ' + currentUser)
  getCollections().then(() => {
    if (company && currentUser) {
      if (userFollowsCompany(company)) {
        $('.cc-follow-product.cc-checked').show()
        $('.cc-follow-product.cc-unchecked').hide()
      } else {
        $('.cc-follow-product.cc-checked').hide()
        $('.cc-follow-product.cc-unchecked').show()
      }
      companyFollowers()
      var companyProjects = firebaseCollections['projects'].filter(item => item.tags && item.tags.includes(company))
      var companyReviews = firebaseCollections['reviews'].filter(item => item.companyId === company)
      var companyWorkflows = firebaseCollections['workflows'].filter(item => item.tags && item.tags.includes(company))
      renderProjects('.recent-projects', companyProjects)
      renderReviews('#tool-reviews', companyReviews)
      renderWorkflows('#user-workflows', companyWorkflows, 1)
    }
  })
})

function companyFollowers() {
  return USER_COMPANY
    .where("companyId", "==", company)
    .get()
    .then(snapshot => {
      $('.cc-follow-count').text(snapshot.size)
      let users = snapshot.docs.map(doc => doc.data().user)
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

$('#wf-form-Tool-Comment').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  console.log(data)
  // reviewCompany(company)
  let object = {
    companyId: company,
    userId: currentUser.id,
    review: data.review
  }
  if (!data.review || !currentUser.id) return
  REVIEWS.doc(currentUser.id + '-' + company).set(object, { merge: true })
    .then(() => console.log(object))
    .catch(e => handleError(e))
})

// function reviewCompany(company) {
//   if (!currentUser.id) return
//   updateCompany(companyId, {
//     userId: currentUser.id,
//     companyId,
//     review: reverse ? false : true
//   })
// }