<template>
  <layout>
    <b-alert :show="this.status == 'success'" variant="success">{{ $tm('form.common.success') }}</b-alert>
    <b-alert :show="this.status == 'error'" variant="danger">{{ $tm('form.common.error') }}</b-alert>
    <b-alert :show="this.status == 'exists'" variant="warning">{{ $tm('form.support.error.exists') }}</b-alert>
    <b-alert :show="this.status == 'submitting'" variant="info">{{ $tm('form.common.submitting') }}</b-alert>
    <b-form @submit.stop.prevent="onSubmit" @reset.stop.prevent="onReset" v-if="show">
        <h1>{{ $tm('form.support.header') }}</h1>

        <b-form-group id="cause" :label="$tm('form.support.field.cause.label')" label-for="cause">
          <b-form-select
          id="cause"
          v-model="form.cause"
          :options="cause"
          required
          ></b-form-select>
        </b-form-group>

        <b-form-group
          id="subject-group"
          :label="$tm('form.support.field.subject.label')"
          label-for="subject"
        >
          <b-form-input
            id="subject"
            v-model="form.subject"
            required
            :placeholder="$tm('form.support.field.subject.placeholder')"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="description-group"
          :label="$tm('form.support.field.description.label')"
          label-for="description"
        >
          <b-form-textarea
            id="description"
            v-model="form.description"
            :placeholder="$tm('form.support.field.description.placeholder')"
            rows="3"
            max-rows="6"
            required
          ></b-form-textarea>
        </b-form-group>

        <b-form-group
          v-if="!isQuestion && hasCause"
          id="infohash-group"
          :label="$tm('form.support.field.infohash.label')"
          label-for="infohash"
        >
          <b-form-input
            id="infohash"
            v-model="form.infohash"
            required
            :state="this.infohashState"
            :placeholder="$tm('form.support.field.infohash.placeholder')"
            :formatter="infohashFormatter"
          ></b-form-input>
          <b-form-invalid-feedback id="infohash-feedback">
            {{ $tm('form.support.field.infohash.error') }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          v-if="!isQuestion && hasCause"
          id="filename-group"
          :label="$tm('form.support.field.filename.label')"
          label-for="filename"
        >
          <b-form-input
            id="filename"
            v-model="form.filename"
            :placeholder="$tm('form.support.field.filename.placeholder')"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="email-group"
          :label="$tm('form.support.field.email.label')"
          label-for="email"
        >
          <b-form-input
            id="email"
            v-model="form.email"
            type="email"
            required
            :placeholder="$tm('form.support.field.email.placeholder')"
          ></b-form-input>
        </b-form-group>

        <b-form-group v-if="isIllegal"
        id="work-group"
        :label="$tm('form.support.field.work.label')"
        label-for="work"
        >
          <b-form-input
            id="work"
            v-model="form.work"
            required
            :placeholder="$tm('form.support.field.work.placeholder')"
          ></b-form-input>
        </b-form-group>

        <div class="buttons">
          <b-button type="submit" :disabled="isSubmitting" variant="primary">{{ $tm('form.common.button.submit') }}</b-button>
          <b-button type="reset" variant="danger">{{ $tm('form.common.button.reset') }}</b-button>
        </div>
    </b-form>
  </layout>
</template>

<style lang="scss" scoped>
h1 {
  padding-bottom: 1rem;
}
form {
  margin-bottom: 2rem;
}

</style>

<script>
import Layout from './Layouts/Default.vue';
export default {
  components: {Layout},
  data() {
    return {
      form: {
        subject:     '',
        description: '',
        infohash:    '',
        filename:    '',
        email:       '',
        work:        '',
        cause:       null,
      },
      // form: {
      //   subject:     'Test',
      //   description: 'Test',
      //   infohash:    'aaaaaa',
      //   filename:    'bbbbbb',
      //   email:       'pavel.tatarsky@gmail.com',
      //   work:        '',
      //   cause:       2,
      // },
      status: null,
      cause: [
          { text: this.$tm('form.support.field.cause.option.none'),     value: null },
          { text: this.$tm('form.support.field.cause.option.illegal'),  value: 0 },
          { text: this.$tm('form.support.field.cause.option.malware'),  value: 1 },
          { text: this.$tm('form.support.field.cause.option.error'),    value: 2 },
          { text: this.$tm('form.support.field.cause.option.question'), value: 3 },
      ],
      show: true
    }
  },
  computed: {
      isIllegal() {
          return this.form.cause == 0;
      },
      isQuestion() {
          return this.form.cause == 3;
      },
      hasCause() {
          return this.form.cause != null;
      },
      infohashState() {
        if (this.form.infohash == "") return true;
        return /[0-9a-f]{5,40}/.test(this.form.infohash);
      },
      isSucceess() {
        return this.status != 'success';
      },
      isSubmitting() {
        return this.status == 'submitting';
      },
      isValid() {
        if (this.isQuestion) return true;
        return this.infohashState;
      }
  },
  methods: {
    infohashFormatter(value) {
      return value.toLowerCase();
    },
    async onSubmit(evt) {
      if (this.status != null || !this.isValid) return;
      const {dispatch} = this.$store;
      this.status = 'submitting';
      this.form.infohash = this.form.infohash
      try {
        await dispatch('pushAbuse', this.form);
        this.status = 'success';
        this.show = false;
      } catch(e) {
        if (e == 6) {
          this.status = 'exists';
          this.show = false;
        } else {
          this.status = 'error';
        }
      }
    },
    onReset(evt) {
      evt.preventDefault()
      // Reset our form values
      this.form.subject     = '';
      this.form.description = '';
      this.form.infohash    = '';
      this.form.filename    = '';
      this.form.email       = '';
      this.form.work        = '';
      this.form.cause       = null;
      // Trick to reset/clear native browser form validation state
      this.show   = false;
      this.$nextTick(() => {
        this.show = true;
      })
      this.status = null;
    }
  },
  metaInfo() {
    return {
      title: this.$t('form.support.header'),
    };
  },
}
</script>