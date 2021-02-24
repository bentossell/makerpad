setTimeout(() => {
  $('[name="username"]').val(firebaseUser.username)
  $('[name="website-url"]').val(firebaseUser['website-url'] || firebaseUser['website-2'])
  $('[name="twitter-url"]').val(firebaseUser['twitter-url'] || firebaseUser['twitter-2'])
  $('[name="newsletter"]').val(firebaseUser.newsletter)
  $('[name="youtube"]').val(firebaseUser.youtube)
  $('[name="location"]').val(firebaseUser.location)
  $('[name="bio"]').val(firebaseUser.bio || firebaseUser['bio-5'])
  $('[name="sponsor"]').val(firebaseUser.sponsor)
  $('[name="hire"]').val(firebaseUser.hire)
}, 2000)

$('#wf-form-Editing-Profile').submit(function (event) {
  event.preventDefault()
  let data = objectifyForm($(this).serializeArray())
  data = data.filter(i => i.value)
  console.log(data)
  updateUser(data)
})

async function updateUser(data) {
  console.log(firebaseUser)
  if (!firebaseUser || firebaseUser.username === data.username || await searchUserBySlug(slugify(data.username)) == false) {
    data.username = slugify(data.username)
    return USERS.doc(currentUser.id).set({
      user: currentUser.id,
      ...data
    }, { merge: true })
      .then(() => {
        let image = $('#profile-pic')[0].files[0] || null
        if (image) {
          console.log(image)
          storage
            .ref()
            .child(`profile_pictures/${data.username}`)
            .put(image)
            .then((snapshot) => {
              return snapshot.ref.getDownloadURL().then(async (imageUrl) => {
                console.log(imageUrl)
                let body = {
                  imageUrl,
                  'profile-pic': {
                    url: imageUrl
                  }
                }
                await USERS.doc(currentUser.id).set(body, { merge: true })
                await U.doc(data.username).set(body, { merge: true })
                currentUser.updateProfile({
                  'profile-pic': imageUrl
                }, false)
              })
            })

          // store memberstack redundantly for now
          storage
            .ref()
            .child(`memberstack_pictures/${currentUser.id}`)
            .put(image)
        }
        MemberStack.onReady.then(function (member) {
          if (!member) return console.log('no member')
          member.updateProfile({
            'full-name': data['full-name'],
            'profile-link': `https://makerpad.co/u/${data.username}`,
          }, false)
        })
        // METADATA
        handleSuccess('User updated')
        $('#wf-form-Editing-Profile')[0].reset()
      })
      .catch(error => handleError(error))
  } else {
    return handleError('Username already exists')
  }
}

function searchUserBySlug(slug) {
  return USERS.where("username", "==", slug).limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) {
        return db.collection('u').where("slug", "==", slug).limit(1).get()
          .then(snapshot => {
            return !snapshot.empty
          })
      }
      console.log(snapshot.docs[0].data())
      return true
    })
    .catch(error => console.log(error))
}