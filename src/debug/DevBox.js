const _ = require('lodash');
require('./devbox.css');

class DevBox {
    constructor (args) {
        args = _.defaults(args, {
            parent: null,
            id: 'devbox',
            className: 'devbox',
            contentClassName: 'devbox-content',
            autoUpdate: true,
        });
        args.styles = _.defaults(args.styles, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '35%',
            height: '85%',
        });

        this.cssEl = this.mountCSS();

        let els = this.buildEl(args);
        this.el = els.root;
        this.contentEl = els.content;

        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this.mount(args.parent || document.body);
        } else {
            window.addEventListener('load', () => {
                this.mount(args.parent || document.body);
            });
        }

        this.styles = args.styles;
        this.stylesDirty = false;

        this.autoUpdate = args.autoUpdate;
        this.update = this.update.bind(this);
        if (this.autoUpdate) {
            this.update();
        }
    }

    update () {
        if (this.stylesDirty) {
            _.extend(this.el.style, this.styles);
        }

        if (this.autoUpdate) {
            requestAnimationFrame(this.update);
        }
    }

    mountCSS () {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', 'devbox.css');
        document.head.appendChild(link);
        return link;
    }

    buildEl (args) {
        let el = document.createElement('div');
        el.id = args.id;
        el.className = args.className;
        _.extend(el.style, args.styles);
        let content = document.createElement('div');
        content.className = args.contentClassName;
        el.appendChild(content);

        return {
            root: el,
            content: content
        };
    }

    mount (parent = document.body) {
        parent.appendChild(this.el);
    }

    addSection (args) {
        args = _.defaults(args, {
            class: 'section',
            title: '',
            titleClass: 'section-title',
            contentClass: 'section-content',
            onElBuilt: null,
            onMounted: null
        });
        let title = document.createElement('div');
        title.innerHTML = args.title;
        title.className = args.titleClass;

        let content = document.createElement('div');
        content.className = args.contentClass;

        let section = document.createElement('div');
        section.className = args.class;

        section.appendChild(title);
        section.appendChild(content);

        let sectionEls = {
            root: section,
            title: title,
            content: content
        };
        if (args.onElBuilt) {
            args.onElBuilt(sectionEls);
        }

        this.contentEl.appendChild(section);
        if (args.onMounted) {
            args.onMounted(sectionEls);
        }
    }

    get left () {
        return this.styles.left;
    }
    set left (left) {
        this.styles.left = left;
        this.stylesDirty = true;
    }

    get right () {
        return this.styles.right;
    }
    set right (right) {
        this.styles.right = right;
        this.stylesDirty = true;
    }

    get top () {
        return this.styles.top;
    }
    set top (top) {
        this.styles.top = top;
        this.stylesDirty = true;
    }

    get bottom () {
        return this.styles.bottom;
    }
    set bottom (bottom) {
        this.styles.bottom = bottom;
        this.stylesDirty = true;
    }

    get width () {
        return this.styles.width;
    }
    set width (width) {
        this.styles.width = width;
        this.stylesDirty = true;
    }

    get height () {
        return this.styles.height;
    }
    set height (height) {
        this.styles.height = height;
        this.stylesDirty = true;
    }
}

module.exports = DevBox;