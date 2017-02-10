/** @babel */

const assert = require('assert')
const etch = require('etch')
const ListView = require('../src/list-view')

describe('ListView', () => {
  let containerNode = null

  beforeEach(() => {
    etch.setScheduler({
      updateDocument(callback) { callback(); },
      getNextUpdatePromise() { return Promise.resolve(); }
    });

    containerNode = document.createElement('div');
    containerNode.style.width = '300px';
    containerNode.style.height = '100px';
    document.body.insertBefore(containerNode, document.body.firstChild);
  })

  afterEach(() => {
    containerNode.remove()
  })

  class ItemComponent {
    constructor(props) {
      this.props = props;
      etch.initialize(this);
    }

    render() {
      return etch.dom(
        'li',
        {
          className: 'test-item',
          dataset: {name: this.props.name}
        },
        this.props.name
      );
    }

    update(props) {
      this.props = props;
      etch.update(this);
    }
  }

  it('renders only as many items as are needed to fill the visible area', async () => {
    const items = [];
    for (let i = 0; i < 100; i++) {
      items.push({name: `Thing ${i}`});
    }

    const listView = new ListView({
      items,
      itemComponent: ItemComponent,
      heightForItem: (item, i) => 20
    });

    containerNode.appendChild(listView.element)
    listView.update();
    assert.deepEqual(getItemElements(listView).map(e => e.offsetParent.offsetTop), [
      0, 20, 40, 60, 80,
    ]);

    listView.element.scrollTop += 10;
    await nextFrame();
    assert.deepEqual(getItemElements(listView).map(e => e.offsetParent.offsetTop), [
      0, 20, 40, 60, 80, 100,
    ]);

    listView.element.scrollTop += 10;
    await nextFrame();
    assert.deepEqual(getItemElements(listView).map(e => e.offsetParent.offsetTop), [
      20, 40, 60, 80, 100,
    ]);

    listView.element.scrollTop += 10;
    await nextFrame();
    assert.deepEqual(getItemElements(listView).map(e => e.offsetParent.offsetTop), [
      20, 40, 60, 80, 100, 120,
    ]);

    listView.element.scrollTop += 10;
    await nextFrame();
    assert.deepEqual(getItemElements(listView).map(e => e.offsetParent.offsetTop), [
      40, 60, 80, 100, 120,
    ]);
  });
});

function getItemElements(listView) {
  return Array.from(listView.refs.list.querySelectorAll('.test-item'));
}

function nextFrame() {
  return new Promise(r => requestAnimationFrame(r));
}
