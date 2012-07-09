angular.module('app.atom2json', []).factory("$atom2json", function() {
   return function atom2json(xml) {
      if (typeof xml === "string") {
         xml = new DOMParser().parseFromString(xml, "text/xml");
      } 

      var obj = Object.create({
         attr: function(attrName) {
           return this._attributes && this._attributes[attrName]; 
         },
         module: function(mName) {
            var self = this;
            return Object.keys(this).sort().reduce(function(acc, key) {
               if ( key.indexOf(mName+":") === 0 ) {
                  acc[key.substr(key.indexOf(":")+1)] = self[key];
               }
               return acc;
            }, {});
         }
      });

      if (xml.nodeType === 1) {
         // do attributes
         if (xml.attributes.length > 0) {
            obj._attributes = {};
            for (var j = 0; j < xml.attributes.length; j++) {
               var attribute = xml.attributes.item(j);
               obj._attributes[attribute.nodeName] = attribute.nodeValue;
            }
         }
      }

      // do children
      if (xml.hasChildNodes()) {
         for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i), nodeName = item.nodeName;

            if (item.nodeType !== 3) {
               if (item.childNodes.length === 1 && item.childNodes.item(0).nodeType === 3) {
                  obj[nodeName] = item.childNodes.item(0).nodeValue;
               } else if (typeof obj[nodeName] === "undefined") {
                  obj[nodeName] = atom2json(item);
               } else {
                  var items = [];
                  obj[nodeName] = [].concat(obj[nodeName], atom2json(item));
               }
            }
         }
      }

      //
      // post processing
      //
      if (typeof obj.entry !== "undefined") {
         obj.entry = [].concat(obj.entry);
      }

      // pre-initialize known modules
      obj._modules = ['opensearch', 'vidal'].reduce(function (modules, mName) {
         modules[mName] = obj.module(mName);
         return modules;
      }, {});

      // pre-group links by rel type
      obj._links = ['next', 'prev', 'alternate', 'self', 'related', 'inline'].reduce(function(links, type) {
         var linkType = obj.link && [].concat(obj.link).filter(function(ln) {
            return ln.attr('rel') === type;
         });

         if (typeof linkType !== "undefined") { links[type] = linkType; }
         return links;
      }, {});

      return obj;
   };
});
