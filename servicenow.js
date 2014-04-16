'use strict';

var request = require('request');
var querystring = require('querystring');

/**
 * @typedef ClientConfig
 * @type {object}
 * @property {string} instance - base URL to instance i.e. "https://demo.servicenow.com"
 * @property {string} username - login of the user to act on behalf of
 * @property {string} password
 */

/**
 * Builds a connection to a specific instance
 * @class
 *
 * @example
 * var servicenow = require('servicenow');
 * var config = {
 *     instance: "https://demo.servicenow.com",
 *     username: "admin",
 *     password: "admin"
 * };
 * var client = new servicenow.Client(config);
 *
 * @constructor
 * @param {ClientConfig} config - config object
 *
 */
function Client(config) {
    this.instance = config.instance;
    
    this.config = config;

    this.request = request.defaults({
        auth: {
            user: config.username,
            pass: config.password,
            sendImmediately: true
        },
        headers: {
            "Content-Type": "application/json"
        }
    });
}

/**
 * This is the signature for all methods in this module that take a callback function as their final parameter.
 * @callback requestCallback
 * @param {string|object} error - Any error generated, null if no errors
 * @param {object} result - parsed object as returned from REST service
 */

/**
 * Gets the sys_id for all records matching the `query`.
 *  
 * @param {string} table - the table to query
 * @param {string} query - [encoded query string]{@link http://wiki.servicenow.com/index.php?title=Embedded:Encoded_Query_Strings}
 * @param {requestCallback} callback - response handler
 *
 * @example
 * client.getKeys("incident","Active=true",function(error,result) {
 *   if(!error) {
 *     // result contains an array of sys_ids
 *   }
 * });
 *
 */
