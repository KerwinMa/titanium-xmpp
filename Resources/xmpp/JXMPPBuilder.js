function  JXMPPBuilder()  {};

  /**
   * @private
   */
JXMPPBuilder.prototype.buildNode =function(doc, elementName) {

    var element, ns = arguments[4];
	

    // attributes (or text)
    if(arguments[2])
      if(this._isStringOrNumber(arguments[2]) ||
         (arguments[2] instanceof Array)) {
        element = this._createElement(doc, elementName, ns);
        this._children(doc, element, arguments[2]);
      } else {
        ns = arguments[2]['xmlns'] || ns;
        element = this._createElement(doc, elementName, ns);
        for(var attr in arguments[2]) {
          if (arguments[2].hasOwnProperty(attr) && attr != 'xmlns')
            element.setAttribute(attr, arguments[2][attr]);
        }
      }
    else
      element = this._createElement(doc, elementName, ns);
    // text, or array of children
    if(arguments[3])
      this._children(doc, element, arguments[3], ns);

    return element;
  };

  JXMPPBuilder.prototype._createElement= function(doc, elementName, ns) {
    //try {
    //  if (ns)
    //    return doc.createElementNS(ns, elementName);
    //} catch (ex) { }

    var el = doc.createElement(elementName);

    if (ns)
      el.setAttribute("xmlns", ns);

    return el;
  };

  /**
   * @private
   */
  JXMPPBuilder.prototype._text= function(doc, text) {
    return doc.createTextNode(text);
  };

  /**
   * @private
   */
  JXMPPBuilder.prototype._children= function(doc, element, children, ns) {
    if(typeof children=='object') { // array can hold nodes and text
      for (var i in children) {
        if (children.hasOwnProperty(i)) {
          var e = children[i];
          if (typeof e=='object') {
            //if (e instanceof Array) {
              var node = this.buildNode(doc, e[0], e[1], e[2], ns);
              element.appendChild(node);
            //} else {
            //  element.appendChild(e);
            //}
          } else {
            if(this._isStringOrNumber(e)) {
              element.appendChild(this._text(doc, e));
            }
          }
        }
      }
    } else {
      if(this._isStringOrNumber(children)) {
        element.appendChild(this._text(doc, children));
      }
    }
  };

  JXMPPBuilder.prototype._attributes= function(attributes) {
    var attrs = [];
    for(var attribute in attributes)
      if (attributes.hasOwnProperty(attribute))
        attrs.push(attribute +
          '="' + attributes[attribute].toString().htmlEnc() + '"');
    return attrs.join(" ");
  };

  JXMPPBuilder.prototype._isStringOrNumber= function(param) {
    return(typeof param=='string' || typeof param=='number');
  }

module.exports = JXMPPBuilder;
