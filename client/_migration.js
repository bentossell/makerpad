// migrateCompanies()
// migrateTutorials()
// migrateRecommends()
// fillUserNames()
// changeTargetUsers()
// addCompanyLikes()
// tutorialCompanies()
// updateCompanyLikes()

async function updateCompanyLikes() {
  db.collection('company').get()
    .then(async snap => {
      for (doc of snap.docs) {
        console.log(doc.id)
        await db.collection('user_company')
          .where('followed', '==', true)
          .where('companyId', '==', doc.id)
          .get()
          .then(snapshot => {
            console.log(snapshot.size)
            doc.ref.update({ likes: snapshot.size })
          })
      }
    })
}

async function tutorialCompanies() {
  await db.collection('tutorial').get()
    .then(snapshot => {
      snapshot.forEach(async doc => {
        let data = doc.data()

        if (data.companies) {
          let companyArray = []
          for (let company of data.companies) {
            let slug = await getItemSlug(company)
            companyArray.push(slug)
          }
          console.log(data.slug + ' ' + companyArray)
          await doc.ref.update({
            tools_used: companyArray
          })
        }
      })
    })
}

function addCompanyLikes() {
  db.collection('user_tutorial').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let data = doc.data()
        if (data.watchLater || data.completed) {
          db.doc(`tutorial/${data.tutorialId}`).update({
            saves: increment
          }).then(() => console.log(data))
        }
        // if (data.completed == true) {
        //   db.doc(`tutorial/${data.tutorialId}`).update({
        //     completes: increment
        //   }).then(() => console.log(data))
        // }
      })
    })
}

async function changeTargetUsers() {
  db.collection('user_user').get()
    .then(snapshot => {
      snapshot.forEach(snap => {
        let data = snap.data()
        console.log(data)
        if (data.recommendedUser) {
          snap.ref.update({ targetUser: data.recommendedUser, recommendedUser: firebase.firestore.FieldValue.delete() })
        }
        if (data.followedUser) {
          snap.ref.update({ targetUser: data.followedUser, followedUser: firebase.firestore.FieldValue.delete() })
        }
      })
    })
}

async function fillUserNames() {
  let users = []
  await db.collection('u').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })
  users = users.reverse()
  for (let user of users) {
    let memberstackId = await searchMemberstackUserByEmail(user.email)
    if (!memberstackId.id) continue
    console.log(memberstackId.username + ' exists')
    if (memberstackId.username) continue
    // let slug = await getItemSlug(company)
    console.log(`${memberstackId.id} - ${user.slug}`)
    console.log({ _cmsItem: user })
    await db.collection('memberstack_users').doc(memberstackId.id).update({
      username: user.slug,
      _cmsItem: user
    })
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

async function migrateCompanies() {
  let users = []
  await db.collection('u').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  for (let user of users) {
    if (user.companies) {
      let memberstackId = await searchMemberstackUserByEmail(user.email)
      if (!memberstackId) continue
      for (let company of user.companies) {
        let companySlug = await getItemSlug(company)
        console.log(companySlug, memberstackId)
        await db.collection('user_company').doc(`${memberstackId}-${companySlug}`).set({
          cmsId: company,
          cmsUser: user._id,
          companyId: companySlug,
          userId: memberstackId,
          followed: true
        })
      }
    }
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

async function migrateTutorials() {
  let users = []
  await db.collection('u').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  for (let user of users) {
    if (user['my-list']) {
      let memberstackId = await searchMemberstackUserByEmail(user.email)
      if (!memberstackId) continue
      for (let company of user['my-list']) {
        let companySlug = await getItemSlug(company)
        console.log(companySlug, memberstackId)
        await db.collection('user_tutorial').doc(`${memberstackId}-${companySlug}`).set({
          cmsId: company,
          cmsUser: user._id,
          tutorialId: companySlug,
          userId: memberstackId,
          // watchLater: false,
          // completed: true
          watchLater: true
        })
      }
    }
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

async function migrateRecommends() {
  let users = []
  await db.collection('u').get()
    .then(snapshot => {
      return snapshot.forEach(doc => {
        users.push(doc.data())
      })
    })

  for (let user of users) {
    if (user['recommender']) {
      for (let company of user['recommender']) {
        // let companySlug = await getItemSlug(company)
        let { email } = await getItem(company)
        let memberstackId = await searchMemberstackUserByEmail(email)
        console.log(user.slug, memberstackId)
        if (!user.slug || !memberstackId) continue
        await db.collection('user_user').doc(`${memberstackId}-${user.slug}`).set({
          // cmsId: company,
          // cmsUser: user._id,
          targetUser: user.slug,
          userId: memberstackId,
          recommended: true
        })
      }
    }
  }
  // let memberstackId = await searchMemberstackUserByEmail(email)
  // console.log(users.length)
}

function getItemSlug(_id) {
  return db.collection('WEBFLOW_ITEMS').doc(_id).get()
    .then(doc => doc.data().slug)
    .catch(error => handleError(error))
}

function getItem(_id) {
  return db.collection('WEBFLOW_ITEMS').doc(_id).get()
    .then(doc => doc.data())
    .catch(error => handleError(error))
}

function searchMemberstackUserByEmail(email) {
  return db.collection('memberstack_users')
    .where("email", "==", email)
    .get()
    .then(snapshot => {
      if (snapshot.size == 0) return false
      return snapshot.docs[0].data()
    })
}