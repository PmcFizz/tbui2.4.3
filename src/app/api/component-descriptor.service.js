/*
 * Copyright © 2016-2019 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export default angular.module('thingsboard.api.componentDescriptor', [])
    .factory('componentDescriptorService', ComponentDescriptorService).name;

/*@ngInject*/
function ComponentDescriptorService($http, $q) {

    var componentsByType = {};
    var componentsByClazz = {};
    var actionsByPlugin = {};

    var service = {
        getComponentDescriptorsByType: getComponentDescriptorsByType,
        getComponentDescriptorByClazz: getComponentDescriptorByClazz,
        getPluginActionsByPluginClazz: getPluginActionsByPluginClazz,
        getComponentDescriptorsByTypes: getComponentDescriptorsByTypes
    }

    return service;

    function getComponentDescriptorsByType(componentType) {
        var deferred = $q.defer();
        if (componentsByType[componentType]) {
            deferred.resolve(componentsByType[componentType]);
        } else {
            var url = '/api/components/' + componentType;
            $http.get(url, null).then(function success(response) {
                componentsByType[componentType] = response.data
                for (var i = 0; i < componentsByType[componentType].length; i++) {
                    var component = componentsByType[componentType][i];
                    componentsByClazz[component.clazz] = component;
                }
                deferred.resolve(componentsByType[componentType]);
            }, function fail() {
                deferred.reject();
            });

        }
        return deferred.promise;
    }

    function getComponentDescriptorsByTypes(componentTypes) {
        var deferred = $q.defer();
        var result = [];
        for (var i=componentTypes.length-1;i>=0;i--) {
            var componentType = componentTypes[i];
            if (componentsByType[componentType]) {
                result = result.concat(componentsByType[componentType]);
                componentTypes.splice(i, 1);
            }
        }
        if (!componentTypes.length) {
            deferred.resolve(result);
        } else {
            var url = '/api/components?componentTypes=' + componentTypes.join(',');
            $http.get(url, null).then(function success(response) {
                var notNode = ['aws sns', 'aws sqs', 'gcp pubsub', 'send email', 'gps geofencing filter', 'gps geofencing events']
                var components = response.data.filter(x => {
                    return !notNode.includes(x.name)
                });

                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    var componentsList = componentsByType[component.type];
                    if (!componentsList) {
                        componentsList = [];
                        componentsByType[component.type] = componentsList;
                    }
                    componentsList.push(component);
                    componentsByClazz[component.clazz] = component;
                }
                result = result.concat(components);
                deferred.resolve(components);
            }, function fail() {
                deferred.reject();
            });
        }
        return deferred.promise;
    }

    function getComponentDescriptorByClazz(componentDescriptorClazz) {
        var deferred = $q.defer();
        if (componentsByClazz[componentDescriptorClazz]) {
            deferred.resolve(componentsByClazz[componentDescriptorClazz]);
        } else {
            var url = '/api/component/' + componentDescriptorClazz;
            $http.get(url, null).then(function success(response) {
                componentsByClazz[componentDescriptorClazz] = response.data;
                deferred.resolve(componentsByClazz[componentDescriptorClazz]);
            }, function fail() {
                deferred.reject();
            });
        }
        return deferred.promise;
    }

    function getPluginActionsByPluginClazz(pluginClazz) {
        var deferred = $q.defer();
        if (actionsByPlugin[pluginClazz]) {
            deferred.resolve(actionsByPlugin[pluginClazz]);
        } else {
            var url = '/api/components/actions/' + pluginClazz;
            $http.get(url, null).then(function success(response) {
                actionsByPlugin[pluginClazz] = response.data;
                deferred.resolve(actionsByPlugin[pluginClazz]);
            }, function fail() {
                deferred.reject();
            });
        }
        return deferred.promise;
    }

}
