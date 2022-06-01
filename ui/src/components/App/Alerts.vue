<template>
  <div class="alerts">
    <wrong-format />
    <abused />
    <delivery-failure />
    <load />
    <download />
    <ad-block />
    <api-unreachable />
    <zip />
  </div>
</template>

<style scoped>
.alerts {
  padding: 0px;
}
p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
.alert {
  border-radius: 0px;
  margin-bottom: 0em;
}
</style>

<script>
import WrongFormat from './Alerts/WrongFormat.vue';
import DeliveryFailure from './Alerts/DeliveryFailure.vue';
import Load from './Alerts/Load.vue';
import Abused from './Alerts/Abused.vue';
import Download from './Alerts/Download.vue';
import AdBlock from './Alerts/AdBlock.vue';
import ApiUnreachable from './Alerts/ApiUnreachable.vue';
import Zip from './Alerts/Zip.vue';
export default {
  components: {WrongFormat, DeliveryFailure, Load, Download, Abused, AdBlock, Zip, ApiUnreachable},
};
</script>
