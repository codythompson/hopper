const _ = require('lodash');
require('./devbox.css');

class DevBox {
    constructor (args) {
        /*
         * fields
         */
        _.assign(this, {
            el: null,
            contentEl: null,
            styles: null,
            stylesDirty: null,
            autoUpdate: null,
            sections: null,
            watchItems: null
        });

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

        this.sections = {};
        this.watchItems = [];

        this.styles = args.styles;
        this.stylesDirty = false;

        this.autoUpdate = args.autoUpdate;
        this.update = this.update.bind(this);
        if (this.autoUpdate) {
            this.update();
        }

        this.setupSections();
    }

    setupSections () {
        this.addSection({
            title: 'watching',
            class: 'section watching',
            onElBuilt: (section) => {
                section.title.style.visibility = 'hidden';
            },
            itemBuilder: (item, section) => {
                section.title.style.visibility = '';
                let el = document.createElement('div');
                el.className = 'watch-item';
                let val;
                let title;
                try {
                    val = this.getValueFromScopePath(item.scopePath, item.scope || window);
                    title = val+'';
                } catch (e) {
                    val = `<span class="error">${e}</span>`;
                    title = e+'';
                }
                title = title.replace(new RegExp('"', 'g'), '\'');
                el.innerHTML = `<span title="${item.label}" class="watch-item-component label">${item.label}</span><span title="${title}" class="value watch-item-component">${val}</span>`;
                item.el = el;
                this.watchItems.push(item);
                return el;
            },
            onUpdate: () => {
                for (let item of this.watchItems) {
                    let val;
                    let title;
                    try {
                        val = this.getValueFromScopePath(item.scopePath, item.scope || window);
                        title = val+'';
                    } catch (e) {
                        val = `<span class="error">${e}</span>`;
                        title = e+'';
                    }
                    title = title.replace(new RegExp('"', 'g'), '\'');
                    if (val !== item.lastVal) {
                        let el = item.el.getElementsByClassName('value')[0];
                        el.title = title;
                        el.innerHTML = val;
                    }
                    item.lastVal = val;
                }
            }
        });
    }

    watch (scopePath, scope=window, label=null) {
        if (label === null) {
            label = scopePath
        }
        this.appendToSection('watching', {
            scopePath: scopePath,
            scope: scope,
            label: label
        });
    }

    getValueFromScopePath (scopePath, startScope = window) {
        if (typeof scopePath === 'function') {
            return scopePath.call(startScope);
        }

        // split the scopePath by period and trim every resulting item
        scopePath = scopePath.split('.').map(Function.prototype.call, String.prototype.trim);
        let scope = startScope;
        let lastKey = '<start scope>';
        for (let key of scopePath) {
            if (!(key in scope)) {
                throw `[DevBox][getValueFromScopePath] "${key}" not found in "${lastKey}"`;
            }
            lastKey = key;
            scope = scope[key];
        }
        return scope;
    }

    update () {
        if (this.stylesDirty) {
            _.extend(this.el.style, this.styles);
        }

        for (let sectionTitle in this.sections) {
            let section = this.sections[sectionTitle];
            if (section.onUpdate) {
                section.onUpdate(section);
            }
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
            onMounted: null,
            onUpdate: null,
            itemBuilder: null
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
            content: content,
            itemEls: [],
            itemBuilder: args.itemBuilder,
            onUpdate: args.onUpdate
        };
        if (args.onElBuilt) {
            args.onElBuilt(sectionEls);
        }

        this.contentEl.appendChild(section);
        if (args.onMounted) {
            args.onMounted(sectionEls);
        }

        this.sections[args.title] = sectionEls;
    }

    appendToSection(sectionTitle, item) {
        let section = this.sections[sectionTitle];
        if (section.itemBuilder) {
            item = section.itemBuilder(item, section);
        }
        section.content.appendChild(item);
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