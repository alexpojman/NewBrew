angular.module('starter.controllers', ["firebase"])

.controller('LoginCtrl', function($scope, $ionicModal, $state, $firebaseObject, Auth) {
    // If user is already logged in, move to main screen
    if(Auth.$getAuth() != null) {
      $state.go("tab.current");
    }

    //init the modal
    $ionicModal.fromTemplateUrl('templates/password-reset.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (signupModal) {
      $scope.signupModal = signupModal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.openSignupModal = function() {
      $scope.newUser = {};
      $scope.signupModal.show();
    }

    $scope.closeSignupModal = function() {
      $scope.signupModal.hide();
    }

    $scope.user = {};
    $scope.newUser = {};

    $scope.signUp = function() {
      if ($scope.newUser.password === $scope.newUser.passwordConfirm) {
        	var ref = new Firebase("https://pojo-chat.firebaseio.com/");
        	ref.createUser({
      			email    : $scope.newUser.email,
      			password : $scope.newUser.password
    		  }, function(error, userData) {
    			if (error) {
    				console.log("Error creating user:", error);
    			} else {
    				console.log("Successfully created user account with uid:", userData.uid);
    				var userRef = new Firebase('https://pojo-chat.firebaseio.com/users/' + userData.uid);
    				userRef.set({name: $scope.newUser.username});

            $scope.closeSignupModal();
            $scope.user.email = $scope.newUser.email;

    			}
    		});
      } else {
        alert("Passwords do not match");
      }
    }

    // Add Message
    $scope.signIn = function() {
      var ref = new Firebase("https://pojo-chat.firebaseio.com");
      var usersRef = new Firebase('https://pojo-chat.firebaseio.com/users');

      ref.authWithPassword({
        email         : $scope.user.email,
        password      : $scope.user.password
      }, function(error, authData) {
        if (error) {
          switch (error.code) {
            case "INVALID_EMAIL":
              alert("Invalid Email");
              break;
            case "INVALID_PASSWORD":
              alert("Invalid Password");
              break;
            case "INVALID_USER":
              
              break;
            default:
              console.log("Error logging user in:", error);
          }
        } else {
          console.log("Authenticated successfully with payload:", authData);
         
          $state.go('tab.current');

        }
      });
    };

    $scope.resetPassword = function() {
      var ref = new Firebase("https://pojo-chat.firebaseio.com");
      ref.resetPassword({
          email : $scope.user.email
        }, function(error) {
        if (error === null) {
          console.log("Password reset email sent successfully");
          $scope.modal.hide();
        } else {
          console.log("Error sending password reset email:", error);
        }
      });    
    }
})

.controller('CurrentCtrl', function($scope, $ionicModal,  $ionicActionSheet, $state, $firebaseArray, $firebaseObject, Auth, Camera) {

	//init Create New Brew Modal
  $ionicModal.fromTemplateUrl('templates/create-brew.html', {
    	scope: $scope,
    	animation: 'slide-in-up'
  }).then(function (modal) {
    	$scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/likers.html', {
  	scope: $scope,
   	animation: 'slide-in-up'
  }).then(function (likesModal) {
    	$scope.likesModal = likesModal;
  });

  $ionicModal.fromTemplateUrl('templates/comments.html', {
  	scope: $scope,
   	animation: 'slide-in-up'
  }).then(function (commentsModal) {
    	$scope.commentsModal = commentsModal;
  });

  $ionicModal.fromTemplateUrl('templates/recipe.html', {
  	scope: $scope,
   	animation: 'slide-in-up'
  }).then(function (recipeModal) {
    	$scope.recipeModal = recipeModal;
  });

  $scope.openModal = function() {
  	$scope.brew = {};
  	$scope.brew.og = 1.099;
	$scope.brew.fg = 1.001;
  	$scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.openLikesModal = function(brew) {
  	var likesRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + brew.$id + "/likes");
  	likesRef.once("value", function(snapshot) { 
  		$scope.likers = snapshot.val();
  		$scope.likesModal.show();
  	});
  };

  $scope.closeLikesModal = function() {
  	$scope.likesModal.hide();
  };

  $scope.openCommentsModal = function(brew) {
  	var commentsRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + brew.$id + "/comments");
  	commentsRef.once("value", function(snapshot) { 
  		$scope.commentsModal.show();
  	});
  };

  $scope.closeCommentsModal = function() {
  	$scope.commentsModal.hide();
  };

  $scope.openRecipeModal = function(brew) {
  	$scope.brew = brew;
  	var recipeRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + brew.$id + "/recipe");
  	recipeRef.once("value", function(snapshot) { 
  		$scope.recipeModal.show();
  	});
  };

  $scope.closeRecipeModal = function() {
  	$scope.recipeModal.hide();
  };

  //
  // Init Brews Feed 
  //
	var ref = new Firebase("https://pojo-chat.firebaseio.com/brews");
	$scope.brews = $firebaseArray(ref);

  $scope.$on('$ionicView.loaded', function(){
    $scope.curFeed = [];
    $scope.currentUser = Auth.$getAuth().uid;
    var feedRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + $scope.currentUser + "/feed/");

     // Update feed anytime a new entry is added
    feedRef.on("child_added", function(snapshot) {
        var brewsRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + snapshot.key());
        $scope.curFeed.push($firebaseObject(brewsRef));
    });
  });

	// Handle creation of new Brew
	$scope.brew = {}; 

	//
	// Handle Like button
	//
	$scope.handleLike = function(brew) {

		//TODO Change so this applies current user id and checks if already liked
		var likesRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + brew.$id + "/likes");
		
		likesRef.once("value", function(snapshot) {
			var hasUser = snapshot.hasChild(Auth.$getAuth().uid);
			
			$scope.brews[$scope.brews.$indexFor(brew.$id)].numLikes = snapshot.numChildren();

			if (!hasUser) {
        // Like
				$scope.brews[$scope.brews.$indexFor(brew.$id)].numLikes++;
				$scope.brews.$save($scope.brews.$indexFor(brew.$id)).then(function(ref) {
            likesRef.child(Auth.$getAuth().uid).set(true);
				});
			} else if (hasUser) {
        // Unlike
        $scope.brews[$scope.brews.$indexFor(brew.$id)].numLikes--;
        $scope.brews.$save($scope.brews.$indexFor(brew.$id)).then(function(ref) {
          likesRef.child(Auth.$getAuth().uid).remove();
        });
      }

		});
	}

	$scope.addBrew = function() {
		var userData = Auth.$getAuth();
		var usersRef = new Firebase("https://pojo-chat.firebaseio.com/users");
		
    // Wrap this in user name to get author for new brew
		usersRef.child(userData.uid).child("name").once("value", function(snapshot) {
			$scope.brew.abv = ((76.08*($scope.brew.og-$scope.brew.fg)/(1.775-$scope.brew.og))*($scope.brew.fg/0.794));

      if ($scope.brew.lastPhoto == null) {
        $scope.brew.lastPhoto = null;
      }

			$scope.brews.$add({
                authorID:      userData.uid, 
								author: 	     snapshot.val(), 
								date: 		     Date.now(), 
								title: 		     $scope.brew.title, 
								description:   $scope.brew.description,
								type: 		     $scope.brew.type, 
								og: 		       $scope.brew.og, 
								fg: 		       $scope.brew.fg, 
								abv: 		       $scope.brew.abv,
                image:         $scope.brew.lastPhoto,
								numLikes:      0,
								numComments:   0 
			}).then(function(ref) {

        // add to current users feed
        var feedRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + userData.uid + "/feed/" + ref.key());
        feedRef.set(true);

        // Add brew to personal brew collection 
        var ownBrewRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + userData.uid + "/brews/" + ref.key());
        ownBrewRef.set(true);
        
        // Add brew to all followers
        usersRef.child(userData.uid).child("followers").once("value", function(list) {
          list.forEach(function(follower) {
            var followerRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + follower.key());
            followerRef.child("feed").child(ref.key()).set(true);
          });
        });

        $scope.closeModal();

      });
		});
	};

  $scope.removeBrew = function(brew) {
    var userData = Auth.$getAuth();
    var usersRef = new Firebase("https://pojo-chat.firebaseio.com/users");

    // Remove from "Brews"
    var brewsRef = new Firebase("https://pojo-chat.firebaseio.com/brews/" + brew.$id);
    brewsRef.remove();

    // Remove from Current User's Feed
    var feedRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + userData.uid + "/feed/" + brew.$id);
    feedRef.remove();

    // Remove from Followers Feed
    usersRef.child(userData.uid).child("followers").once("value", function(list) {
      list.forEach(function(follower) {
        var followerRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + follower.key());
        followerRef.child("feed").child(brew.$id).remove();
      });
    });

    // Remove from curFeed
    $scope.curFeed.splice($scope.curFeed.indexOf(brew), 1);

  };

  // 
  // Brew Edit Methods
  //
  $scope.showEdit = function(brew) {

     // Show the action sheet
    $ionicActionSheet.show({
      buttons: [
       { text: 'Edit Info' },
       { text: 'Edit Recipe' }
      ],
      destructiveText: 'Delete Brew',
      titleText: 'Edit ' + brew.title,
      cancelText: 'Cancel',
      cancel: function() {
          // add cancel code..
      },
      buttonClicked: function(index) {
        
        return true;
      },
      destructiveButtonClicked: function() {
        $scope.removeBrew(brew);
        return true;
      }
    });
  };

  //
  // Handle Taking Images of brew
  //
  $scope.getPhoto = function() {
    Camera.DestinationType = {
      DATA_URL : 0,      // Return image as base64-encoded string
      FILE_URI : 1,      // Return image file URI
      NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
    };

    Camera.PictureSourceType = {
      PHOTOLIBRARY : 0,
      CAMERA : 1,
      SAVEDPHOTOALBUM : 2
    };

    Camera.EncodingType = {
      JPEG : 0,               // Return JPEG encoded image
      PNG : 1                 // Return PNG encoded image
    };

    var options = {
                quality : 75,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.CAMERA,
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 320,
                targetHeight: 320,
                saveToPhotoAlbum: false
    };
    Camera.getPicture(options).then(function(imageData) {
      console.log(imageData);
      $scope.brew.lastPhoto = imageData;
    }, function(err) {
      console.err(err);
    });
  };

  //
  // Utility Methods
  //
  $scope.checkBrewOwnership = function(brew) {
    var curUser = Auth.$getAuth().uid;

    if (curUser === brew.authorID) {
      return true;
    } else {
      return false;
    }
  };

  $scope.refreshList = function() {
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.userHasLiked = function(brew) {
    var object = $scope.curFeed[$scope.curFeed.indexOf(brew)];
    var curUser = Auth.$getAuth().uid;
    try {
      if (object.likes.hasOwnProperty(curUser)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };
})

.controller('PastCtrl', function($scope, $ionicModal, $state, $firebaseArray, $firebaseObject, Auth, Camera) {

  // Initialize Modals
  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (searchModal) {
      $scope.searchModal = searchModal;
  });

  //
  // Modal Methods
  //
  $scope.openSearchModal = function() {
    $scope.search = {};
    $scope.searchModal.show();
  };

  $scope.closeSearchModal = function() {
    $scope.searchModal.hide();
  };

  // Get Follower List & Populate
	var userData = Auth.$getAuth();

	var ref = new Firebase("https://pojo-chat.firebaseio.com/users/" + userData.uid + "/followers");

	$scope.followersList = [];

	ref.on('value', function(dataSnapshot) {
    $scope.followersList = [];
		dataSnapshot.forEach(function(follower) {
			var userRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + follower.key());
			$scope.followersList.push($firebaseObject(userRef));
		})
	});

  $scope.$on('$ionicView.loaded', function(){
    var usersRef = new Firebase("https://pojo-chat.firebaseio.com/users");
    $scope.users = $firebaseArray(usersRef);
  });
  
  $scope.currentUserIsFollowing = function(user) {
    for(var i = 0; i < $scope.followersList.length; i++) {
      if($scope.followersList[i].$id === user.$id) {
        return true
      }
    }
    
    return false;
    
  };

  $scope.followUser = function(user) {
    ref.child(user.$id).set(true);

  };
})

.controller('AccountCtrl', function($scope, $ionicModal, $firebaseObject, $state, $window, Auth) {

  /*$scope.$on('$ionicView.leave', function(){
      $window.location.reload();
  });*/

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.auth = Auth.$getAuth();
    //
    // Initialization
    //
    $scope.userSettings = {};
    var userRef = new Firebase("https://pojo-chat.firebaseio.com/users/" + $scope.auth.uid);

    $scope.userSettings.user = $firebaseObject(userRef);
  });

  $scope.saveUsername = function() {
    // Save for user
    $scope.userSettings.user.$save($scope.userSettings[0]);

    // Update all brews that have user name
    var brewsRef = new Firebase("https://pojo-chat.firebaseio.com/brews");

    brewsRef.once('value', function(dataSnapshot) {
      dataSnapshot.forEach(function(brew) {
        if(brew.child("authorID").val() === $scope.auth.uid) {
          brewsRef.child(brew.key()).update({author: $scope.userSettings.user.name});
        }
      })
    });
  };

  $scope.signOut = function() {

    var ref = new Firebase("https://pojo-chat.firebaseio.com");

    ref.unauth();

    auth = {};

    $state.go('login');
  }
});