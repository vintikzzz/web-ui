<template>
  <b-alert variant="danger" :show="message !== false" dismissible
  @dismissed="clearDeliveryFailure" v-html="message ? message : ''">
  </b-alert>
</template>

<script>
const numeral = require('numeral');
import {mapState} from 'vuex';
import {CLEAR_DELIVERY_FAILURE} from '../../../lib/store/mutationTypes';
export default {
  computed: {
    ...mapState({
      message(state) {
        if (!state.deliveryFailure) return false;
        let message = this.$tm(`errors.${state.deliveryFailure.message}`);
        const data = state.deliveryFailure.data;
        if (data) {
          for (const key in data) {
            let val = data[key];
            if (key.endsWith('Size')) {
              val = numeral(val).format('0b');
            }
            message = message.replace('{{' + key + '}}', val);
          }
        }
        return message;
      }
    }),
  },
  methods: {
    clearDeliveryFailure(e) {
      this.$store.commit(CLEAR_DELIVERY_FAILURE);
    }
  }
}
</script>
