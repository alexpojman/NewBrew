angular.module('starter.services', [])

.factory('Auth', ["$firebaseAuth", "$rootScope", function($firebaseAuth, $rootScope) {
  var ref = new Firebase("https://pojo-chat.firebaseio.com");
  return $firebaseAuth(ref);
}])

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}]);