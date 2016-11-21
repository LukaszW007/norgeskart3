angular.module('searchPanel')
    .controller('searchPanelController', ['$scope', 'toolsFactory','ISY.MapAPI.Map',
        function($scope, toolsFactory, map){

            $scope.showSearchResultPanel = function () {
                $scope.searchPanelLayout = "searchResultsPanel";

            };

            $scope.showSearchOptionsPanel = function () {
                $scope.searchPanelLayout = "searchOptionsPanel";

            };

            $scope.searchPanelLayout = "searchResultsPanel";

            $scope.showSearchSeEiendomPanel = function () {
                $scope.activeSearchOptionOrder = ['kommunenr', 'gardsnr', 'bruksnr', 'festenr', 'seksjonsnr', 'eiendomstype', 'matrikkelnr'];
                $scope.activeSearchOption = $scope.searchOptionsDict['seEiendom'];
                $scope.searchPanelLayout = "searchSeEiendomPanel";

            };

            $scope.searchOptionsDict = {};

            $scope.showKoordTransPanel = function () {
                map.SetCenter($scope.activePosition);
                $scope.searchPanelLayout = "searchKoordTransPanel";
            };

            $scope.showLagTurKartPanel = function () {
                map.SetCenter($scope.activePosition);
                $scope.searchPanelLayout = "searchLagTurkartPanel";

            };

            $scope.showLagNodplakatPanel = function () {
                map.SetCenter($scope.activePosition);
                $scope.searchPanelLayout = "searchLagNodplakatPanel";

            };

            $scope.setSearchBarText = function(text) {
                $scope.searchBarModel = text;
            };

            $scope.deactivatePrintBoxSelect = function() {
                var printBoxSelectTool = toolsFactory.getToolById("PrintBoxSelect");
                toolsFactory.deactivateTool(printBoxSelectTool);
            };


        }
    ]);