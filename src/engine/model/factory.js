CTS.Factory = {
  Forrest: function(opts) {
    var deferred = Q.defer();
    var forrest = new CTS.Forrest(opts);
    forrest.initializeAsync().then(
      function() {
        deferred.resolve(forrest);
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  Tree: function(spec, forrest) {
    if ((spec.url == null) && (spec.name = 'body')) {
      return CTS.Factory.TreeWithJquery(CTS.$('body'), forrest, spec);
    } if ((spec.kind == "GSheet" || spec.kind == 'gsheet')) {
      return CTS.Factory.GSpreadsheetTree(spec, forrest);
    } else if (typeof spec.url == "string") {
      var deferred = Q.defer();
      CTS.Util.fetchString(spec).then(
        function(content) {
          if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
            var div = CTS.$("<div></div>");
            var nodes = CTS.$.parseHTML(content);
            var jqNodes = Fn.map(nodes, function(n) {
              return CTS.$(n);
            });
            div.append(jqNodes);
            if (spec.fixLinks) {
              CTS.Util.rewriteRelativeLinks(div, spec.url);
            }
            CTS.Factory.TreeWithJquery(div, forrest, spec).then(
              function(tree) {
                deferred.resolve(tree);
              },
              function(reason) {
                deferred.reject(reason);
              }
            );
          } else {
            deferred.reject("Don't know how to make Tree of kind: " + spec.kind);
          }
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
      return deferred.promise;
    } else {
      return CTS.Factory.TreeWithJquery(spec.url, forrest, spec);
    }
  },

  TreeWithJquery: function(node, forrest, spec) {
    var deferred = Q.defer();
    var tree = new CTS.Tree.Html(forrest, spec);
    CTS.Node.Factory.Html(node, tree).then(
      function(ctsNode) {
        ctsNode.realizeChildren().then(
          function() {
            tree.setRoot(ctsNode);
            deferred.resolve(tree);
          },
          function(reason) {
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  GSpreadsheetTree: function(treespec, forrest) {
    var deferred = Q.defer();
    // For the GSheet.
    treespec.sskey = treespec.url;
    var tree = new CTS.Tree.GSpreadsheet(forrest, treespec);
    if (typeof treespec.worksheet != 'undefined') {
      treespec.wskey = treespec.worksheet;
      tree.root = new CTS.Node.GWorksheet(treespec, tree);
    } else {
      tree.root = new CTS.Node.GSpreadsheet(treespec, tree);
    }
    tree.root.realizeChildren().then(
      function() {
        console.log("Got it");
        deferred.resolve(tree);
      },
      function(reason) {
        CTS.Log.Error("Not authenticated with GDocs. Trying now.");
        // We'll try to log in if possible.
        CTS.Util.GSheet.login().then(
          function() {
            tree.root.realizeChildren().then(
              function() {
                deferred.resolve(tree);
              },
              function() {
                CTS.Log.Error("Couldn't login");
                deferred.reject("Couldn't login");
              }
            );
          },
          function() {
            CTS.Log.Error("Couldn't login");
            deferred.reject("Couldn't login");
          }
        );
      }
    );
    console.log("Promise for gsheet");
    return deferred.promise;
  }

}
