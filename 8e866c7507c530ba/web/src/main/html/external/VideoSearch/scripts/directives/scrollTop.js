angular.module('VideoSearchApp')
	.directive('scrollTop', function () {
		return {
			restrict: 'A',
			controller: function ($scope, $element) {
				$scope.$watch('resetScrollTop', function () {
					$element.parent()[0].scrollTop = 0;
				});
			}
		};
	});