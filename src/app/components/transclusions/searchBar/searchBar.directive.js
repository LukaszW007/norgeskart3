angular.module('searchBar')
    .directive('searchBar', ['$timeout','mainAppService', 'ISY.MapAPI.Map',
        function($timeout, mainAppService, map
        ) {
            return {
                templateUrl: 'components/transclusions/searchBar/searchBar.html',
                transclude: true,
                restrict: 'A',
                link: function (scope) {
                    scope.searchBarValueChanged = function () {
                        if (scope.searchBarModel === '') {
                            return;
                        }
                        var query = _getQuery();
                        _init();
                        _getResults(query);
                    };

                    _searchResults = {};

                    _unifiedResults = {};

                    _serviceDict = {};

                    var _init = function () {
                        _resetResults();
                    };

                    var _getQuery = function () {
                        return scope.searchBarModel + '';
                    };

                    var _populateServiceDict = function (query) {
                        _serviceDict['ssr'] = {
                            url: mainAppService.generateSearchStedsnavnUrl(query),
                            format: 'xml',
                            source: 'ssr',
                            epsg: 'EPSG:32633',
                            nameID: 'stedsnavn',
                            latID: 'nord',
                            lonID: 'aust',
                            kommuneID: 'kommunenavn'
                        };
                        _serviceDict['matrikkelveg'] = {
                            url: mainAppService.generateSearchMatrikkelVegUrl(query),
                            format: 'json',
                            source: 'matrikkelveg',
                            epsg: 'EPSG:32632',
                            nameID: 'NAVN',
                            latID: 'LATITUDE',
                            lonID: 'LONGITUDE',
                            kommuneID: 'KOMMUNENAVN'
                        };
                        _serviceDict['matrikkeladresse'] = {
                            url: mainAppService.generateSearchMatrikkelAdresseUrl(query),
                            format: 'json',
                            source: 'matrikkeladresse',
                            epsg: 'EPSG:32632',
                            nameID: 'NAVN',
                            latID: 'LATITUDE',
                            lonID: 'LONGITUDE',
                            kommuneID: 'KOMMUNENAVN'
                        };
                        /*
                         serviceDict['adresse'] = {
                         url: mainAppService.generateSearchAdresseUrl(query),
                         format: 'json',
                         source: 'adresse',
                         epsg: 'EPSG:4326',
                         nameID: 'adressenavn',
                         latID: 'nord',
                         lonID: 'aust'
                         };*/
                    };

                    var _getResults = function (query) {
                        _populateServiceDict(query);
                        scope.searchTimestamp = parseInt((new Date()).getTime(), 10);
                        for (var service in _serviceDict) {
                            _downloadFromUrl(_serviceDict[service], scope.searchTimestamp);
                        }
                    };

                    var _resetResults = function () {
                        _unifiedResults = {};
                        _searchResults = {};
                    };

                    var _readResults = function () {
                        var jsonObject;
                        for (var service in _searchResults) {
                            var searchResult = _searchResults[service];
                            jsonObject = _convertSearchResult2Json(searchResult.document, searchResult.source);
                            _iterateJsonObject(jsonObject, searchResult);
                        }
                        console.log(Object.keys(_unifiedResults).length);
                        console.log(_unifiedResults);
                    };

                    var _convertSearchResult2Json = function (document, source) {
                        switch (source) {
                            case('ssr'):
                                return xml.xmlToJSON(document).sokRes.stedsnavn ;
                            case('adresse'):
                                return document.adresser;
                            default:
                                return JSON.parse(document);
                        }
                    };

                    var _iterateJsonObject = function (jsonObject, searchResult) {
                        if (jsonObject) {
                            if (!jsonObject.length) {
                                jsonObject = [jsonObject];
                            }
                                for (var i = 0; i < jsonObject.length; i++) {
                                    if (jsonObject[i][_serviceDict[searchResult.source].latID]) {
                                        _getValuesFromJson(_serviceDict[searchResult.source], jsonObject[i]);
                                    }
                                }
                            }
                    };

                    var _getValuesFromJson = function (identifiersDict, jsonObject) {
                        var name = _removeNumberFromName(jsonObject[identifiersDict.nameID]);
                        var lat = jsonObject[identifiersDict.latID] + '';
                        var lon = jsonObject[identifiersDict.lonID] + '';
                        var kommune = jsonObject[identifiersDict.kommuneID];
                        var point = _constructPoint(lat, lon, identifiersDict.epsg);
                        _pushToUnifiedResults(name, kommune, point, identifiersDict.format, identifiersDict.source);
                    };

                    var _removeNumberFromName = function (name) {
                        var nameArray = name.split(' ');
                        var matches = nameArray[nameArray.length - 1].match(/\d+/g);
                        if (matches != null) {
                            return name.replace(nameArray[nameArray.length - 1], '').trim();
                        }
                        else {
                            return name.trim();
                        }
                    };

                    var _pushToUnifiedResults = function (name, kommune, point, format, source) {
                        name = _capitalizeName(name.toLowerCase());
                        kommune = _capitalizeName(kommune.toLowerCase());
                        var resultID = name + kommune;
                        _unifiedResults[resultID] = {
                            name: name,
                            point: point,
                            format: format,
                            source: source,
                            kommune: kommune
                        };
                    };

                    var _constructPoint = function (lat, lon, epsg) {
                        return ol.proj.transform([lon, lat], epsg, 'EPSG:32633');
                    };

                    var _capitalizeName = function (name) {
                        name = name.trim();
                        name = _capitalizeNamePart(name, ' ');
                        name = _capitalizeNamePart(name, '-');
                        return name;
                    };

                    var _capitalizeNamePart = function (name, separator) {
                        var nameArray = name.split(separator);
                        var newName = '';
                        for (var i = 0; i < nameArray.length; i++) {
                            newName += _capitalizeFirstLetter(nameArray[i]) + separator;
                        }
                        newName = _rtrim(newName, 1);
                        return newName;
                    };

                    var _capitalizeFirstLetter = function (string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    };

                    var _rtrim = function (str, length) {
                        return str.substr(0, str.length - length);
                    };

                    var _downloadFromUrl = function (_serviceDict, timestamp) {
                        $.ajax({
                            type: "GET",
                            url: _serviceDict.url,
                            async: true,
                            success: function (document) {
                                if (scope.searchTimestamp != timestamp) {
                                    return;
                                }
                                _searchResults[_serviceDict.source] = {
                                    document: document,
                                    format: _serviceDict.format,
                                    source: _serviceDict.source,
                                    epsg: _serviceDict.epsg
                                };
                                _readResults();
                                _addResultsToMap();
                            },
                            error: function (searchError) {
                                console.log("Error downloading from " + _serviceDict.url, searchError);
                            }
                        });
                    };

                    var _addResultsToMap = function () {
                        var coordinates = [];
                        for (var result in _unifiedResults) {
                            coordinates.push(_unifiedResults[result].point);
                        }
                        if (coordinates.length > 0) {
                            map.RemoveInfoMarkers();
                            map.ShowInfoMarkers(coordinates);
                            $timeout(function () {
                                scope.searchResults = _unifiedResults;
                            }, 0);
                        }
                    };

                    scope.mouseOver = function (searchResult){
                        console.log('moused over: ' + searchResult.name + ' ' + searchResult.point);
                    };

                    scope.mouseDown = function (searchResult){
                        console.log('moused clicked: ' + searchResult.name + ' ' + searchResult.point);
                    };
                }
            };
        }]);