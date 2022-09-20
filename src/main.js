import { createApp, defineCustomElement, getCurrentInstance, h } from 'vue'
import App from './App.vue'

const nearestElement = (el) => {
  while (el?.nodeType !== 1 /* ELEMENT */) el = el.parentElement
  return el
}

export const defineCustomElementWrapped = (component, { plugins = [] } = {}) =>
  defineCustomElement({
    render: () => h(component),
    styles: component.styles,
    setup() {
      const app = createApp()

      // install plugins
      plugins.forEach(app.use)

      // install styles
      app.mixin({
        mounted() {
          const insertStyles = (styles) => {
            if (styles?.length) {
              this.__style = document.createElement('style')
              this.__style.innerText = styles.join().replace(/\n/g, '')
              nearestElement(this.$el).prepend(this.__style)
            }
          }

          console.log(this.$?.type.styles)

          insertStyles(this.$?.type.styles)
          if (this.$options.components) {
            for (const comp of Object.values(this.$options.components)) {
              insertStyles(comp.styles)
              console.log(comp.styles)
            }
          }
        },
        unmounted() {
          this.__style?.remove()
        },
      })

      const inst = getCurrentInstance()
      Object.assign(inst.appContext, app._context)
      Object.assign(inst.provides, app._context.provides)
    },
  })

customElements.define(
  'app-root',
  defineCustomElementWrapped(App, {
    plugins: [],
  })
)
