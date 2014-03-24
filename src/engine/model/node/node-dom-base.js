CTS.Node.DomBase = {
  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  stash: function() {
    this.value.attr('data-ctsid', this.ctsId);
    this.tree.nodeStash[this.ctsId] = this;
  },

  _subclass_shouldRunCtsOnInsertion: function() {
    if (! this.value) return false;
    if (this.value.hasClass('cts-ignore')) return false;
  },

  _subclass_getTreesheetLinks: function() {
    return CTS.Util.getTreesheetLinks(this.value);
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      if (typeof ret == 'undefined') {
        CTS.Log.Error("push");
      }
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == null) {
        CTS.Log.Error("Error: Child " + i + " of me is null (find:" + selector + ")", this);
      } else {
        if (typeof this.children[i] == 'undefined') {
          CTS.Log.Error("Undefined child");
        }
        this.children[i].find(selector, ret);
      }
    }
    return ret;
  },

  _subclass_beginClone_base: function($node, klass) {
    var $value = null;
    if (typeof $node == "undefined") {
      $value = this.value.clone();
    } else {
      $value = $node;
    }

    // Remove any inline CTS annotations, since we're going to
    // manually copy in relations.
    $value.attr('data-cts', null);
    $value.find("*").attr('data-cts', null);

    // NOTE: beginClone is allowed to directly create a Node
    // without going through the factory because we already can be
    // sure that all this node's trees have been realized
    var clone = new klass($value, this.tree, this.opts);

    var cloneKids = clone.value.children();
    if (this.children.length != cloneKids.length) {
      CTS.Log.Error("Trying to clone CTS node that is out of sync with dom");
    }
    // We use THIS to set i
    for (var i = 0; i < cloneKids.length; i++) {
      var $child = CTS.$(cloneKids[i]);
      var child = this.children[i]._subclass_beginClone($child);
      child.parentNode = clone;
      if (typeof child.children  == 'undefined') {
        CTS.Log.Error("Kids undefined");
      }
      clone.children.push(child);
    }

    if (clone.relations.length > 0) {
      CTS.Log.Error("After subclass clone, relations shouldn't be > 0");
    }

    return clone;
  },


  /*
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.value.remove();
  },


  _subclass_getInlineRelationSpecString: function() {
    if (this.value !== null) {
      var inline = this.value.attr('data-cts');
      if (inline) {
        return inline;
      } else {
        // Temporary spreadsheet case.
        inline = this.value.attr('data-bind-to');
        if (inline) {
          if (inline.indexOf('rows') > -1) {
            if (this.value.is("form")) {
              return "this :graft " + inline + ' {createNew: true};';
            } else {
              return "this :are " + inline + ";";
            }
          } else {
            return "this :is " + inline + ';';
          }
        }
      }
    }
    return null;
  },

  _subclass_ensure_childless: function() {
    if (this.value !== null) {
      this.value.html("");
    }
  }
};
