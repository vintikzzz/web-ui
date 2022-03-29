import Vue from 'vue';
import MarkdownIt from 'markdown-it';
let inited = false;
export default function() {
  if (inited) return;
  inited = true;
  const md = new MarkdownIt();
  Object.defineProperty(Vue.prototype, '$tm', {
    get() {
      return (...args) => {
        return md.renderInline(this.$t(...args));
      };
    },
  });
};
