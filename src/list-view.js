const etch = require('etch');
const resizeDetector = require('element-resize-detector')({strategy: 'scroll'});

module.exports = class ListView {
  constructor({items, heightForItem, itemComponent}) {
    this.items = items;
    this.heightForItem = heightForItem;
    this.itemComponent = itemComponent;
    etch.initialize(this);

    resizeDetector.listenTo(this.element, () => etch.update(this));
    this.element.addEventListener('scroll', () => etch.update(this));
  }

  update({items, heightForItem, itemComponent} = {}) {
    if (items) this.items = items;
    if (heightForItem) his.heightForItem = heightForItem;
    if (itemComponent) his.itemComponent = itemComponent;
    return etch.update(this)
  }

  render() {
    const children = [];
    let topPosition = 0;

    if (this.element) {
      const itemCount = this.items.length;
      const {scrollTop, offsetHeight} = this.element;

      let i = 0;

      for (; i < itemCount; i++) {
        let bottom = topPosition + this.heightForItem(this.items[i], i);
        if (bottom > scrollTop) break;
        topPosition = bottom;
      }

      for (; i < itemCount; i++) {
        const item = this.items[i];
        children.push(
          etch.dom(
            'div',
            {
              style: {
                position: 'absolute',
                height: this.itemHeight + 'px',
                top: topPosition + 'px',
              }
            },
            etch.dom(this.itemComponent, item)
          )
        );

        topPosition += this.heightForItem(this.items[i], i);
        if (topPosition >= scrollTop + offsetHeight) break;
      }

      for (; i < itemCount; i++) {
        topPosition += this.heightForItem(this.items[i], i);
      }
    }

    return etch.dom(
      'div',
      {
        style: {
          position: 'relative',
          height: '100%',
          overflow: 'auto',
        }
      },
      etch.dom(
        'ol',
        {
          ref: 'list',
          style: {height: topPosition + 'px'}
        },
        ...children
      )
    );
  }
};
