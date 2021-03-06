/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
CTS.Node.GCellFeed = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GCellFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GCellFeed.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return this.kind;
  },

  getWorksheetKey: function() {
    return this.spec.wskey;
  },

  getSpreadsheetKey: function() {
    return this.spec.sskey;
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }

    selector = selector.trim();
    CTS.Log.Debug("console ", selector);
    var letterIdx = 0;
    while (isNaN(parseInt(selector[letterIdx]))) {
      letterIdx++;
    }
    CTS.Log.Debug("Letter Index", letterIdx);
    var col = selector.slice(0, letterIdx);
    var row = parseInt(selector.slice(letterIdx));

    CTS.Log.Debug("Row", row, "Col", col);

    for (var i = 0; i < this.children.length; i++) {
      CTS.Log.Debug("Kid type", this.children[i].kind)
      if (this.children[i].kind == "GColumn") {
        CTS.Log.Debug("has value", this.children[i].value)
        if (this.children[i].value == col) {
          CTS.Log.Debug("Asking kid to find", row);
          this.children[i].find(row, ret);
        }
      }
    }

    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        return true;
      } else {
        return this.parentNode.isDescendantOf(other);
      }
    }
    return false;
  },

  updateComputedNodes: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].updateComputedNodes();
    }
  },

  _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.Util.GSheet.getCellFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         CTS.Log.Debug("Got cell feed worksheet", gdata);
         self.gdata = gdata;

         for (var rowName in gdata.rows) {
           var columns = gdata.rows[rowName];
           var child = new CTS.Node.GColumn(rowName, columns, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         CTS.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         CTS.Log.Warn("CellFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var d = Q.defer();
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new CTS.Node.GListFeedItem(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     d.resolve(clone);
     return d.promise;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null; // no value.
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});
