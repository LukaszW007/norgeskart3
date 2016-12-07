angular.module('searchSeEiendomPanel')
    .directive('searchSeEiendomPanel', ['$window', 'toolsFactory', 'mainAppService', '$http',
        function($window, toolsFactory,mainAppService, $http) {
            return {
                templateUrl: 'components/transclusions/searchPanel/searchSeEiendomPanel/searchSeEiendomPanel.html',
                restrict: 'A',
                link: function (scope) {
                    scope.openEindomInformasjon = function () {
                        // $window.open(scope.searchOptionsDict['seEiendom'].url, '_blank');
                        var eiendomUrl = scope.searchOptionsDict['seEiendom'].url;
                        var iframeWidth = 0;
                        var iframeHeight = 0;
                        var bodyHeight = $window.innerHeight;
                        var bodyWidth = $window.innerWidth;
                        var isMobile = $window.matchMedia("only screen and (max-width: 760px)");
                        if (isMobile.matches) {
                            iframeHeight = Math.floor(bodyHeight - 70);
                            iframeWidth = Math.floor(bodyWidth - 50);
                        }else{
                            iframeHeight = Math.floor(bodyHeight - 300);
                            iframeWidth = Math.floor(bodyWidth - 300);
                        }

                        $.featherlight({iframe: eiendomUrl, iframeMaxWidth: '100%', iframeWidth: iframeWidth,
                            iframeHeight: iframeHeight});
                    };

                    scope.showSelection = function () {
                        var addLayerUrlTool = toolsFactory.getToolById("AddLayerUrl");
                        if (!scope.showSelectionCheckbox) {
                            addLayerUrlTool.additionalOptions.show = false;
                        }
                        else {
                            addLayerUrlTool.additionalOptions.show = true;
                            addLayerUrlTool.additionalOptions.url = mainAppService.generateMatrikkelWfsFilterUrl(scope.searchOptionsDict['seEiendom']);
                            addLayerUrlTool.additionalOptions.geometryName = 'FLATE';
                            addLayerUrlTool.additionalOptions.style = new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: 'rgba(255,255,102,0.6)'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(255,255,102,1)',
                                    width: 1
                                })
                            });
                        }
                        toolsFactory.activateTool(addLayerUrlTool);
                        toolsFactory.deactivateTool(addLayerUrlTool);
                    };

                    var setMenuListMaxHeight = function () {
                        $(document).ready(function() {
                            var isMobile = $window.matchMedia("only screen and (max-width: 760px)");
                            if (isMobile.matches) {
                                fixElementHeight(120);
                            }else{
                                fixElementHeight(220);
                            }
                        });
                    };

                    function fixElementHeight(moveUpFromBottom){
                        var bodyHeight = $window.innerHeight;
                        var menuListMaxHeight = Math.floor(bodyHeight - moveUpFromBottom);
                        var searchContentElements = document.getElementsByClassName("search-content");
                        for (var i = 0; i < searchContentElements.length; i++){
                            var element = searchContentElements[i];
                            element.style.maxHeight = menuListMaxHeight + 'px';
                        }
                    }

                    var _getEiendomAdresse = function () {
                        var komunenr =scope.searchOptionsDict['seEiendom'].kommunenr;
                        var gardsnr = scope.searchOptionsDict['seEiendom'].gardsnr;
                        var bruksnr = scope.searchOptionsDict['seEiendom'].bruksnr;
                        var festenr = scope.searchOptionsDict['seEiendom'].festenr;
                        var sectionsnr = scope.searchOptionsDict['seEiendom'].seksjonsnr;
                        var url = mainAppService.generateEiendomAddress(komunenr, gardsnr, bruksnr, festenr, sectionsnr);
                        $http.get(url).then(function (response) {
                            scope.vegaddresse = '';
                            scope.kommuneNavn = '';
                            scope.cityName = '';
                            var addressNum = [];
                            var responseData = response.data;
                            for (var i = 0; i < responseData.length; i++){
                                var adressWithNum = responseData[i].VEGADRESSE2.split(" ");
                                if (scope.vegaddresse === ''){
                                    scope.vegaddresse = adressWithNum[0];
                                }
                                if (scope.kommuneNavn === ''){
                                    scope.kommuneNavn = responseData[i].KOMMUNENAVN;
                                }
                                if (scope.cityName === '' && responseData[i].VEGADRESSE !== ""){
                                    scope.cityName = responseData[i].VEGADRESSE[1];
                                }
                                addressNum.push(adressWithNum[adressWithNum.length - 1]);
                            }

                            addressNum.sort(function(a, b){
                                if(a < b){
                                    return -1;
                                }
                                if(a > b){
                                    return 1;
                                }
                                return 0;
                            });

                            for (var j = 0; j < addressNum.length; j++){
                                if (addressNum[j] !== ""){
                                    scope.vegaddresse += " " + addressNum[j];
                                    if (j !== addressNum.length - 1){
                                        scope.vegaddresse += ",";
                                    }
                                }
                            }
                        });
                    };

                    $( document ).ready(function() {
                        $($window).resize(setMenuListMaxHeight);
                        setMenuListMaxHeight();
                        _getEiendomAdresse();
                    });
                }
            };
        }]);