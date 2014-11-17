var restaurant = angular.module("Restaurant", []);

restaurant.controller("AppController", ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

	// Set menu variable to null until it is loaded.
	$scope.menu = null;

	// Set the default index of what party member the user is ordering for
	$scope.orderingFor = 0;

	// Build the party array of objects
	$scope.party = [
		{
			"title": "Jon",
			"order": {
				Starters: {
					"items": []
				},
				Mains: {
					"items": []
				},
				Desserts: {
					"items": []
				}
			}
		},
		{
			"title": "Jake",
			"order": {
				Starters: {
					"items": []
				},
				Mains: {
					"items": []
				},
				Desserts: {
					"items": []
				}
			}
		}
	];

	// Set total price, through $rootScope, so it is accessible anywhere in the app
	$rootScope.totalPrice = 0;

	// Change the orderingFor variable when the user wants to order for someone else
	$scope.changeOrderingFor = function(index) {
		$scope.orderingFor = index;
	}

	// Check the order, from the restaurants rules
	$scope.orderCheck = function() {

		for (var i = $scope.party.length - 1; i >= 0; i--) {
			
			if($scope.party[i].order.Mains.items.length == 0) {
				// Regardless of anything else, this restaurant requires that each party member has a main
				return true;
			}
			if ($scope.party[i].order.Starters.items.length == 0 && $scope.party[i].order.Desserts.items.length == 0) {
				// Each party member must have two courses!
				return true;
			}

			return false;

		};

	};

}]);

restaurant.controller("MenuController",  ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

	// Load the menu
    $http.get('js/menu.json').success(function(data) {
        $scope.menu = data;
        // Set menu to data recieved from server
    }).error(function () {

    	// If there's an error, tell the user!
        alert('Menu failed to load.');
    });

    // Adding items to the order
    $scope.addToOrder = function(item, category) {

    	// Change quantity of the item. Useful for the Cheesecake rule at this restaurant.
    	if(item.quantity != null) {
    		item.quantity = item.quantity - 1;
    	}

    	// The user doesn't have a fishy product... yet.
    	var hasFishyProduct = false;

    	// Check the user hasn't already ordered something from this course
    	if($scope.party[$scope.orderingFor].order[category.title].items.length == 0) {

    		// If the user has a Prawn Cocktail from starters, change hasFishyProduct to true
			for (var i = $scope.party[$scope.orderingFor].order.Starters.items.length - 1; i >= 0; i--) {
				if($scope.party[$scope.orderingFor].order.Starters.items[i].title == "Prawn Cocktail") {
					hasFishyProduct = true;
				}
			};

			// Or, if the user has the Salmon Fillet
			for (var i = $scope.party[$scope.orderingFor].order.Mains.items.length - 1; i >= 0; i--) {
				if($scope.party[$scope.orderingFor].order.Mains.items[i].title == "Salmon Fillet") {
					hasFishyProduct = true;
				}
			};

			// If the item the user is adding is Salmon Fillet or Prawn Cocktail...
			if(item.title == "Salmon Fillet" || item.title == "Prawn Cocktail") {
				// and they already have a fishy product
				if(hasFishyProduct) {
					// Pierre steps in!
					alert('Pierre thinks there\'s something too fishy about this order...');
					return false;
				}
			}

			// Otherwise, add the item and add to the price
			$scope.party[$scope.orderingFor].order[category.title].items.push(item);
			$rootScope.totalPrice = parseInt($rootScope.totalPrice) + parseInt(item.price);

		} else {
			// Tell the user they can't have two dishes from the same course
			alert('You can\'t have two ' + category.title + ' dishes!');
			return false;
		}

		return false;

    };

}]);