Client.prototype.getKeys = function(table,query,callback) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";
    
    var params = querystring.stringify({
        "sysparm_action": "getKeys",
        "sysparm_query" : query
    });
    
    this.request.get(url + params, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Retrieves the object matching `sysid` from `table`
 *
 * @param {string} table - the table to query
 * @param {string} sysid - sys_id of the object to load
 * @param {requestCallback} callback - response handler
 * @param {boolean} [displayValue=false] - true if references should be decoded, false returns sys_id.  See {@link http://wiki.servicenow.com/index.php?title=JSONv2_Web_Service#Return_Display_Value_for_Reference_Variables Reference Variables}
 * @param {boolean} [displayVariables=false] - true if variables array should be returned with the response, see {@link http://wiki.servicenow.com/index.php?title=JSONv2_Web_Service#Return_Display_Variables Display Variables}
 *
 * @example
 * client.getKeys("incident","Active=true",function(error,result) {
 *   if(!error) {
 *     // result contains the object
 *   }
 * });
 *
 */
Client.prototype.get = function(table,sysid,callback,displayValue,displayVariables) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";
    
    var params = querystring.stringify({
        "sysparm_action": "get",
        "sysparm_sys_id" : sysid,
        "displayvalue" : (displayValue ? true : false),
        "displayvariables" : (displayVariables ? true : false)
    });
    
    this.request.get(url + params, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Gets all records matching the `query`.
 * 
 * @param {string} table - the table to query
 * @param {string} query - [encoded query string](http://wiki.servicenow.com/index.php?title=Embedded:Encoded_Query_Strings)
 * @param {requestCallback} callback - response handler
 * @param {boolean} [displayValue=false] - true if references should be decoded, false returns sys_id.  See {@link http://wiki.servicenow.com/index.php?title=JSONv2_Web_Service#Return_Display_Value_for_Reference_Variables Reference Variables}
 * @param {boolean} [displayVariables=false] - true if variables array should be returned with the response, see {@link http://wiki.servicenow.com/index.php?title=JSONv2_Web_Service#Return_Display_Variables Display Variables}
 * 
 * @example
 * client.getRecords("incident","Active=true",function(error,result) {
 *   if(!error) {
 *     // result contains an array of objects matching query
 *   }
 * });
 */
Client.prototype.getRecords = function(table,query,callback,displayValue,displayVariables) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";

    var params = querystring.stringify({
        "sysparm_action": "getRecords",
        "sysparm_query": query,
        "displayvalue": (displayValue ? true : false),
        "displayvariables" : (displayVariables ? true : false)
    });

    this.request.get(url + params, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Updates records(s) in `table` matching `query` with fields in `object`.
 * 
 * @param {string} table - the table to update
 * @param {string} query - [encoded query string](http://wiki.servicenow.com/index.php?title=Embedded:Encoded_Query_Strings) matching the record(s) to update
 * @param {object} object - object containing fields to update
 * @param {requestCallback} callback - response handler
 * 
 * @example
 * var o = {
 *   "state": "1"
 * }
 * client.update("incident","number=INC0000001",o,function(error,result) {
 *   if(!error) {
 *     // result contains array of full updated objects
 *   }
 * });
 */
Client.prototype.update = function(table,query,object,callback) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";

    var params = querystring.stringify({
        "sysparm_action": "update",
        "sysparm_query" : query
    });

    var opts = {
        body: JSON.stringify(object)
    };
    
    this.request.post(url + params, opts, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Inserts `object` into `table`.  Multiple records can be inserted if `object` contains an array of objects named `records`.
 * 
 * @param {string} table - the table to insert into
 * @param {object|array} object - object(s) to insert
 * @param {requestCallback} callback - response handler
 * 
 * @example
 * var o = {
 *   "short_description": "Test Incident",
 *   "description": "This is a test incident"
 * }
 * client.insert("incident",o,function(error,result) {
 *   if(!error) {
 *     // result contains array of inserted objets
 *   }
 * });
 */
Client.prototype.insert = function(table,object,callback) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";

    var params = querystring.stringify({
        "sysparm_action": "insert"
    });

    var opts = {
        body: JSON.stringify(object)
    };
    
    this.request.post(url + params, opts, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Deletes `object` from `table`.  `object` may be either an Object containing a `sys_id` field or the `sys_id` itself.
 * 
 * @param {string} table - the table to delete from
 * @param {string|object} object - object or sys_id to delete
 * @param {requestCallback} callback - response handler
 * 
 * @example
 * var o = {
 *   "sys_id: "9d385017c611228701d22104cc95c371"
 * }
 * client.delete("incident",o,function(error,result) {
 *   if(!error) {
 *     // result contains the object deleted
 *   }
 * });
 */
Client.prototype.deleteRecord = function(table,object,callback) {
    var sysid = object;
    if(typeof object === 'object') {
        sysid = object.sys_id;
    }
    var url = this.instance + "/" + table + ".do?JSONv2=&";

    var params = querystring.stringify({
        "sysparm_action": "deleteRecord"
    });

    var opts = {
        body: JSON.stringify({
            "sysparm_sys_id": sysid
        })
    };
    
    this.request.post(url + params, opts, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Gets all records matching the `query`.
 * 
 * @param {string} table - the table to delete from
 * @param {string} query - [encoded query string](http://wiki.servicenow.com/index.php?title=Embedded:Encoded_Query_Strings) selecting the records for deletion
 * @param {requestCallback} callback - response handler
 * 
 * @example
 * client.deleteMultiple("incident","short_description=deleteme",function(error,result) {
 *   if(!error) {
 *     // result contains an array of objects matching query
 *   }
 * });
 */
Client.prototype.deleteMultiple = function(table,query,callback) {
    var url = this.instance + "/" + table + ".do?JSONv2=&";

    var params = querystring.stringify({
        "sysparm_action": "deleteMultiple",
        "sysparm_query" : query
    });

    this.request.get(url + params, function(err,response,body) {
        restCallbackHandler(err,response,body,callback);
    });
};

/**
 * Standard handler for handling ServiceNow REST responses 
 * @private
 */
function restCallbackHandler(err,response,body,callback) {
    var error = jsonServiceErrorProcessor(err,response,body);
    if(error) {
        callback(error);
        return;
    }
    var o = JSON.parse(body);
    
    callback(null,o);
}

/**
 * Takes arguments from request callback and if any error result is found, returns the error
 * Any per-record errors are returned as an array of __error objects with message and reason
 * @private
 */
function jsonServiceErrorProcessor(error,response,body) {
    if(error) return error;
    if(response.statusCode!=200) return body;

    var o = JSON.parse(body);
    if(o.error) return o.error;
    if(o.records) {
        var errors = [];
        for(var i in o.records) {
            if(i.__error) errors.push(i.__error);
        }
        if(errors.length>0) {
            return errors;
        }
    }
    return null;
}

module.exports.Client = Client;
