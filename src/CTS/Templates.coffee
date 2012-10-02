
#<< CTS/Commands/Template

# Loads all the templates referenced from a page.
# Currently requires Bullfrog to be running.
class Templates
  constructor: () ->
    @templates = {}
    @templateCommand = new CTS.Commands.Template()

  fetch: (name) ->
    return @templates[name]

  needsLoad: (rules) ->
    if rules != null and @templateCommand.signature() of rules
      tBlock = rules[@templateCommand.signature()]
      tName = tBlock["."]["."]  # Default target, default variant
      if tName in @templates
        return false
      else
        return true
    else
      return false

  load: (rules, callback) ->
    if rules != null and @templateCommand.signature() of rules
      tBlock = rules[@templateCommand.signature()]
      tName = tBlock["."]["."]  # Default target, default variant
      if tName in @templates
        @templates[tName]
      else
        if @.isLocal(tName)
          @.loadLocal(tName)
          callback() # Load Complete
        else
          @.loadRemote(tName, callback)

  isLocal: (tName) ->
    return tName[0] == "#"

  loadLocal: (tName) ->
    value = $(tName).html()
    @templates[tName] = value
    return value

  loadRemote: (tName, callback) =>
    save = { 'tname': tName, 'callback': callback }
    CTS.Util.fetchRemoteStringBullfrog(tName, @._loadRemoteResponse, save)

  _loadRemoteResponse: (text, status, xhr) ->
    callback  = xhr.callback
    tName = xhr.tname
    @templates[tName] = text
    callback()

