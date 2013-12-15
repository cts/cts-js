/* JSON Node
 * @author Ted Benson <eob@csail.mit.edu>
 */
CTS.Node.Json = function(node, tree, opts) {
  this.opts = CTS.Fn.buildOptions(CTS.Node.Json.defaultOptions, opts);
  this.initializeNodeBase(tree, opts); // Required by base class.
  this.kind = "JSON";
  this.value = null;
  this.dataType = null;
  this.value = node;
  if (opts.property) {
    his.dataType = 'property'
  } else {
    this.updateDataType();
  }
};

CTS.Node.Json.defaultOptions = {
};
 
CTS.Fn.extend(CTS.Node.Json.prototype, CTS.Events, CTS.Node.Base, {

  updateDataType: function() {
    if (CTS.Fn.isNull(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isUndefined(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isArray(this.value)) {
      this.dataType = 'array';
    } else if (CTS.Fn.isObject(this.value)) {
      this.dataType = 'object';
    } else {
      this.dataType = typeof this.value;
    }
  },

  toJSON: function() {
    if (this.dataType == 'set') {
      return CTS.Fn.map(this.children, function(kid) {
        return kid.toJSON();
      });
    } else if (this.dataType == 'object') {
      var ret = {};
      CTS.Fn.each(this.children, function(kid) {
        ret[kid.value] = kid.toJSON();
      }, this);
      return ret;
    } else if (this.dataType == 'property') {
      if (this.children.length == 0) {
        return null;
      } else if (this.children.length > 1) {
        CTS.Debugging.Error("More than one child of property", [this]);
        return null;
      } else {
        return this.children[0].toJSON();
      }
    } else {
      return value;
    }
  },

  debugName: function() {
    return "<JsonNode " + this.dataType + " :: " + this.value + ">"
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

  /*
   * Precondition: this.children.length == 0
   *
   * Realizes all children.
   */
  _subclass_realizeChildren: function() {
    var deferred = Q.defer();
    var self = this;
    var orFail = function() { deferred.reject; }
    var andFinish = function() {
      for (var i = 0; i < self.children.length; i++) {
        self.children[i].parentNode = self;
      }
      deferred.resolve;
    }

    if (this.dataType == 'property') {
      // Create a new node with the property value
      var childValue = this.value[opts.property];
      CTS.Node.Factory.Json(childValue, self.tree, self.opts)
        .then(function(node) {
          self.children = [node];
          andFinish();
      }, orFail);
    } else if (this.dataType == 'object') {
      var promises = [];
      for (prop in this.value) {
        if (this.value.hasOwnProperty(prop)) {
          promises.push(CTS.Node.Factory.Json(this.value[prop], self.tree, self.opts));
        }
      }
      Q.all(promises).then(function(results) {
        self.children = results;
        andFinish();
      }, orFail);
    } else if (this.dataType == 'array') {
      var promises = CTS.Fn.map(this.value), function(child) {
        var promise = CTS.Node.Factory.Json(child, self.tree, self.opts);
        return promise;
      });
      Q.all(promises).then(function(results) {
        self.children = results;
        andFinish();
      }, orFail);
    } else {
      this.children = null;
    }
    return deferred.promise;
  },

  /* 
   * Inserts this DOM node after the child at the specified index.
   */
  _subclass_insertChild: function(child, afterIndex) {
    var leftSibling = this.getChildren()[afterIndex];
  },

  /* 
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.jQueryNode.remove();
  },

  _subclass_getInlineRelationSpecs: function() {
    return null;
  },

  _subclass_beginClone: function() {
    var c = this.originalJson;
    var d = new JsonNode(c, this.tree, this.opts);
    d.realizeChildren();
    return d;
  },

 /************************************************************************
  **
  ** Required by Relation classes
  **
  ************************************************************************/

  getValue: function(opts) {
    if (this.dataType == 'set') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'object') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'property') {
      return this.children[0].value;
    } else {
      return value;
    }
  },

  setValue: function(value, opts) {
    if (this.dataType == 'property') {
      CTS.Log.Warn("Should not be setting the value of a property.");
    }
    this.value = value;
  }
  
  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

});

