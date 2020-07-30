// Follow products
var url = window.location.pathname;
const itemSlug = url.substring(url.lastIndexOf('/')+1);

MemberStack.onReady.then(async function (member) {
  if (member.loggedIn) {
    const metadata = await member.getMetaData();
    metadata.followList = metadata.followList || [];
    const followNum = metadata.followList.length || 0;
    $('.cc-follow-count').text(followNum);

    // show/hide watchlist buttons
    if (metadata.followList.indexOf(itemSlug) === -1) {
      $('.cc-follow-product.cc-checked').hide();
      console.log("not following");
    }
    else {
      console.log("following");
      $('.cc-follow-product.cc-unchecked').hide();
    }


    $('.cc-follow-product.cc-unchecked').click(function () {
      if (metadata.followList.indexOf(itemSlug) === -1) {
        metadata.followList.push(itemSlug);
        const followNum = metadata.followList.length || 0;
        metadata.followItemsNum = followNum;
        member.updateMetaData(metadata);
        $('.cc-follow-count').text(followNum);
        $('.cc-follow-product.cc-checked').show();
        $('.cc-follow-product.cc-unchecked').hide();
      }
    });
  }
});
