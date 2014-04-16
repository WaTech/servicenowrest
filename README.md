# ServiceNow REST Client

ServiceNow REST Client is a collections of convience wrapper methods to the [JSON Web Service plugin](http://wiki.servicenow.com/index.php?title=JSON_Web_Service) calls.

## Quickstart

```javascript
var servicenow = require('servicenow');
var config = {
    instance: "https://demo.servicenow.com",
    username: "admin",
    password: "admin"
};
var client = new servicenow.Client(config);
client.getRecords("incident","Active=true",function(error,result) {
  if(!error) {
    // call succeded
  }
});
```
