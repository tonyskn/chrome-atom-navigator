angular.module('app.atom2json', []).factory("$atom2json", function() {
   return function atom2json(xml) {
      if (typeof xml === "string") {
         xml = new DOMParser().parseFromString(xml, "text/xml");
      } 

      var obj = Object.create({
         attr: function(attrName) {
           return this._attributes && this._attributes[attrName]; 
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

      if (typeof obj.entry !== "undefined") {
         obj.entry = [].concat(obj.entry);
      }

      // pre-initialize modules
      obj._modules = Object.keys(obj).reduce(function(modules, key) {
         if (key.indexOf(":") > 0) {
            var mName = key.replace( /:.*$/, '' );
            var mKey = key.replace( /^.*:/, '' );

            modules[mName] = modules[mName] || {};
            modules[mName][mKey] = obj[key];

            delete obj[key];
         }   

         return modules;
      }, {});

      // pre-group links by rel type
      if (typeof obj.link !== "undefined") {
         obj._links = obj.link && [].concat(obj.link).reduce(function(links, ln) {
            var type = ln.attr('rel');   
   
            links[type] = links[type] || [];
            links[type].push( ln );
   
            return links;
         }, {});

         delete obj.link;
      }

      return obj;
   };
});
